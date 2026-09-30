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
import { describe, expect, it } from "vitest";

import { initialTransactionReviewState, reviewContract } from "./semanticContract";

describe("portfolio transaction review semantic contract", () => {
    it("locks the finance controls, defaults, and local-only action", () => {
        expect(reviewContract).toMatchObject({
            behavior: "local-review-only",
            id: "portfolio-transaction-review-v1",
        });
        expect(initialTransactionReviewState).toMatchObject({
            amount: "250.00",
            businessDate: "2026-09-30",
            currency: "USD",
            paymentChannel: "CASH",
            transactionType: "REPAYMENT",
        });
        expect(reviewContract.controls.transactionType.options.map((option) => option.value)).toEqual([
            "REPAYMENT",
            "FEE_PAYMENT",
            "INTEREST_WAIVER",
            "WRITE_OFF",
        ]);
        expect(reviewContract.controls.amount).toMatchObject({ min: "0.01", required: true, step: "0.01" });
        expect(reviewContract.controls.reviewAction.effect).toBe("local-review-only");
    });
});
