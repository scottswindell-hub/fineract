/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { type FormEvent, type ReactNode, useState } from "react";

import { decorativeCopy } from "./decorativeCopy";
import {
    initialTransactionReviewState,
    labelForOption,
    reviewContract,
    type SelectOption,
    type TransactionReviewState,
} from "./semanticContract";

type SemanticFieldProps = {
    children: ReactNode;
    className?: string;
    semanticKey: string;
};

type ReviewSummaryProps = {
    completed: boolean;
    review: TransactionReviewState;
};

function SemanticField({ children, className = "", semanticKey }: SemanticFieldProps) {
    return (
        <div className={`form-field ${className}`} data-demo-role="semantic" data-semantic-key={semanticKey}>
            {children}
        </div>
    );
}

function SelectOptions({ options }: { options: readonly SelectOption[] }) {
    return options.map((option) => (
        <option key={option.value} value={option.value}>
            {option.label}
        </option>
    ));
}

function formatBusinessDate(value: string): string {
    if (value.length === 0) {
        return "Not selected";
    }

    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
        year: "numeric",
    }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatAmount(amount: string, currency: string): string {
    const parsedAmount = Number.parseFloat(amount);
    const displayedAmount = Number.isFinite(parsedAmount) ? parsedAmount.toFixed(2) : "0.00";
    return `${currency} ${displayedAmount}`;
}

function summaryAccountLabel(value: string): string {
    return labelForOption(reviewContract.controls.loanAccount.options, value).split(" — ").slice(0, 2).join(" — ");
}

function ReviewSummary({ completed, review }: ReviewSummaryProps) {
    const transactionType = labelForOption(reviewContract.controls.transactionType.options, review.transactionType);
    const paymentChannel = labelForOption(reviewContract.controls.paymentChannel.options, review.paymentChannel);

    return (
        <aside className="panel summary-panel" aria-labelledby="review-summary-heading" data-demo-role="semantic" data-semantic-key="review-summary">
            <div className="summary-header">
                <p className="section-kicker">Proposed entry</p>
                <h2 id="review-summary-heading">Review summary</h2>
                <p>Values update locally as controls change.</p>
            </div>
            <div className="summary-body">
                <div className="summary-amount">
                    <p className="metric-label">Transaction amount</p>
                    <output id="summary-amount">{formatAmount(review.amount, review.currency)}</output>
                </div>
                <dl className="summary-list">
                    <div className="summary-row">
                        <dt>Account</dt>
                        <dd id="summary-account">{summaryAccountLabel(review.loanAccount)}</dd>
                    </div>
                    <div className="summary-row">
                        <dt>Transaction</dt>
                        <dd id="summary-transaction-type">{transactionType}</dd>
                    </div>
                    <div className="summary-row">
                        <dt>Business date</dt>
                        <dd id="summary-date">{formatBusinessDate(review.businessDate)}</dd>
                    </div>
                    <div className="summary-row">
                        <dt>Payment channel</dt>
                        <dd id="summary-payment-channel">{paymentChannel}</dd>
                    </div>
                    <div className="summary-row">
                        <dt>Reference</dt>
                        <dd id="summary-reference">{review.referenceId.trim() || "Not provided"}</dd>
                    </div>
                </dl>
                <p aria-live="polite" className="summary-state" id="summary-state">
                    {completed ? "Review complete locally. No transaction is queued or saved." : "Ready for a local review. No transaction is queued."}
                </p>
            </div>
        </aside>
    );
}

