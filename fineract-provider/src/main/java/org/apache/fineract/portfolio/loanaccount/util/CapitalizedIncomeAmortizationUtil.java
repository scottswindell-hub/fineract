/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package org.apache.fineract.portfolio.loanaccount.util;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import org.apache.fineract.infrastructure.core.service.DateUtils;
import org.apache.fineract.infrastructure.core.service.MathUtil;
import org.apache.fineract.organisation.monetary.domain.MonetaryCurrency;
import org.apache.fineract.organisation.monetary.domain.Money;
import org.apache.fineract.organisation.monetary.domain.MoneyHelper;
import org.apache.fineract.portfolio.loanaccount.domain.LoanCapitalizedIncomeBalance;
import org.apache.fineract.portfolio.loanaccount.domain.LoanCapitalizedIncomeStrategy;
import org.apache.fineract.portfolio.loanaccount.domain.LoanTransaction;

public final class CapitalizedIncomeAmortizationUtil {

    private CapitalizedIncomeAmortizationUtil() {}

    public static Money calculateTotalAmortizationTillDate(final LoanCapitalizedIncomeBalance capitalizedIncomeBalance,
            final List<LoanTransaction> adjustmentTransactions, final LocalDate maturityDate,
            final LoanCapitalizedIncomeStrategy capitalizedIncomeStrategy, final LocalDate tillDate, final MonetaryCurrency currency) {
        return switch (capitalizedIncomeStrategy) {
            case EQUAL_AMORTIZATION -> calculateTotalAmortizationTillDateEqualAmortization(capitalizedIncomeBalance, adjustmentTransactions,
                    maturityDate, tillDate, currency);
        };
    }

    private static Money calculateTotalAmortizationTillDateEqualAmortization(LoanCapitalizedIncomeBalance balance,
            List<LoanTransaction> adjustmentTransactions, LocalDate maturityDate, LocalDate tillDate, MonetaryCurrency currency) {

        BigDecimal remaining = balance.getAmount();
        BigDecimal recognized = BigDecimal.ZERO;
        BigDecimal correction = BigDecimal.ZERO;

        final List<LoanTransaction> ordered = adjustmentTransactions.stream().sorted(Comparator.comparing(LoanTransaction::getDateOf))
                .toList();

        LocalDate cursor = balance.getDate();
        for (final LoanTransaction adjustment : ordered) {
            final BigDecimal slice = straightLineSlice(remaining, cursor, adjustment.getDateOf(), maturityDate);

            recognized = recognized.add(slice);
            remaining = remaining.subtract(slice).subtract(adjustment.getAmount());

            if (MathUtil.isLessThanZero(remaining)) {
                correction = correction.add(remaining);
                remaining = BigDecimal.ZERO;
            }
            cursor = adjustment.getDateOf();
        }

        if (cursor.isBefore(tillDate)) {
            recognized = recognized.add(straightLineSlice(remaining, cursor, tillDate, maturityDate));
        } else if (balance.getDate().equals(maturityDate)) {
            recognized = recognized.add(remaining);
        }

        return Money.of(currency, recognized.add(correction));
    }

    private static BigDecimal straightLineSlice(final BigDecimal remaining, final LocalDate from, final LocalDate to,
            final LocalDate maturityDate) {
        final long daysUntilMaturity = DateUtils.getDifferenceInDays(from, maturityDate);
        if (daysUntilMaturity == 0L) {
            return BigDecimal.ZERO;
        }
        final long daysOfPeriod = DateUtils.getDifferenceInDays(from, to);
        return remaining.multiply(BigDecimal.valueOf(daysOfPeriod)).divide(BigDecimal.valueOf(daysUntilMaturity),
                MoneyHelper.getMathContext());
    }
}
