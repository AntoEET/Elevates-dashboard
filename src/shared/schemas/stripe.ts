import { z } from 'zod';

// ============================================================================
// Stripe Subscription
// ============================================================================

export const StripeSubscriptionItemSchema = z.object({
  id: z.string(),
  priceId: z.string(),
  quantity: z.number(),
  amount: z.number(), // cents
});
export type StripeSubscriptionItem = z.infer<typeof StripeSubscriptionItemSchema>;

export const StripeSubscriptionSchema = z.object({
  id: z.string(),
  customer: z.string(),
  status: z.enum([
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid',
  ]),
  currentPeriodStart: z.number(), // Unix timestamp
  currentPeriodEnd: z.number(),
  cancelAtPeriodEnd: z.boolean(),
  canceledAt: z.number().nullable(),
  currency: z.string().default('gbp'),
  items: z.array(StripeSubscriptionItemSchema),
  mrr: z.number(), // Calculated MRR for this subscription
  metadata: z.record(z.string()).optional(),
  created: z.number(),
});
export type StripeSubscription = z.infer<typeof StripeSubscriptionSchema>;

// ============================================================================
// Stripe Customer
// ============================================================================

export const StripeCustomerSchema = z.object({
  id: z.string(),
  email: z.string().email().nullable(),
  name: z.string().nullable(),
  created: z.number(),
  currency: z.string().nullable(),
  subscriptions: z.array(StripeSubscriptionSchema).optional(),
  lifetimeValue: z.number().optional(),
  metadata: z.record(z.string()).optional(),
  defaultSource: z.string().nullable(),
  delinquent: z.boolean(),
});
export type StripeCustomer = z.infer<typeof StripeCustomerSchema>;

// ============================================================================
// Stripe Invoice
// ============================================================================

export const StripeInvoiceSchema = z.object({
  id: z.string(),
  customer: z.string(),
  subscription: z.string().nullable(),
  status: z.enum(['draft', 'open', 'paid', 'uncollectible', 'void']),
  created: z.number(),
  dueDate: z.number().nullable(),
  amountDue: z.number(),
  amountPaid: z.number(),
  amountRemaining: z.number(),
  currency: z.string().default('gbp'),
  periodStart: z.number(),
  periodEnd: z.number(),
  hostedInvoiceUrl: z.string().nullable(),
  invoicePdf: z.string().nullable(),
  metadata: z.record(z.string()).optional(),
});
export type StripeInvoice = z.infer<typeof StripeInvoiceSchema>;

// ============================================================================
// Stripe Payment Intent
// ============================================================================

export const StripePaymentIntentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string().default('gbp'),
  status: z.enum([
    'requires_payment_method',
    'requires_confirmation',
    'requires_action',
    'processing',
    'requires_capture',
    'canceled',
    'succeeded',
  ]),
  customer: z.string().nullable(),
  created: z.number(),
  metadata: z.record(z.string()).optional(),
});
export type StripePaymentIntent = z.infer<typeof StripePaymentIntentSchema>;

// ============================================================================
// Stripe Webhook Event
// ============================================================================

export const StripeWebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  created: z.number(),
  data: z.object({
    object: z.any(),
  }),
  livemode: z.boolean(),
});
export type StripeWebhookEvent = z.infer<typeof StripeWebhookEventSchema>;

// ============================================================================
// Stripe Connection Data
// ============================================================================

export const StripeConnectionSchema = z.object({
  accountId: z.string().optional(),
  publishableKey: z.string(),
  secretKey: z.string(),
  webhookSecret: z.string().optional(),
  connectedAt: z.date(),
  lastSyncAt: z.date().nullable(),
});
export type StripeConnection = z.infer<typeof StripeConnectionSchema>;

// ============================================================================
// Stripe Metrics
// ============================================================================

export const StripeMetricsSchema = z.object({
  totalCustomers: z.number(),
  activeSubscriptions: z.number(),
  mrr: z.number(),
  arr: z.number(),
  averageRevenuePerCustomer: z.number(),
  churnRate: z.number(),
  calculatedAt: z.date(),
});
export type StripeMetrics = z.infer<typeof StripeMetricsSchema>;