export function PortfolioTransactionReview() {
    const [review, setReview] = useState(initialTransactionReviewState);
    const [completed, setCompleted] = useState(false);

    const updateField = (field: keyof TransactionReviewState, value: string) => {
        setReview((current) => ({ ...current, [field]: value }));
        setCompleted(false);
    };

    const completeLocalReview = () => {
        setCompleted(true);
    };

    const preventSubmission = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        completeLocalReview();
    };

    return (
        <div className="shell">
            <header className="masthead" data-demo-role="decorative">
                <div className="brand">
                    <div aria-hidden="true" className="brand-mark">
                        <span />
                    </div>
                    <div>
                        <p className="eyebrow">{decorativeCopy.brand}</p>
                        <h1>{decorativeCopy.headline}</h1>
                        <p className="subtitle">{decorativeCopy.subtitle}</p>
                    </div>
                </div>
                <span className="demo-tag">Demo workspace</span>
            </header>

            <main className="workspace">
                <section aria-label="Demo notice" className="notice" data-demo-role="informational">
                    <span aria-hidden="true" className="notice-icon">!</span>
                    <p><strong>Demo fixture only.</strong> No customer data is loaded and no transaction will be submitted or saved.</p>
                </section>

                <div className="headline-row" data-demo-role="decorative">
                    <div>
                        <p className="section-kicker">{decorativeCopy.sectionKicker}</p>
                        <h2>Review a proposed transaction</h2>
                    </div>
                    <p className="ledger-note">Preview mode · No live ledger connection</p>
                </div>

                <div className="content-grid">
                    <section className="panel form-panel" aria-labelledby="transaction-details-heading">
                        <form data-demo-behavior={reviewContract.behavior} data-demo-contract={reviewContract.id} id="transaction-review-form" noValidate onSubmit={preventSubmission}>
                            <fieldset>
                                <legend id="transaction-details-heading">Transaction details</legend>
                                <div className="field-grid">
                                    <SemanticField className="wide" semanticKey={reviewContract.controls.loanAccount.key}>
                                        <label className="field-label" htmlFor="loan-account">Loan account <span aria-hidden="true" className="required">*</span></label>
                                        <select id="loan-account" name="loanAccount" required value={review.loanAccount} onChange={(event) => updateField("loanAccount", event.target.value)}>
                                            <SelectOptions options={reviewContract.controls.loanAccount.options} />
                                        </select>
                                    </SemanticField>

                                    <SemanticField semanticKey={reviewContract.controls.transactionType.key}>
                                        <label className="field-label" htmlFor="transaction-type">Transaction type <span aria-hidden="true" className="required">*</span></label>
                                        <select id="transaction-type" name="transactionType" required value={review.transactionType} onChange={(event) => updateField("transactionType", event.target.value)}>
                                            <SelectOptions options={reviewContract.controls.transactionType.options} />
                                        </select>
                                    </SemanticField>

                                    <SemanticField semanticKey={reviewContract.controls.paymentChannel.key}>
                                        <label className="field-label" htmlFor="payment-channel">Payment channel <span aria-hidden="true" className="required">*</span></label>
                                        <select id="payment-channel" name="paymentChannel" required value={review.paymentChannel} onChange={(event) => updateField("paymentChannel", event.target.value)}>
                                            <SelectOptions options={reviewContract.controls.paymentChannel.options} />
                                        </select>
                                    </SemanticField>

                                    <SemanticField semanticKey={reviewContract.controls.amount.key}>
                                        <label className="field-label" htmlFor="transaction-amount">Amount <span aria-hidden="true" className="required">*</span></label>
                                        <div className="input-with-prefix">
                                            <span aria-hidden="true">{review.currency}</span>
                                            <input aria-describedby="amount-help" id="transaction-amount" min={reviewContract.controls.amount.min} name="transactionAmount" required step={reviewContract.controls.amount.step} type="number" value={review.amount} onChange={(event) => updateField("amount", event.target.value)} />
                                        </div>
                                        <p className="helper-text" id="amount-help">Amount is shown for review only.</p>
                                    </SemanticField>

                                    <SemanticField semanticKey={reviewContract.controls.currency.key}>
                                        <label className="field-label" htmlFor="currency">Currency <span aria-hidden="true" className="required">*</span></label>
                                        <select id="currency" name="currency" required value={review.currency} onChange={(event) => updateField("currency", event.target.value)}>
                                            <SelectOptions options={reviewContract.controls.currency.options} />
                                        </select>
                                    </SemanticField>

                                    <SemanticField semanticKey={reviewContract.controls.businessDate.key}>
                                        <label className="field-label" htmlFor="transaction-date">Business date <span aria-hidden="true" className="required">*</span></label>
                                        <input id="transaction-date" name="transactionDate" required type="date" value={review.businessDate} onChange={(event) => updateField("businessDate", event.target.value)} />
                                    </SemanticField>

                                    <SemanticField className="wide" semanticKey={reviewContract.controls.referenceId.key}>
                                        <label className="field-label" htmlFor="reference-id">Reference ID</label>
                                        <input id="reference-id" name="referenceId" type="text" value={review.referenceId} onChange={(event) => updateField("referenceId", event.target.value)} />
                                    </SemanticField>
                                </div>

                                <div className="actions">
                                    <p aria-live="polite" className="review-status" id="review-status">
                                        {completed ? "Review ready — demo only; nothing was submitted." : "Adjust the fields, then review the proposed transaction."}
                                    </p>
                                    <button className="button-primary" data-demo-role="semantic" data-semantic-key={reviewContract.controls.reviewAction.key} id="review-transaction" type="button" onClick={completeLocalReview}>
                                        {reviewContract.controls.reviewAction.label}
                                    </button>
                                </div>
                            </fieldset>
                        </form>
                    </section>

                    <ReviewSummary completed={completed} review={review} />
                </div>

                <section aria-label="Demo metrics" className="metrics" data-demo-role="decorative">
                    {decorativeCopy.metrics.map(([label, value]) => (
                        <div className="metric" key={label}>
                            <p className="metric-label">{label}</p>
                            <strong>{value}</strong>
                        </div>
                    ))}
                </section>

                <details className="change-guide">
                    <summary>About this change-detection demo fixture</summary>
                    <p>The masthead, visual accents, and metric cards are decorative. The account, transaction type, amount, currency, business date, payment channel, reference, review control, and mirrored summary are operationally meaningful UI. This page does not call an API or submit a financial transaction.</p>
                </details>
            </main>

            <footer className="page-footer" data-demo-role="decorative">{decorativeCopy.footer}</footer>
        </div>
    );
}
