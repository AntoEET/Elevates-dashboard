/**
 * Calculate Customer Lifetime Value (LTV)
 * LTV = (ARPU * Gross Margin) / Churn Rate
 */
export function calculateLTV(
  averageRevenuePerUser: number,
  grossMargin: number,
  churnRate: number
): number {
  if (churnRate === 0) {
    return Infinity; // No churn = infinite lifetime value
  }

  // Ensure churn rate is in decimal form (not percentage)
  const churnDecimal = churnRate > 1 ? churnRate / 100 : churnRate;

  return (averageRevenuePerUser * (grossMargin / 100)) / churnDecimal;
}

/**
 * Calculate LTV using customer lifespan
 * LTV = ARPU * Gross Margin * Average Customer Lifespan (months)
 */
export function calculateLTVByLifespan(
  averageRevenuePerUser: number,
  grossMargin: number,
  averageLifespanMonths: number
): number {
  return averageRevenuePerUser * (grossMargin / 100) * averageLifespanMonths;
}

/**
 * Calculate LTV:CAC ratio
 */
export function calculateLTVCACRatio(ltv: number, cac: number): number {
  if (cac === 0) {
    return Infinity;
  }

  return ltv / cac;
}

/**
 * Calculate average customer lifespan from churn rate
 */
export function calculateAverageLifespan(churnRate: number): number {
  if (churnRate === 0) {
    return Infinity;
  }

  // Ensure churn rate is in decimal form
  const churnDecimal = churnRate > 1 ? churnRate / 100 : churnRate;

  // Average lifespan = 1 / monthly churn rate
  return 1 / churnDecimal;
}

/**
 * Analyze LTV health
 */
export function analyzeLTVHealth(
  ltv: number,
  cac: number,
  industry: 'saas' | 'ecommerce' | 'other' = 'saas'
): {
  ltvCacRatio: number;
  isHealthy: boolean;
  benchmark: string;
  recommendation: string;
} {
  const ratio = calculateLTVCACRatio(ltv, cac);

  // SaaS benchmark: LTV:CAC should be 3:1 or higher
  const healthyThreshold = industry === 'saas' ? 3 : 2;

  const isHealthy = ratio >= healthyThreshold;

  let recommendation: string;
  if (ratio >= 5) {
    recommendation = 'Outstanding unit economics. Consider investing more in customer acquisition.';
  } else if (ratio >= 3) {
    recommendation = 'Strong unit economics. Business model is sustainable.';
  } else if (ratio >= 2) {
    recommendation = 'Acceptable unit economics, but there is room for improvement.';
  } else if (ratio >= 1) {
    recommendation = 'Concerning unit economics. Focus on increasing LTV or reducing CAC.';
  } else {
    recommendation = 'Critical: Business is losing money on each customer. Immediate action required.';
  }

  return {
    ltvCacRatio: ratio,
    isHealthy,
    benchmark: industry === 'saas' ? '3:1 (SaaS industry standard)' : '2:1',
    recommendation,
  };
}

/**
 * Calculate expansion LTV (accounts for upsells and expansions)
 */
export function calculateExpansionLTV(
  baseLTV: number,
  expansionRate: number
): number {
  // Expansion rate as decimal (e.g., 0.15 for 15% expansion)
  const expansionDecimal = expansionRate > 1 ? expansionRate / 100 : expansionRate;

  return baseLTV * (1 + expansionDecimal);
}

/**
 * Project LTV over time with expansion
 */
export function projectLTVWithExpansion(
  initialARPU: number,
  grossMargin: number,
  churnRate: number,
  monthlyExpansionRate: number,
  months: number
): number {
  let totalValue = 0;
  let currentARPU = initialARPU;

  const churnDecimal = churnRate > 1 ? churnRate / 100 : churnRate;
  const expansionDecimal = monthlyExpansionRate > 1 ? monthlyExpansionRate / 100 : monthlyExpansionRate;
  const retentionRate = 1 - churnDecimal;

  for (let month = 0; month < months; month++) {
    // Add value from surviving customers
    const survivalProbability = Math.pow(retentionRate, month);
    totalValue += currentARPU * (grossMargin / 100) * survivalProbability;

    // Account for expansion
    currentARPU *= 1 + expansionDecimal;
  }

  return totalValue;
}
