import type { Transaction, CashFlow } from '@/shared/schemas/finance';

/**
 * Calculate monthly burn rate from transactions
 * Burn rate = Cash Out - Cash In (negative = burning cash)
 */
export function calculateBurnRate(transactions: Transaction[]): CashFlow {
  const income = transactions.filter((t) => t.type === 'income');
  const expenses = transactions.filter((t) => t.type === 'expense');

  const cashIn = sumTransactions(income);
  const cashOut = sumTransactions(expenses);

  const beginningBalance = 0; // Would need to fetch from previous period
  const endingBalance = beginningBalance + cashIn - cashOut;
  const burnRate = cashOut - cashIn;

  return {
    beginningBalance,
    cashIn,
    cashOut,
    endingBalance,
    burnRate,
    runway: 0, // Calculated separately with current cash balance
    period: '', // Set by caller
    calculatedAt: new Date(),
  };
}

/**
 * Sum transaction amounts (converted to base currency)
 */
function sumTransactions(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amountInBaseCurrency, 0);
}

/**
 * Calculate net burn rate (excluding one-time items)
 */
export function calculateNetBurnRate(
  cashIn: number,
  cashOut: number,
  oneTimeRevenue: number = 0,
  oneTimeExpenses: number = 0
): number {
  const recurringCashIn = cashIn - oneTimeRevenue;
  const recurringCashOut = cashOut - oneTimeExpenses;

  return recurringCashOut - recurringCashIn;
}

/**
 * Calculate gross burn rate (total cash out)
 */
export function calculateGrossBurnRate(transactions: Transaction[]): number {
  const expenses = transactions.filter((t) => t.type === 'expense');
  return sumTransactions(expenses);
}

/**
 * Analyze burn rate trend over multiple periods
 */
export function analyzeBurnRateTrend(
  burnRates: Array<{ period: string; burnRate: number }>
): {
  trend: 'increasing' | 'decreasing' | 'stable';
  averageBurnRate: number;
  burnRateChange: number;
  recommendation: string;
} {
  if (burnRates.length < 2) {
    return {
      trend: 'stable',
      averageBurnRate: burnRates[0]?.burnRate || 0,
      burnRateChange: 0,
      recommendation: 'Need more historical data to analyze trend.',
    };
  }

  const averageBurnRate =
    burnRates.reduce((sum, br) => sum + br.burnRate, 0) / burnRates.length;

  const firstHalf = burnRates.slice(0, Math.floor(burnRates.length / 2));
  const secondHalf = burnRates.slice(Math.floor(burnRates.length / 2));

  const firstHalfAvg =
    firstHalf.reduce((sum, br) => sum + br.burnRate, 0) / firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, br) => sum + br.burnRate, 0) / secondHalf.length;

  const burnRateChange =
    firstHalfAvg !== 0 ? ((secondHalfAvg - firstHalfAvg) / Math.abs(firstHalfAvg)) * 100 : 0;

  let trend: 'increasing' | 'decreasing' | 'stable';
  let recommendation: string;

  if (Math.abs(burnRateChange) < 10) {
    trend = 'stable';
    recommendation = 'Burn rate is stable. Monitor for any significant changes.';
  } else if (burnRateChange > 0) {
    trend = 'increasing';
    recommendation =
      'Warning: Burn rate is increasing. Review expenses and consider cost optimization.';
  } else {
    trend = 'decreasing';
    recommendation = 'Positive: Burn rate is decreasing. Improving cash efficiency.';
  }

  return {
    trend,
    averageBurnRate,
    burnRateChange,
    recommendation,
  };
}

/**
 * Calculate burn multiple (Burn Rate / Net New ARR)
 * Lower is better - measures capital efficiency
 */
export function calculateBurnMultiple(burnRate: number, netNewARR: number): number {
  if (netNewARR === 0) {
    return Infinity; // Burning cash without adding ARR
  }

  // Use absolute value of burn rate (positive number)
  return Math.abs(burnRate) / netNewARR;
}

/**
 * Analyze burn multiple health
 */
export function analyzeBurnMultiple(
  burnMultiple: number
): {
  isHealthy: boolean;
  rating: 'excellent' | 'good' | 'acceptable' | 'poor' | 'critical';
  recommendation: string;
} {
  if (burnMultiple < 1) {
    return {
      isHealthy: true,
      rating: 'excellent',
      recommendation:
        'Outstanding capital efficiency. You are generating more ARR than you are burning.',
    };
  }

  if (burnMultiple < 1.5) {
    return {
      isHealthy: true,
      rating: 'good',
      recommendation: 'Good capital efficiency. Sustainable burn rate for growth.',
    };
  }

  if (burnMultiple < 2) {
    return {
      isHealthy: true,
      rating: 'acceptable',
      recommendation: 'Acceptable burn multiple, but there is room for improvement.',
    };
  }

  if (burnMultiple < 3) {
    return {
      isHealthy: false,
      rating: 'poor',
      recommendation:
        'High burn multiple. Consider optimizing spend or accelerating revenue growth.',
    };
  }

  return {
    isHealthy: false,
    rating: 'critical',
    recommendation:
      'Critical burn multiple. Immediate action required to reduce burn or increase revenue.',
  };
}

/**
 * Project burn rate based on planned spending
 */
export function projectBurnRate(
  currentBurnRate: number,
  plannedHires: number,
  averageSalary: number,
  plannedMarketingIncrease: number,
  otherExpenseChanges: number = 0
): number {
  const hiringCost = plannedHires * averageSalary;
  return currentBurnRate + hiringCost + plannedMarketingIncrease + otherExpenseChanges;
}
