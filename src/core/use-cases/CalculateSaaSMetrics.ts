import type { SaaSMetrics } from '@/shared/schemas/finance';
import { getCurrentPeriod } from '@/shared/lib/date-helpers';

/**
 * Calculate comprehensive SaaS metrics
 */
export function calculateSaaSMetrics(params: {
  cac: number;
  ltv: number;
  newMRR: number;
  expansionMRR: number;
  contractionMRR: number;
  churnedMRR: number;
  previousMRR: number;
  revenueGrowthRate: number;
  ebitdaMargin: number;
  salesMarketingExpenses: number;
}): SaaSMetrics {
  const {
    cac,
    ltv,
    newMRR,
    expansionMRR,
    contractionMRR,
    churnedMRR,
    previousMRR,
    revenueGrowthRate,
    ebitdaMargin,
    salesMarketingExpenses,
  } = params;

  // LTV:CAC Ratio
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;

  // Magic Number
  const magicNumber = calculateMagicNumber(newMRR, salesMarketingExpenses);

  // Rule of 40
  const ruleOf40 = calculateRuleOf40(revenueGrowthRate, ebitdaMargin);

  // Net Revenue Retention (NRR)
  const nrr = calculateNRR(previousMRR, expansionMRR, contractionMRR, churnedMRR);

  // Gross Revenue Retention (GRR)
  const grr = calculateGRR(previousMRR, contractionMRR, churnedMRR);

  // Quick Ratio
  const quickRatio = calculateQuickRatio(newMRR, expansionMRR, contractionMRR, churnedMRR);

  return {
    cac,
    ltv,
    ltvCacRatio,
    magicNumber,
    ruleOf40,
    nrr,
    grr,
    quickRatio,
    period: getCurrentPeriod(),
    calculatedAt: new Date(),
  };
}

/**
 * Calculate Magic Number
 * Magic Number = Net New ARR / Sales & Marketing Spend (previous quarter)
 * Measures sales efficiency
 */
export function calculateMagicNumber(
  netNewMRR: number,
  salesMarketingSpend: number
): number {
  if (salesMarketingSpend === 0) {
    return 0;
  }

  // Convert MRR to ARR
  const netNewARR = netNewMRR * 12;

  return netNewARR / salesMarketingSpend;
}

/**
 * Analyze Magic Number health
 */
export function analyzeMagicNumber(
  magicNumber: number
): {
  isHealthy: boolean;
  rating: 'excellent' | 'good' | 'acceptable' | 'poor';
  recommendation: string;
} {
  if (magicNumber >= 1.0) {
    return {
      isHealthy: true,
      rating: 'excellent',
      recommendation:
        'Excellent sales efficiency. Every $1 spent on sales/marketing generates $1+ in ARR.',
    };
  }

  if (magicNumber >= 0.75) {
    return {
      isHealthy: true,
      rating: 'good',
      recommendation: 'Good sales efficiency. Strong unit economics for a growth company.',
    };
  }

  if (magicNumber >= 0.5) {
    return {
      isHealthy: true,
      rating: 'acceptable',
      recommendation: 'Acceptable efficiency, but there is room for improvement.',
    };
  }

  return {
    isHealthy: false,
    rating: 'poor',
    recommendation:
      'Low sales efficiency. Consider optimizing go-to-market strategy or reducing CAC.',
  };
}

/**
 * Calculate Rule of 40
 * Rule of 40 = Revenue Growth Rate (%) + EBITDA Margin (%)
 * Score >= 40 is considered healthy for SaaS companies
 */
export function calculateRuleOf40(
  revenueGrowthRate: number,
  ebitdaMargin: number
): number {
  return revenueGrowthRate + ebitdaMargin;
}

/**
 * Analyze Rule of 40 health
 */
export function analyzeRuleOf40(
  ruleOf40: number
): {
  isHealthy: boolean;
  rating: 'excellent' | 'good' | 'below_target';
  recommendation: string;
} {
  if (ruleOf40 >= 40) {
    return {
      isHealthy: true,
      rating: 'excellent',
      recommendation:
        'Excellent balance of growth and profitability. Meeting the Rule of 40 benchmark.',
    };
  }

  if (ruleOf40 >= 25) {
    return {
      isHealthy: true,
      rating: 'good',
      recommendation:
        'Good performance, but below Rule of 40 target. Consider optimizing for growth or profitability.',
    };
  }

  return {
    isHealthy: false,
    rating: 'below_target',
    recommendation:
      'Below Rule of 40 target. Focus on accelerating growth or improving margins.',
  };
}

/**
 * Calculate Net Revenue Retention (NRR)
 * NRR = ((Starting MRR + Expansion - Contraction - Churn) / Starting MRR) * 100
 */
