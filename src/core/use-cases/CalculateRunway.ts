/**
 * Calculate runway (months of cash remaining)
 * Runway = Current Cash Balance / Monthly Burn Rate
 */
export function calculateRunway(currentCash: number, monthlyBurnRate: number): number {
  // If burn rate is negative or zero (profitable or breakeven), runway is infinite
  if (monthlyBurnRate <= 0) {
    return Infinity;
  }

  // If no cash left, runway is 0
  if (currentCash <= 0) {
    return 0;
  }

  return currentCash / monthlyBurnRate;
}

/**
 * Calculate runway with revenue growth
 * Takes into account that revenue might be growing, reducing burn over time
 */
export function calculateRunwayWithGrowth(
  currentCash: number,
  currentMonthlyBurn: number,
  monthlyRevenueGrowth: number
): number {
  if (currentMonthlyBurn <= 0) {
    return Infinity;
  }

  let cash = currentCash;
  let burn = currentMonthlyBurn;
  let months = 0;
  const maxMonths = 120; // Cap at 10 years to avoid infinite loops

  while (cash > 0 && months < maxMonths) {
    cash -= burn;
    months++;

    // Reduce burn by revenue growth each month
    burn = Math.max(0, burn - monthlyRevenueGrowth);

    // If we become profitable, runway is infinite from this point
    if (burn <= 0 && cash > 0) {
      return Infinity;
    }
  }

  return months;
}

/**
 * Calculate date when runway expires
 */
export function calculateRunwayDate(runway: number): Date | null {
  if (runway === Infinity) {
    return null; // Never runs out
  }

  const today = new Date();
  const runwayDate = new Date(today);
  runwayDate.setMonth(runwayDate.getMonth() + Math.floor(runway));

  return runwayDate;
}

/**
 * Analyze runway health
 */
export function analyzeRunwayHealth(
  runway: number
): {
  status: 'critical' | 'warning' | 'healthy' | 'excellent';
  urgency: 'immediate' | 'high' | 'medium' | 'low';
  recommendation: string;
  fundingNeeded: boolean;
} {
  if (runway === Infinity) {
    return {
      status: 'excellent',
      urgency: 'low',
      recommendation: 'Company is profitable or breakeven. No immediate funding concerns.',
      fundingNeeded: false,
    };
  }

  if (runway < 3) {
    return {
      status: 'critical',
      urgency: 'immediate',
      recommendation:
        'Critical: Less than 3 months of runway. Immediate action required - secure funding or drastically cut costs.',
      fundingNeeded: true,
    };
  }

  if (runway < 6) {
    return {
      status: 'warning',
      urgency: 'high',
      recommendation:
        'Warning: Less than 6 months of runway. Start fundraising process immediately or implement cost reduction measures.',
      fundingNeeded: true,
    };
  }

  if (runway < 12) {
    return {
      status: 'healthy',
      urgency: 'medium',
      recommendation:
        'Healthy runway, but consider starting fundraising conversations if growth requires capital.',
      fundingNeeded: false,
    };
  }

  return {
    status: 'excellent',
    urgency: 'low',
    recommendation: 'Strong cash position. Focus on growth and efficient capital deployment.',
    fundingNeeded: false,
  };
}

/**
 * Calculate cash needed to reach a target runway
 */
export function calculateCashNeeded(
  currentCash: number,
  monthlyBurnRate: number,
  targetRunwayMonths: number
): number {
  if (monthlyBurnRate <= 0) {
    return 0; // Already profitable
  }

  const requiredCash = monthlyBurnRate * targetRunwayMonths;
  const cashNeeded = Math.max(0, requiredCash - currentCash);

  return cashNeeded;
}

/**
 * Calculate runway extension from new funding
 */
export function calculateRunwayExtension(
  currentRunway: number,
  newFunding: number,
  monthlyBurnRate: number
): {
  newRunway: number;
  extensionMonths: number;
  newRunwayDate: Date | null;
} {
  if (currentRunway === Infinity || monthlyBurnRate <= 0) {
    return {
      newRunway: Infinity,
      extensionMonths: Infinity,
      newRunwayDate: null,
    };
  }

  const additionalMonths = newFunding / monthlyBurnRate;
  const newRunway = currentRunway + additionalMonths;

  return {
    newRunway,
    extensionMonths: additionalMonths,
    newRunwayDate: calculateRunwayDate(newRunway),
  };
}

/**
 * Model runway under different scenarios
 */
export function modelRunwayScenarios(
  currentCash: number,
  currentBurn: number
): {
  base: number;
  optimistic: number; // 20% burn reduction
  pessimistic: number; // 20% burn increase
} {
  return {
    base: calculateRunway(currentCash, currentBurn),
    optimistic: calculateRunway(currentCash, currentBurn * 0.8),
    pessimistic: calculateRunway(currentCash, currentBurn * 1.2),
  };
}

/**
 * Calculate zero-based runway (assuming all non-essential expenses cut)
 */
export function calculateZeroBasedRunway(
  currentCash: number,
  totalBurn: number,
  essentialExpensesPercentage: number
): number {
  const essentialBurn = totalBurn * (essentialExpensesPercentage / 100);
  return calculateRunway(currentCash, essentialBurn);
}

/**
 * Project runway over time with multiple variables
 */
export function projectRunwayOverTime(
  initialCash: number,
  monthlyBurnRate: number,
  revenueGrowthRate: number,
  expenseGrowthRate: number,
  months: number
): Array<{ month: number; cash: number; burnRate: number; runway: number }> {
  const projections = [];
  let cash = initialCash;
  let burn = monthlyBurnRate;

  for (let month = 0; month <= months; month++) {
    const runway = calculateRunway(cash, burn);

    projections.push({
      month,
      cash,
      burnRate: burn,
      runway,
    });

    // Update for next month
    cash -= burn;
    burn = burn * (1 + expenseGrowthRate / 100) - revenueGrowthRate;

    // Stop if cash runs out
    if (cash <= 0) break;
  }

  return projections;
}
