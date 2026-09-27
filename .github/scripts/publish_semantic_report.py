#!/usr/bin/env python3
"""Publish a rich, table-and-annotations CodeIntent check run.

The Lambda's own "CodeIntent Drift Gate" check run (created by CodeIntent's
GitHub App) carries the authoritative pass/fail verdict but a single dense
paragraph for output.summary -- no table, no per-finding detail, no
annotations. We don't own that check run (a different GitHub App created
it) so this doesn't touch it; instead it publishes a second, purely
informational check run from this repo's own GITHUB_TOKEN, built from the
same structured /status payload the live-status page already renders
(analysis.changes[]: concept/file/line/kind/reason), with:
  - a markdown table (one row per governed-behavior finding)
  - shields.io badges for the verdict/magnitude/kind, since GitHub's
    check-run markdown sanitizes out inline styles/colored boxes
  - native GitHub annotations, so each finding also shows up inline on the
    exact line in the PR's "Files changed" diff view
"""
import argparse
import json
import subprocess
import urllib.request

CONCLUSION_BY_VERDICT = {"PASS": "success", "VIOLATION": "failure", "REVIEW": "neutral", "UNKNOWN": "neutral"}
BADGE_COLOR_BY_VERDICT = {"PASS": "brightgreen", "VIOLATION": "red", "REVIEW": "yellow", "UNKNOWN": "lightgrey"}
BADGE_COLOR_BY_KIND = {"removed": "red", "changed": "orange", "added": "yellow"}
BADGE_COLOR_BY_MAGNITUDE = {"HIGH": "red", "MEDIUM": "orange", "LOW": "yellow"}
ANNOTATION_LEVEL_BY_KIND = {"removed": "failure", "changed": "failure", "added": "warning"}
MAX_ANNOTATIONS = 50  # GitHub's per-request cap


def fetch_status(status_api: str, sha: str) -> dict:
    url = status_api.rstrip("/") + "/status?sha=" + sha
    with urllib.request.urlopen(url, timeout=15) as r:
        return json.loads(r.read())


def badge(label: str, message: str, color: str) -> str:
    enc = lambda s: str(s).replace(" ", "%20").replace("-", "--")
    alt = f"{label}: {message}" if label else str(message)  # the value alone must still be readable without the image
    return f"![{alt}](https://img.shields.io/badge/{enc(label)}-{enc(message)}-{color})"


def link_button(text: str, url: str, color: str) -> str:
    """A big, single-segment badge acting as a button -- plain markdown links
    render as small, easy-to-miss text in a check run's sanitized output;
    style=for-the-badge is the one thing that actually makes a link bigger
    and more noticeable there."""
    enc = lambda s: str(s).replace(" ", "%20").replace("-", "--")
    img = f"https://img.shields.io/badge/{enc(text)}-{color}?style=for-the-badge"
    return f"[![{text}]({img})]({url})"


def blob_url(repo: str, sha: str, file: str, line) -> str:
    url = f"https://github.com/{repo}/blob/{sha}/{file}"
    return url + (f"#L{line}" if line is not None else "")


def build_summary(repo: str, sha: str, live_url: str, status: dict) -> str:
    verdict = status.get("verdict") or "UNKNOWN"
    magnitude = status.get("magnitude")
    reason = status.get("reason") or ""
    changes = ((status.get("analysis") or {}).get("changes")) or []

    lines = [
        badge("verdict", verdict, BADGE_COLOR_BY_VERDICT.get(verdict, "lightgrey"))
        + (" " + badge("magnitude", magnitude, BADGE_COLOR_BY_MAGNITUDE.get(magnitude, "lightgrey")) if magnitude else ""),
        "",
    ]
    if reason:
        lines += ["> " + reason, ""]

    if changes:
        lines += ["| Rule | Kind | Location | Reason |", "| --- | --- | --- | --- |"]
        for c in changes:
            rule = c.get("concept") or "—"
            if c.get("idiom"):
                rule += f" · `{c['idiom']}`"
            kind = c.get("kind") or "—"
            kind_badge = badge("", kind, BADGE_COLOR_BY_KIND.get(kind, "lightgrey"))
            file, line = c.get("file"), c.get("line")
            loc = f"[{file.split('/')[-1]}:{line}]({blob_url(repo, sha, file, line)})" if file else "—"
            lines.append(f"| {rule} | {kind_badge} | {loc} | {c.get('reason') or ''} |")
    else:
        lines.append("No governed behavior changes detected.")

    lines.append("")
    links = [link_button("🛰️ Live governance view", live_url, "0c94a6")]
    if status.get("repo"):
        owner, name = status["repo"].split("/")
        links.append(link_button("📖 Rule Atlas", f"https://{owner}.github.io/{name}/rules/", "6e5494"))
    if status.get("check_run_url"):
        links.append(link_button("✅ View the PR check", status["check_run_url"], "2ea44f"))
    cis = status.get("cis") or {}
    if cis.get("review_url"):
        links.append(link_button("📄 Full semantic report", cis["review_url"], "586069"))
    lines.append(" ".join(links))
    return "\n".join(lines)


def build_text(status: dict) -> str:
    a = status.get("analysis") or {}
    if a.get("n_behaviors") is None and not a.get("files_analyzed"):
        return ""
    n_files = len(a.get("files_analyzed") or [])
    return (f"Compared **{a.get('n_behaviors', '—')}** governed behavior(s) "
            f"across **{n_files}** analyzed file(s).")


def build_annotations(repo: str, sha: str, changes: list) -> list:
    out = []
    for c in changes:
        file, line = c.get("file"), c.get("line")
        if not file or line is None:
            continue
        out.append({
            "path": file,
            "start_line": line,
            "end_line": line,
            "annotation_level": ANNOTATION_LEVEL_BY_KIND.get(c.get("kind"), "notice"),
            "title": c.get("concept") or "CodeIntent finding",
            "message": c.get("reason") or "Governed behavior changed.",
        })
    return out[:MAX_ANNOTATIONS]


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--repo", required=True)
    p.add_argument("--sha", required=True)
    p.add_argument("--status-api", required=True, dest="status_api")
    p.add_argument("--live-url", required=True, dest="live_url")
    args = p.parse_args()

    status = fetch_status(args.status_api, args.sha)
    verdict = status.get("verdict") or "UNKNOWN"
    changes = ((status.get("analysis") or {}).get("changes")) or []
    n = len(changes)

    payload = {
        "name": "CodeIntent Semantic Report",
        "head_sha": args.sha,
        "status": "completed",
        "conclusion": CONCLUSION_BY_VERDICT.get(verdict, "neutral"),
        "output": {
            "title": f"{verdict} — {n} finding{'' if n == 1 else 's'}" if changes else f"{verdict} — clean",
            "summary": build_summary(args.repo, args.sha, args.live_url, status),
            "text": build_text(status),
            "annotations": build_annotations(args.repo, args.sha, changes),
        },
    }
    subprocess.run(
        ["gh", "api", "-X", "POST", f"repos/{args.repo}/check-runs", "--input", "-"],
        input=json.dumps(payload), text=True, check=True,
    )


if __name__ == "__main__":
    main()
