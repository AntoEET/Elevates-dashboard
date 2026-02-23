import Stripe from 'stripe';
import type {
  StripeSubscription,
  StripeCustomer,
  StripeInvoice,
  StripeMetrics,
} from '@/shared/schemas/stripe';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * StripeService - Handles all Stripe API interactions
 */
export class StripeService {
  private stripe: Stripe | null = null;
  private metadataPath: string;

  constructor() {
    this.metadataPath = path.join(
      process.cwd(),
      'src',
      'data',
      'integrations',
      'stripe-tokens',
      'metadata.json'
    );

    // Initialize Stripe if key is available
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2026-01-28.clover',
      });
    }
  }

  /**
   * Ensure Stripe is initialized
   */
  private ensureInitialized(): Stripe {
    if (!this.stripe) {
      throw new Error('Stripe not configured. Please add STRIPE_SECRET_KEY to environment variables.');
    }
    return this.stripe;
  }

  // ============================================================================
  // Subscriptions
  // ============================================================================

  /**
   * Fetch all subscriptions
   */
  async getSubscriptions(limit: number = 100): Promise<StripeSubscription[]> {
    const stripe = this.ensureInitialized();

    const subscriptions: StripeSubscription[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const response = await stripe.subscriptions.list({
        limit,
        starting_after: startingAfter,
        expand: ['data.items.data.price'],
      });

      for (const sub of response.data) {
        const items = sub.items.data.map((item) => ({
          id: item.id,
          priceId: item.price.id,
          quantity: item.quantity || 1,
          amount: item.price.unitAmount || 0,
        }));

        // Calculate MRR for this subscription
        const mrr = this.calculateSubscriptionMRR(sub);

        subscriptions.push({
          id: sub.id,
          customer: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
          status: sub.status as any,
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          canceledAt: sub.canceledAt,
          currency: sub.currency,
          items,
          mrr,
          metadata: sub.metadata,
          created: sub.created,
        });
      }

      hasMore = response.has_more;
      if (hasMore && response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }

    return subscriptions;
  }

  /**
   * Get single subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<StripeSubscription | null> {
    const stripe = this.ensureInitialized();

    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price'],
      });

      const items = sub.items.data.map((item) => ({
        id: item.id,
        priceId: item.price.id,
        quantity: item.quantity || 1,
        amount: item.price.unitAmount || 0,
      }));

      const mrr = this.calculateSubscriptionMRR(sub);

      return {
        id: sub.id,
        customer: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
        status: sub.status as any,
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        canceledAt: sub.canceledAt,
        currency: sub.currency,
        items,
        mrr,
        metadata: sub.metadata,
        created: sub.created,
      };
    } catch (error) {
      if ((error as any).code === 'resource_missing') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Calculate MRR for a subscription
   */
  private calculateSubscriptionMRR(sub: Stripe.Subscription): number {
    let monthlyAmount = 0;

    for (const item of sub.items.data) {
      const price = item.price;
      const quantity = item.quantity || 1;
      const unitAmount = price.unitAmount || 0;

      // Convert to monthly amount based on interval
      if (price.recurring) {
        const interval = price.recurring.interval;
        const intervalCount = price.recurring.interval_count || 1;

        switch (interval) {
          case 'month':
            monthlyAmount += (unitAmount * quantity) / intervalCount;
            break;
          case 'year':
            monthlyAmount += (unitAmount * quantity) / (12 * intervalCount);
            break;
          case 'week':
            monthlyAmount += (unitAmount * quantity * 4.33) / intervalCount; // ~4.33 weeks per month
            break;
          case 'day':
            monthlyAmount += (unitAmount * quantity * 30) / intervalCount;
            break;
        }
      }
    }

    // Convert from cents to dollars/pounds
    return monthlyAmount / 100;
  }

  // ============================================================================
  // Customers
  // ============================================================================

  /**
   * Fetch all customers
   */
  async getCustomers(limit: number = 100): Promise<StripeCustomer[]> {
    const stripe = this.ensureInitialized();

    const customers: StripeCustomer[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const response = await stripe.customers.list({
        limit,
        starting_after: startingAfter,
      });

      for (const customer of response.data) {
        customers.push({
          id: customer.id,
          email: customer.email,
          name: customer.name,
          created: customer.created,
          currency: customer.currency,
          metadata: customer.metadata,
          defaultSource: customer.defaultSource as string | null,
          delinquent: customer.delinquent || false,
        });
      }

      hasMore = response.has_more;
      if (hasMore && response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }

    return customers;
  }

  /**
   * Get single customer by ID
   */
  async getCustomer(customerId: string): Promise<StripeCustomer | null> {
    const stripe = this.ensureInitialized();

    try {
      const customer = await stripe.customers.retrieve(customerId);

      return {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        created: customer.created,
        currency: customer.currency,
        metadata: customer.metadata,
        defaultSource: customer.defaultSource as string | null,
        delinquent: customer.delinquent || false,
      };
    } catch (error) {
      if ((error as any).code === 'resource_missing') {
        return null;
      }
      throw error;
    }
  }

  // ============================================================================
  // Invoices
  // ============================================================================

  /**
   * Fetch all invoices
   */
  async getInvoices(limit: number = 100): Promise<StripeInvoice[]> {
    const stripe = this.ensureInitialized();

    const invoices: StripeInvoice[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const response = await stripe.invoices.list({
        limit,
        starting_after: startingAfter,
      });

      for (const invoice of response.data) {
        invoices.push({
          id: invoice.id,
          customer: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || '',
          subscription: typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id || null,
          status: invoice.status as any,
          created: invoice.created,
          dueDate: invoice.dueDate,
          amountDue: invoice.amountDue,
          amountPaid: invoice.amountPaid,
          amountRemaining: invoice.amountRemaining,
          currency: invoice.currency,
          periodStart: invoice.periodStart,
          periodEnd: invoice.periodEnd,
          hostedInvoiceUrl: invoice.hostedInvoiceUrl,
          invoicePdf: invoice.invoicePdf,
          metadata: invoice.metadata,
        });
      }

      hasMore = response.has_more;
      if (hasMore && response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }

    return invoices;
  }

  // ============================================================================
  // Metrics
  // ============================================================================

  /**
   * Calculate Stripe metrics
   */
  async calculateMetrics(): Promise<StripeMetrics> {
    const [subscriptions, customers] = await Promise.all([
      this.getSubscriptions(),
      this.getCustomers(),
    ]);

    const activeSubscriptions = subscriptions.filter((sub) => sub.status === 'active');
    const mrr = activeSubscriptions.reduce((sum, sub) => sum + sub.mrr, 0);
    const arr = mrr * 12;

    const averageRevenuePerCustomer = customers.length > 0 ? mrr / customers.length : 0;

    // Calculate churn rate (simplified - would need historical data)
    const canceledSubs = subscriptions.filter((sub) => sub.status === 'canceled');
    const churnRate = subscriptions.length > 0 ? (canceledSubs.length / subscriptions.length) * 100 : 0;

    return {
      totalCustomers: customers.length,
      activeSubscriptions: activeSubscriptions.length,
      mrr,
      arr,
      averageRevenuePerCustomer,
      churnRate,
      calculatedAt: new Date(),
    };
  }

  // ============================================================================
  // Webhooks
  // ============================================================================

  /**
   * Construct and verify webhook event
   */
  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    const stripe = this.ensureInitialized();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  // ============================================================================
  // Connection Status
  // ============================================================================

  /**
   * Check if Stripe is connected
   */
  isConnected(): boolean {
    return !!this.stripe;
  }

  /**
   * Save sync metadata
   */
  async saveSyncMetadata(lastSyncAt: Date): Promise<void> {
    const dir = path.dirname(this.metadataPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      this.metadataPath,
      JSON.stringify({ lastSyncAt: lastSyncAt.toISOString() }, null, 2)
    );
  }

  /**
   * Get last sync time
   */
  async getLastSyncTime(): Promise<Date | null> {
    try {
      const data = await fs.readFile(this.metadataPath, 'utf-8');
      const metadata = JSON.parse(data);
      return metadata.lastSyncAt ? new Date(metadata.lastSyncAt) : null;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();
