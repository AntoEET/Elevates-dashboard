import { z } from 'zod';

// ============================================
// Base Schemas
// ============================================

export const timestampSchema = z.string().datetime();
export const percentageSchema = z.number().min(0).max(100);
export const currencySchema = z.number().nonnegative();
export const idSchema = z.string().uuid();

// ============================================
// Metric Schemas
// ============================================

export const metricTrendSchema = z.enum(['up', 'down', 'stable']);
export const metricStatusSchema = z.enum(['healthy', 'warning', 'critical']);

export const metricValueSchema = z.object({
  current: z.number(),
  previous: z.number().optional(),
  target: z.number().optional(),
  trend: metricTrendSchema,
  changePercent: z.number(),
});

export const timeSeriesPointSchema = z.object({
  timestamp: timestampSchema,
  value: z.number(),
});

export const timeSeriesDataSchema = z.array(timeSeriesPointSchema);

// ============================================
// Client Schemas
// ============================================

export const clientTierSchema = z.enum(['enterprise', 'growth', 'starter']);
export const contractHealthSchema = z.enum(['healthy', 'at-risk', 'churning', 'expanding']);

export const clientSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  tier: clientTierSchema,
  industry: z.string(),
  contractValue: currencySchema,
  contractHealth: contractHealthSchema,
  nrr: percentageSchema,
  roi: z.number(),
  aiAdoptionScore: percentageSchema,
  lastInteraction: timestampSchema,
  healthScore: percentageSchema,
});

export const clientListSchema = z.array(clientSchema);

// ============================================
// Agent Schemas (AI Agents in the Fleet)
// ============================================

export const agentStatusSchema = z.enum(['healthy', 'degraded', 'critical', 'offline']);
export const agentTypeSchema = z.enum([
  'customer-service',
  'sales-assist',
  'analytics',
  'operations',
  'content-gen',
  'research',
]);

export const agentSchema = z.object({
  id: idSchema,
  name: z.string(),
  type: agentTypeSchema,
  status: agentStatusSchema,
  uptime: percentageSchema,
  requestsPerHour: z.number().nonnegative(),
  avgLatencyMs: z.number().nonnegative(),
  errorRate: percentageSchema,
  tokensConsumed: z.number().nonnegative(),
  lastHealthCheck: timestampSchema,
});

export const agentFleetSchema = z.array(agentSchema);

// ============================================
// Financial Schemas
// ============================================

export const revenueDataSchema = z.object({
  period: z.string(),
  revenue: currencySchema,
  tokenCost: currencySchema,
  margin: percentageSchema,
  aiContribution: percentageSchema,
});

export const roiMetricsSchema = z.object({
  totalROI: z.number(),
  laborSavings: currencySchema,
  efficiencyGains: currencySchema,
  revenueUplift: currencySchema,
  tokenCosts: currencySchema,
  netValue: currencySchema,
});

export const nrrMetricsSchema = z.object({
  current: percentageSchema,
  target: percentageSchema,
  trend: metricTrendSchema,
  expansionRevenue: currencySchema,
  contractionRevenue: currencySchema,
  churnedRevenue: currencySchema,
});

// ============================================
// Operations Schemas
// ============================================

export const tokenEfficiencySchema = z.object({
  totalTokens: z.number().nonnegative(),
  costPerToken: z.number().nonnegative(),
  efficiencyScore: percentageSchema,
  wastePercentage: percentageSchema,
  optimizationPotential: currencySchema,
});

export const developerVelocitySchema = z.object({
  deploymentFrequency: z.number(),
  leadTime: z.number(), // hours
  changeFailureRate: percentageSchema,
  mttr: z.number(), // minutes
  aiAssistedPRs: percentageSchema,
});

export const latencyCostPointSchema = z.object({
  service: z.string(),
  latencyMs: z.number().nonnegative(),
  costPerRequest: z.number().nonnegative(),
  requestVolume: z.number().nonnegative(),
});

// ============================================
// Intelligence Schemas
// ============================================

export const churnRiskSchema = z.enum(['low', 'medium', 'high', 'critical']);

export const churnPredictionSchema = z.object({
  clientId: idSchema,
  riskLevel: churnRiskSchema,
  probability: percentageSchema,
  factors: z.array(z.string()),
  recommendedActions: z.array(z.string()),
  predictedChurnDate: z.string().optional(),
});

export const resourceForecastSchema = z.object({
  period: z.string(),
  predictedTokenUsage: z.number(),
  predictedCost: currencySchema,
  confidenceInterval: z.object({
    lower: z.number(),
    upper: z.number(),
  }),
});

export const aiShareOfVoiceSchema = z.object({
  category: z.string(),
  aiPercentage: percentageSchema,
  humanPercentage: percentageSchema,
  trend: metricTrendSchema,
});

// ============================================
// Governance Schemas
// ============================================

export const biasAuditResultSchema = z.object({
  dimension: z.string(),
  score: percentageSchema,
  status: metricStatusSchema,
  lastAudit: timestampSchema,
  findings: z.number().nonnegative(),
});

export const complianceStatusSchema = z.enum(['compliant', 'non-compliant', 'pending-review']);

export const complianceBadgeSchema = z.object({
  framework: z.string(),
  status: complianceStatusSchema,
  lastAssessment: timestampSchema,
  nextReview: timestampSchema,
  coveragePercent: percentageSchema,
});

