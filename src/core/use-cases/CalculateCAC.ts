/**
 * Calculate Customer Acquisition Cost (CAC)
 * CAC = Total Sales & Marketing Expenses / Number of New Customers Acquired
 */
export function calculateCAC(
  salesMarketingExpenses: number,
  newCustomersAcquired: number
): number {
  if (newCustomersAcquired === 0) {
    return 0; // Avoid division by zero
  }

  return salesMarketingExpenses / newCustomersAcquired;
}

/**
 * Calculate CAC by channel (if expense breakdown available)
 */
export function calculateCACByChannel(
  channelExpenses: Record<string, number>,
  customersByChannel: Record<string, number>
): Record<string, number> {
  const cacByChannel: Record<string, number> = {};

  for (const channel in channelExpenses) {
    const customers = customersByChannel[channel] || 0;
    cacByChannel[channel] = customers > 0 ? channelExpenses[channel] / customers : 0;
  }

  return cacByChannel;
}

/**
 * Calculate blended CAC (across all channels)
 */
export function calculateBlendedCAC(
  totalMarketingSpend: number,
  totalSalesSpend: number,
  newCustomers: number
): number {
  return calculateCAC(totalMarketingSpend + totalSalesSpend, newCustomers);
}

/**
 * Calculate CAC payback period (months to recover CAC)
 * CAC Payback = CAC / (ARPU * Gross Margin)
 */
export function calculateCACPayback(
  cac: number,
  averageRevenuePerUser: number,
  grossMargin: number
): number {
  if (averageRevenuePerUser === 0 || grossMargin === 0) {
    return Infinity;
  }

  return cac / (averageRevenuePerUser * (grossMargin / 100));
}

/**
 * Analyze CAC efficiency
 */
export function analyzeCACEfficiency(
  cac: number,
  ltv: number
): {
  ratio: number;
  isHealthy: boolean;
  recommendation: string;
} {
  const ratio = ltv / cac;

  if (ratio >= 3) {
    return {
      ratio,
      isHealthy: true,
      recommendation: 'Excellent LTV:CAC ratio. Consider increasing marketing spend to accelerate growth.',
    };
  }

  if (ratio >= 2) {
    return {
      ratio,
      isHealthy: true,
      recommendation: 'Good LTV:CAC ratio. Unit economics are healthy.',
    };
  }

  if (ratio >= 1) {
    return {
      ratio,
      isHealthy: false,
      recommendation: 'Warning: Low LTV:CAC ratio. Focus on reducing acquisition costs or increasing customer lifetime value.',
    };
  }

  return {
    ratio,
    isHealthy: false,
    recommendation: 'Critical: Negative unit economics. Each customer costs more to acquire than they generate in lifetime value.',
  };
}