export function calculateNRR(
  startingMRR: number,
  expansionMRR: number,
  contractionMRR: number,
  churnedMRR: number
): number {
  if (startingMRR === 0) {
    return 0;
  }

  const endingMRR = startingMRR + expansionMRR - contractionMRR - churnedMRR;
  return (endingMRR / startingMRR) * 100;
}

/**
 * Analyze NRR health
 */
export function analyzeNRR(
  nrr: number
): {
  isHealthy: boolean;
  rating: 'world_class' | 'excellent' | 'good' | 'acceptable' | 'poor';
  recommendation: string;
} {
  if (nrr >= 120) {
    return {
      isHealthy: true,
      rating: 'world_class',
      recommendation:
        'World-class NRR. Expansion revenue more than offsets churn. This is exceptional.',
    };
  }

  if (nrr >= 110) {
    return {
      isHealthy: true,
      rating: 'excellent',
      recommendation: 'Excellent NRR. Strong expansion and low churn indicate product-market fit.',
    };
  }

  if (nrr >= 100) {
    return {
      isHealthy: true,
      rating: 'good',
      recommendation: 'Good NRR. Expansion roughly offsets churn. Room to improve.',
    };
  }

  if (nrr >= 90) {
    return {
      isHealthy: false,
      rating: 'acceptable',
      recommendation:
        'Acceptable but below ideal. Focus on reducing churn or increasing expansion revenue.',
    };
  }

  return {
    isHealthy: false,
    rating: 'poor',
    recommendation:
      'Low NRR indicates high churn and low expansion. Immediate attention required.',
  };
}

/**
 * Calculate Gross Revenue Retention (GRR)
 * GRR = ((Starting MRR - Contraction - Churn) / Starting MRR) * 100
 */
export function calculateGRR(
  startingMRR: number,
  contractionMRR: number,
  churnedMRR: number
): number {
  if (startingMRR === 0) {
    return 0;
  }

  const retainedMRR = startingMRR - contractionMRR - churnedMRR;
  return (retainedMRR / startingMRR) * 100;
}

/**
 * Calculate Quick Ratio
 * Quick Ratio = (New MRR + Expansion MRR) / (Contraction MRR + Churned MRR)
 * Measures growth efficiency
 */
export function calculateQuickRatio(
  newMRR: number,
  expansionMRR: number,
  contractionMRR: number,
  churnedMRR: number
): number {
  const denominator = contractionMRR + churnedMRR;

  if (denominator === 0) {
    return Infinity; // Perfect - no churn or contraction
  }

  return (newMRR + expansionMRR) / denominator;
}

/**
 * Analyze Quick Ratio health
 */
export function analyzeQuickRatio(
  quickRatio: number
): {
  isHealthy: boolean;
  rating: 'excellent' | 'good' | 'acceptable' | 'poor';
  recommendation: string;
} {
  if (quickRatio >= 4) {
    return {
      isHealthy: true,
      rating: 'excellent',
      recommendation: 'Excellent growth efficiency. Adding revenue 4x faster than losing it.',
    };
  }

  if (quickRatio >= 2) {
    return {
      isHealthy: true,
      rating: 'good',
      recommendation: 'Good growth efficiency. Healthy balance of acquisition and retention.',
    };
  }

  if (quickRatio >= 1) {
    return {
      isHealthy: true,
      rating: 'acceptable',
      recommendation: 'Growth slightly outpacing churn, but there is room for improvement.',
    };
  }

  return {
    isHealthy: false,
    rating: 'poor',
    recommendation: 'Losing revenue faster than gaining. Focus on retention and expansion.',
  };
}

/**
 * Calculate monthly churn rate
 */
export function calculateMonthlyChurnRate(
  churnedCustomers: number,
  startingCustomers: number
): number {
  if (startingCustomers === 0) {
    return 0;
  }

  return (churnedCustomers / startingCustomers) * 100;
}

/**
 * Calculate annual churn rate from monthly
 */
export function calculateAnnualChurnRate(monthlyChurnRate: number): number {
  // Annual churn = 1 - (1 - monthly churn)^12
  const monthlyRetention = 1 - monthlyChurnRate / 100;
  const annualRetention = Math.pow(monthlyRetention, 12);
  return (1 - annualRetention) * 100;
}

/**
 * Calculate revenue churn rate
 */
export function calculateRevenueChurnRate(
  churnedMRR: number,
  startingMRR: number
): number {
  if (startingMRR === 0) {
    return 0;
  }

  return (churnedMRR / startingMRR) * 100;
}

/**
 * Calculate expansion revenue rate
 */
export function calculateExpansionRate(
  expansionMRR: number,
  startingMRR: number
): number {
  if (startingMRR === 0) {
    return 0;
  }

  return (expansionMRR / startingMRR) * 100;
}