export const securityHealthSchema = z.object({
  overallScore: percentageSchema,
  vulnerabilities: z.object({
    critical: z.number().nonnegative(),
    high: z.number().nonnegative(),
    medium: z.number().nonnegative(),
    low: z.number().nonnegative(),
  }),
  patchCompliance: percentageSchema,
  encryptionCoverage: percentageSchema,
  accessControlScore: percentageSchema,
});

// ============================================
// Insights Schema
// ============================================

export const insightPrioritySchema = z.enum(['critical', 'high', 'medium', 'low']);
export const insightCategorySchema = z.enum([
  'opportunity',
  'risk',
  'action-required',
  'achievement',
  'trend',
]);

export const insightSchema = z.object({
  id: idSchema,
  title: z.string(),
  summary: z.string(),
  priority: insightPrioritySchema,
  category: insightCategorySchema,
  metric: z.string().optional(),
  value: z.number().optional(),
  changePercent: z.number().optional(),
  timestamp: timestampSchema,
  actionable: z.boolean(),
  action: z.string().optional(),
});

export const insightListSchema = z.array(insightSchema);

// ============================================
// Crisis Mode Schema
// ============================================

export const crisisTypeSchema = z.enum([
  'token-spike',
  'api-failure',
  'security-breach',
  'performance-degradation',
  'compliance-violation',
]);

export const crisisAlertSchema = z.object({
  id: idSchema,
  type: crisisTypeSchema,
  severity: z.enum(['warning', 'critical']),
  title: z.string(),
  description: z.string(),
  affectedSystems: z.array(z.string()),
  startTime: timestampSchema,
  acknowledged: z.boolean(),
  acknowledgedBy: z.string().optional(),
});

export const crisisModeStateSchema = z.object({
  isActive: z.boolean(),
  activeAlerts: z.array(crisisAlertSchema),
  tokenSpikeTriggerPercent: percentageSchema.default(30),
  autoDetectionEnabled: z.boolean().default(true),
});

// ============================================
// Dashboard Configuration Schemas
// ============================================

export const dashboardViewSchema = z.enum([
  'command-center',
  'client-performance',
  'operations',
  'intelligence',
  'governance',
  'crm',
]);

export const widgetSizeSchema = z.enum(['sm', 'md', 'lg', 'xl', 'full']);

export const widgetConfigSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  size: widgetSizeSchema,
  position: z.object({
    row: z.number(),
    col: z.number(),
  }),
  refreshInterval: z.number().optional(), // seconds
});

// ============================================
// Export Types (inferred from schemas)
// ============================================

export type Timestamp = z.infer<typeof timestampSchema>;
export type Percentage = z.infer<typeof percentageSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type MetricTrend = z.infer<typeof metricTrendSchema>;
export type MetricStatus = z.infer<typeof metricStatusSchema>;
export type MetricValue = z.infer<typeof metricValueSchema>;
export type TimeSeriesPoint = z.infer<typeof timeSeriesPointSchema>;
export type TimeSeriesData = z.infer<typeof timeSeriesDataSchema>;

export type ClientTier = z.infer<typeof clientTierSchema>;
export type ContractHealth = z.infer<typeof contractHealthSchema>;
export type Client = z.infer<typeof clientSchema>;
export type ClientList = z.infer<typeof clientListSchema>;

export type AgentStatus = z.infer<typeof agentStatusSchema>;
export type AgentType = z.infer<typeof agentTypeSchema>;
export type Agent = z.infer<typeof agentSchema>;
export type AgentFleet = z.infer<typeof agentFleetSchema>;

export type RevenueData = z.infer<typeof revenueDataSchema>;
export type ROIMetrics = z.infer<typeof roiMetricsSchema>;
export type NRRMetrics = z.infer<typeof nrrMetricsSchema>;

export type TokenEfficiency = z.infer<typeof tokenEfficiencySchema>;
export type DeveloperVelocity = z.infer<typeof developerVelocitySchema>;
export type LatencyCostPoint = z.infer<typeof latencyCostPointSchema>;

export type ChurnRisk = z.infer<typeof churnRiskSchema>;
export type ChurnPrediction = z.infer<typeof churnPredictionSchema>;
export type ResourceForecast = z.infer<typeof resourceForecastSchema>;
export type AIShareOfVoice = z.infer<typeof aiShareOfVoiceSchema>;

export type BiasAuditResult = z.infer<typeof biasAuditResultSchema>;
export type ComplianceStatus = z.infer<typeof complianceStatusSchema>;
export type ComplianceBadge = z.infer<typeof complianceBadgeSchema>;
export type SecurityHealth = z.infer<typeof securityHealthSchema>;

export type InsightPriority = z.infer<typeof insightPrioritySchema>;
export type InsightCategory = z.infer<typeof insightCategorySchema>;
export type Insight = z.infer<typeof insightSchema>;
export type InsightList = z.infer<typeof insightListSchema>;

export type CrisisType = z.infer<typeof crisisTypeSchema>;
export type CrisisAlert = z.infer<typeof crisisAlertSchema>;
export type CrisisModeState = z.infer<typeof crisisModeStateSchema>;

export type DashboardView = z.infer<typeof dashboardViewSchema>;
export type WidgetSize = z.infer<typeof widgetSizeSchema>;
export type WidgetConfig = z.infer<typeof widgetConfigSchema>;

// ============================================
// Re-export Client Portfolio Schemas
// ============================================

export * from './client-portfolio';
