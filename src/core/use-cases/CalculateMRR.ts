import type { RevenueMetrics, Currency } from '@/shared/schemas/finance';
import type { StripeSubscription } from '@/shared/schemas/stripe';
import { getCurrentPeriod, getPreviousPeriod } from '@/shared/lib/date-helpers';

interface SubscriptionMovement {
  type: 'new' | 'expansion' | 'contraction' | 'churned' | 'unchanged';
  amount: number;
}

/**
 * Calculate MRR and ARR from Stripe subscriptions
 */
export function calculateMRR(
  subscriptions: StripeSubscription[],
  previousSubscriptions?: StripeSubscription[],
  previousMRR?: number
): RevenueMetrics {
  // Filter active subscriptions only
  const activeSubscriptions = subscriptions.filter((sub) => sub.status === 'active');

  // Calculate current MRR
  let mrr = 0;
  const mrrByCurrency: Record<Currency, number> = {
    GBP: 0,
    USD: 0,
    EUR: 0,
  };

  for (const sub of activeSubscriptions) {
    mrr += sub.mrr;

    // Add to currency breakdown
    const currency = sub.currency.toUpperCase() as Currency;
    if (currency in mrrByCurrency) {
      mrrByCurrency[currency] += sub.mrr;
    }
  }

  // Calculate ARR
  const arr = mrr * 12;

  // Calculate MRR movement components
  let newMRR = 0;
  let expansionMRR = 0;
  let contractionMRR = 0;
  let churnedMRR = 0;

  if (previousSubscriptions && previousSubscriptions.length > 0) {
    const movements = categorizeSubscriptionMovements(subscriptions, previousSubscriptions);

    newMRR = movements
      .filter((m) => m.type === 'new')
      .reduce((sum, m) => sum + m.amount, 0);

    expansionMRR = movements
      .filter((m) => m.type === 'expansion')
      .reduce((sum, m) => sum + m.amount, 0);

    contractionMRR = movements
      .filter((m) => m.type === 'contraction')
      .reduce((sum, m) => sum + Math.abs(m.amount), 0);

    churnedMRR = movements
      .filter((m) => m.type === 'churned')
      .reduce((sum, m) => sum + Math.abs(m.amount), 0);
  }

  // Calculate net new MRR
  const netNewMRR = newMRR + expansionMRR - contractionMRR - churnedMRR;

  // Calculate growth rates
  const mrrGrowth = previousMRR && previousMRR > 0 ? ((mrr - previousMRR) / previousMRR) * 100 : 0;
  const arrGrowth = mrrGrowth; // Same percentage growth

  return {
    mrr,
    arr,
    mrrGrowth,
    arrGrowth,
    newMRR,
    expansionMRR,
    contractionMRR,
    churnedMRR,
    netNewMRR,
    mrrByCurrency,
    period: getCurrentPeriod(),
    calculatedAt: new Date(),
  };
}

/**
 * Categorize subscription movements between two periods
 */
function categorizeSubscriptionMovements(
  currentSubs: StripeSubscription[],
  previousSubs: StripeSubscription[]
): SubscriptionMovement[] {
  const movements: SubscriptionMovement[] = [];

  // Create maps for quick lookup
  const currentMap = new Map(currentSubs.map((sub) => [sub.id, sub]));
  const previousMap = new Map(previousSubs.map((sub) => [sub.id, sub]));

  // Find new subscriptions
  for (const currentSub of currentSubs) {
    if (currentSub.status !== 'active') continue;

    if (!previousMap.has(currentSub.id)) {
      movements.push({
        type: 'new',
        amount: currentSub.mrr,
      });
    } else {
      // Check for expansion or contraction
      const previousSub = previousMap.get(currentSub.id)!;
      const mrrDiff = currentSub.mrr - previousSub.mrr;

      if (mrrDiff > 0) {
        movements.push({
          type: 'expansion',
          amount: mrrDiff,
        });
      } else if (mrrDiff < 0) {
        movements.push({
          type: 'contraction',
          amount: mrrDiff,
        });
      } else {
        movements.push({
          type: 'unchanged',
          amount: 0,
        });
      }
    }
  }

  // Find churned subscriptions
  for (const previousSub of previousSubs) {
    if (!currentMap.has(previousSub.id) && previousSub.status === 'active') {
      movements.push({
        type: 'churned',
        amount: -previousSub.mrr,
      });
    }
  }

  return movements;
}

/**
 * Calculate MRR growth rate
 */
export function calculateMRRGrowth(currentMRR: number, previousMRR: number): number {
  if (previousMRR === 0) return currentMRR > 0 ? 100 : 0;
  return ((currentMRR - previousMRR) / previousMRR) * 100;
}

/**
 * Calculate quick ratio: (New MRR + Expansion MRR) / (Contraction MRR + Churned MRR)
 */
export function calculateQuickRatio(
  newMRR: number,
  expansionMRR: number,
  contractionMRR: number,
  churnedMRR: number
): number {
  const denominator = contractionMRR + churnedMRR;
  if (denominator === 0) return Infinity; // Perfect scenario - no contraction or churn

  return (newMRR + expansionMRR) / denominator;
}
