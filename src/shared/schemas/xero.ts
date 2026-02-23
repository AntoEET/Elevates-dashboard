import { z } from 'zod';

// ============================================================================
// Xero Account
// ============================================================================

export const XeroAccountSchema = z.object({
  accountID: z.string(),
  code: z.string(),
  name: z.string(),
  type: z.enum(['BANK', 'CURRENT', 'REVENUE', 'EXPENSE', 'FIXED', 'LIABILITY', 'EQUITY']),
  taxType: z.string().optional(),
  enablePaymentsToAccount: z.boolean().optional(),
  bankAccountNumber: z.string().optional(),
  currencyCode: z.string().default('GBP'),
  status: z.string().optional(),
  description: z.string().optional(),
});
export type XeroAccount = z.infer<typeof XeroAccountSchema>;

// ============================================================================
// Xero Transaction (Bank Transaction)
// ============================================================================

export const XeroTransactionSchema = z.object({
  bankTransactionID: z.string(),
  type: z.enum(['SPEND', 'RECEIVE']),
  contact: z.object({
    contactID: z.string().optional(),
    name: z.string().optional(),
  }).optional(),
  date: z.string(), // ISO date
  reference: z.string().optional(),
  isReconciled: z.boolean(),
  status: z.string(),
  total: z.number(),
  currencyCode: z.string().default('GBP'),
  lineItems: z.array(z.object({
    description: z.string().optional(),
    quantity: z.number().optional(),
    unitAmount: z.number(),
    accountCode: z.string(),
    taxType: z.string().optional(),
    taxAmount: z.number().optional(),
    lineAmount: z.number(),
  })),
});
export type XeroTransaction = z.infer<typeof XeroTransactionSchema>;

// ============================================================================
// Xero Balance Sheet
// ============================================================================

export const XeroBalanceSheetSchema = z.object({
  reportID: z.string(),
  reportName: z.string(),
  reportDate: z.string(),
  updatedDateUTC: z.string(),
  assets: z.object({
    current: z.number(),
    fixed: z.number(),
    total: z.number(),
  }),
  liabilities: z.object({
    current: z.number(),
    longTerm: z.number(),
    total: z.number(),
  }),
  equity: z.number(),
});
export type XeroBalanceSheet = z.infer<typeof XeroBalanceSheetSchema>;

// ============================================================================
// Xero Profit & Loss
// ============================================================================

export const XeroProfitLossSchema = z.object({
  reportID: z.string(),
  reportName: z.string(),
  fromDate: z.string(),
  toDate: z.string(),
  updatedDateUTC: z.string(),
  revenue: z.number(),
  cogs: z.number(),
  grossProfit: z.number(),
  operatingExpenses: z.record(z.string(), z.number()),
  netProfit: z.number(),
});
export type XeroProfitLoss = z.infer<typeof XeroProfitLossSchema>;

// ============================================================================
// Xero OAuth Tokens
// ============================================================================

export const XeroTokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(), // Unix timestamp
  token_type: z.string().default('Bearer'),
  scope: z.string().optional(),
});
export type XeroTokens = z.infer<typeof XeroTokensSchema>;

// ============================================================================
// Xero Tenant (Organization)
// ============================================================================

export const XeroTenantSchema = z.object({
  tenantId: z.string(),
  tenantType: z.string(),
  tenantName: z.string(),
});
export type XeroTenant = z.infer<typeof XeroTenantSchema>;

// ============================================================================
// Xero Connection Data
// ============================================================================

export const XeroConnectionSchema = z.object({
  tokens: XeroTokensSchema,
  tenant: XeroTenantSchema,
  connectedAt: z.date(),
  lastSyncAt: z.date().nullable(),
});
export type XeroConnection = z.infer<typeof XeroConnectionSchema>;
