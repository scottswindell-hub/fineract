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
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { PortfolioTransactionReview } from "./PortfolioTransactionReview";

describe("PortfolioTransactionReview", () => {
    afterEach(() => {
        cleanup();
    });

    it("renders the stable finance controls without assigning semantic keys to decorative content", () => {
        const { container } = render(<PortfolioTransactionReview />);

        expect(screen.getByRole("heading", { name: "Portfolio Operations" })).toBeVisible();
        expect(screen.getByLabelText(/^Transaction type/)).toHaveValue("REPAYMENT");
        expect(screen.getByLabelText(/^Currency/)).toHaveValue("USD");
        expect(screen.getByLabelText(/^Amount/)).toHaveValue(250);
        expect(screen.getByRole("button", { name: "Review transaction" })).toHaveAttribute("type", "button");
        expect(container.querySelectorAll('[data-demo-role="decorative"][data-semantic-key]')).toHaveLength(0);
    });

    it("updates the local summary and never turns review into submission", () => {
        const { container } = render(<PortfolioTransactionReview />);

        fireEvent.change(screen.getByLabelText(/^Transaction type/), { target: { value: "WRITE_OFF" } });
        fireEvent.change(screen.getByLabelText(/^Currency/), { target: { value: "KES" } });
        fireEvent.change(screen.getByLabelText(/^Amount/), { target: { value: "430.50" } });
        fireEvent.click(screen.getByRole("button", { name: "Review transaction" }));

        expect(container.querySelector("#summary-transaction-type")).toHaveTextContent("Write-off");
        expect(container.querySelector("#summary-amount")).toHaveTextContent("KES 430.50");
        expect(container.querySelector("#review-status")).toHaveTextContent("nothing was submitted");
        expect(container.querySelector("#summary-state")).toHaveTextContent("No transaction is queued or saved");
    });
});
