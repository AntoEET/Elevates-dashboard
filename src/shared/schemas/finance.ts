import { z } from 'zod';

// ============================================================================
// Currency & Money
// ============================================================================

export const CurrencySchema = z.enum(['GBP', 'USD', 'EUR']);
export type Currency = z.infer<typeof CurrencySchema>;

export const MoneySchema = z.object({
  amount: z.number(),
  currency: CurrencySchema,
});
export type Money = z.infer<typeof MoneySchema>;

export const ExchangeRateSchema = z.object({
  from: CurrencySchema,
  to: CurrencySchema,
  rate: z.number(),
  date: z.string(), // YYYY-MM-DD
  source: z.enum(['xero', 'exchangerate-api']),
});
export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;

// ============================================================================
// Revenue Metrics (MRR/ARR)
// ============================================================================

export const RevenueMetricsSchema = z.object({
  mrr: z.number().nonnegative(),
  arr: z.number().nonnegative(),
  mrrGrowth: z.number(), // % growth MoM
  arrGrowth: z.number(), // % growth YoY
  newMRR: z.number(),
  expansionMRR: z.number(),
  contractionMRR: z.number(),
  churnedMRR: z.number(),
  netNewMRR: z.number(),
  mrrByCurrency: z.object({
    GBP: z.number(),
    USD: z.number(),
    EUR: z.number(),
  }),
  period: z.string(), // "2026-02" format
  calculatedAt: z.date(),
});
export type RevenueMetrics = z.infer<typeof RevenueMetricsSchema>;

// ============================================================================
// SaaS Metrics
// ============================================================================

export const SaaSMetricsSchema = z.object({
  cac: z.number().nonnegative(),
  ltv: z.number().nonnegative(),
  ltvCacRatio: z.number(),
  magicNumber: z.number(),
  ruleOf40: z.number(),
  nrr: z.number(), // Net Revenue Retention %
  grr: z.number(), // Gross Revenue Retention %
  quickRatio: z.number(), // (New + Expansion) / (Contraction + Churn)
  period: z.string(),
  calculatedAt: z.date(),
});
export type SaaSMetrics = z.infer<typeof SaaSMetricsSchema>;

// ============================================================================
// Cash Flow
// ============================================================================

export const CashFlowSchema = z.object({
  beginningBalance: z.number(),
  cashIn: z.number(),
  cashOut: z.number(),
  endingBalance: z.number(),
  burnRate: z.number(), // Monthly burn (negative = burning)
  runway: z.number(), // Months of runway
  period: z.string(),
  calculatedAt: z.date(),
});
export type CashFlow = z.infer<typeof CashFlowSchema>;

// ============================================================================
// P&L Statement
// ============================================================================

export const PLStatementSchema = z.object({
  revenue: z.number(),
  cogs: z.number(),
  grossProfit: z.number(),
  grossMargin: z.number(), // %
  operatingExpenses: z.object({
    salesMarketing: z.number(),
    researchDevelopment: z.number(),
    generalAdmin: z.number(),
    total: z.number(),
  }),
  ebitda: z.number(),
  netIncome: z.number(),
  period: z.string(),
  periodType: z.enum(['monthly', 'quarterly', 'annual']),
});
export type PLStatement = z.infer<typeof PLStatementSchema>;

// ============================================================================
// Transaction
// ============================================================================

export const TransactionSchema = z.object({
  id: z.string(),
  date: z.date(),
  description: z.string(),
  amount: z.number(),
  currency: CurrencySchema,
  amountInBaseCurrency: z.number(), // Always GBP for consistency
  exchangeRate: z.number().optional(),
  type: z.enum(['income', 'expense']),
  category: z.string(),
  account: z.string(),
  source: z.enum(['xero', 'stripe', 'manual']),
  metadata: z.record(z.string(), z.any()).optional(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

// ============================================================================
// Account (Chart of Accounts)
// ============================================================================

export const AccountSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  type: z.enum(['BANK', 'CURRENT', 'REVENUE', 'EXPENSE', 'FIXED', 'LIABILITY', 'EQUITY']),
  balance: z.number(),
  currency: CurrencySchema,
  isActive: z.boolean().default(true),
});
export type Account = z.infer<typeof AccountSchema>;

// ============================================================================
// Forecast
// ============================================================================

export const ForecastAssumptionsSchema = z.object({
  mrrGrowthRate: z.number(), // % per month
  churnRate: z.number(), // %
  expansionRate: z.number(), // %
  cacPaybackPeriod: z.number(), // months
  grossMargin: z.number(), // %
  opexGrowthRate: z.number(), // % per month
});
export type ForecastAssumptions = z.infer<typeof ForecastAssumptionsSchema>;

export const ProjectionSchema = z.object({
  period: z.string(),
  mrr: z.number(),
  arr: z.number(),
  expenses: z.number(),
  cashBalance: z.number(),
  burnRate: z.number(),
  runway: z.number(),
});
export type Projection = z.infer<typeof ProjectionSchema>;

export const ForecastSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  assumptions: ForecastAssumptionsSchema,
  projections: z.array(ProjectionSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Forecast = z.infer<typeof ForecastSchema>;

// ============================================================================
// Scenario
// ============================================================================

export const ScenarioVariableSchema = z.object({
  name: z.string(),
  baseValue: z.number(),
  adjustedValue: z.number(),
  impact: z.string(), // Description of impact
});
export type ScenarioVariable = z.infer<typeof ScenarioVariableSchema>;

export const ScenarioResultsSchema = z.object({
  mrrImpact: z.number(),
  cashImpact: z.number(),
  runwayImpact: z.number(),
});
export type ScenarioResults = z.infer<typeof ScenarioResultsSchema>;

export const ScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['best_case', 'base_case', 'worst_case', 'custom']),
  baselineAssumptions: ForecastAssumptionsSchema,
  variables: z.array(ScenarioVariableSchema),
  results: ScenarioResultsSchema,
  createdAt: z.date(),
});
export type Scenario = z.infer<typeof ScenarioSchema>;

// ============================================================================
// Report
// ============================================================================

export const ReportSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['board_deck', 'investor_update', 'excel_export']),
  format: z.enum(['pdf', 'pptx', 'xlsx']),
  period: z.string(),
  url: z.string(),
  createdAt: z.date(),
});
export type Report = z.infer<typeof ReportSchema>;

// ============================================================================
// Integration Status
// ============================================================================

export const IntegrationStatusSchema = z.object({
  service: z.enum(['xero', 'stripe']),
  connected: z.boolean(),
  lastSyncAt: z.date().nullable(),
  status: z.enum(['active', 'error', 'disconnected']),
  errorMessage: z.string().optional(),
});
export type IntegrationStatus = z.infer<typeof IntegrationStatusSchema>;

// ============================================================================
// Financial Metrics Summary (Combined)
// ============================================================================

export const FinancialMetricsSchema = z.object({
  revenue: RevenueMetricsSchema,
  saas: SaaSMetricsSchema,
  cashFlow: CashFlowSchema,
  pl: PLStatementSchema.optional(),
});
export type FinancialMetrics = z.infer<typeof FinancialMetricsSchema>;
