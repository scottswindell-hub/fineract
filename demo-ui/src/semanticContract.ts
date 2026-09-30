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
export type SelectOption = {
    label: string;
    value: string;
};

export const reviewContract = {
    behavior: "local-review-only",
    controls: {
        amount: {
            defaultValue: "250.00",
            key: "transaction-amount",
            label: "Amount",
            min: "0.01",
            required: true,
            step: "0.01",
        },
        businessDate: {
            defaultValue: "2026-09-30",
            key: "transaction-date",
            label: "Business date",
            required: true,
        },
        currency: {
            defaultValue: "USD",
            key: "currency",
            label: "Currency",
            options: [
                { label: "USD — US Dollar", value: "USD" },
                { label: "KES — Kenyan Shilling", value: "KES" },
                { label: "INR — Indian Rupee", value: "INR" },
            ],
            required: true,
        },
        loanAccount: {
            defaultValue: "LN-000184",
            key: "loan-account",
            label: "Loan account",
            options: [
                { label: "LN-000184 — Amina Rahman — Microenterprise Loan", value: "LN-000184" },
                { label: "LN-000219 — David Okoro — Small Business Loan", value: "LN-000219" },
                { label: "LN-000326 — Mei Chen — Agriculture Loan", value: "LN-000326" },
            ],
            required: true,
        },
        paymentChannel: {
            defaultValue: "CASH",
            key: "payment-channel",
            label: "Payment channel",
            options: [
                { label: "Cash", value: "CASH" },
                { label: "Bank transfer", value: "BANK_TRANSFER" },
                { label: "Mobile money", value: "MOBILE_MONEY" },
            ],
            required: true,
        },
        referenceId: {
            defaultValue: "DEMO-REVIEW-184",
            key: "reference-id",
            label: "Reference ID",
            required: false,
        },
        reviewAction: {
            effect: "local-review-only",
            key: "review-transaction",
            label: "Review transaction",
        },
        transactionType: {
            defaultValue: "REPAYMENT",
            key: "transaction-type",
            label: "Transaction type",
            options: [
                { label: "Repayment", value: "REPAYMENT" },
                { label: "Fee payment", value: "FEE_PAYMENT" },
                { label: "Interest waiver", value: "INTEREST_WAIVER" },
                { label: "Write-off", value: "WRITE_OFF" },
            ],
            required: true,
        },
    },
    id: "portfolio-transaction-review-v1",
} as const;

export type TransactionReviewState = {
    amount: string;
    businessDate: string;
    currency: string;
    loanAccount: string;
    paymentChannel: string;
    referenceId: string;
    transactionType: string;
};

export const initialTransactionReviewState: TransactionReviewState = {
    amount: reviewContract.controls.amount.defaultValue,
    businessDate: reviewContract.controls.businessDate.defaultValue,
    currency: reviewContract.controls.currency.defaultValue,
    loanAccount: reviewContract.controls.loanAccount.defaultValue,
    paymentChannel: reviewContract.controls.paymentChannel.defaultValue,
    referenceId: reviewContract.controls.referenceId.defaultValue,
    transactionType: reviewContract.controls.transactionType.defaultValue,
};

export function labelForOption(options: readonly SelectOption[], value: string): string {
    return options.find((option) => option.value === value)?.label ?? "Not selected";
}
