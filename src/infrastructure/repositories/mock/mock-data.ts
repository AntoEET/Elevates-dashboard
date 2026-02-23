import { faker } from '@faker-js/faker';
import type {
  Agent,
  AgentFleet,
  AgentStatus,
  AgentType,
  AIShareOfVoice,
  BiasAuditResult,
  ChurnPrediction,
  Client,
  ClientList,
  ComplianceBadge,
  DeveloperVelocity,
  Insight,
  InsightList,
  LatencyCostPoint,
  NRRMetrics,
  ResourceForecast,
  RevenueData,
  ROIMetrics,
  SecurityHealth,
  TimeSeriesData,
  TokenEfficiency,
} from '@/shared/schemas';

// Seed for consistent data
faker.seed(42);

// ============================================
// Helper Functions
// ============================================

function generateUUID(): string {
  return crypto.randomUUID();
}

function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateTrend(): 'up' | 'down' | 'stable' {
  const rand = Math.random();
  if (rand < 0.4) return 'up';
  if (rand < 0.7) return 'down';
  return 'stable';
}

// ============================================
// Client Data
// ============================================

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Manufacturing',
  'Media',
  'Education',
  'Energy',
];

const clientNames = [
  'Acme Corp',
  'TechVision Inc',
  'Global Dynamics',
  'Innovate Labs',
  'Summit Enterprises',
  'Nexus Solutions',
  'Velocity Partners',
  'Apex Industries',
  'Quantum Systems',
  'Horizon Group',
  'Stellar Technologies',
  'Atlas Consulting',
];

export function generateClients(count: number = 12): ClientList {
  return Array.from({ length: count }, (_, i) => ({
    id: generateUUID(),
    name: clientNames[i] || faker.company.name(),
    tier: randomFromArray(['enterprise', 'growth', 'starter'] as const),
    industry: randomFromArray(industries),
    contractValue: faker.number.int({ min: 50000, max: 2000000 }),
    contractHealth: randomFromArray(['healthy', 'at-risk', 'churning', 'expanding'] as const),
    nrr: faker.number.float({ min: 85, max: 140, fractionDigits: 1 }),
    roi: faker.number.float({ min: 100, max: 500, fractionDigits: 0 }),
    aiAdoptionScore: faker.number.float({ min: 40, max: 95, fractionDigits: 1 }),
    lastInteraction: faker.date.recent({ days: 14 }).toISOString(),
    healthScore: faker.number.float({ min: 50, max: 98, fractionDigits: 1 }),
  }));
}

// ============================================
// Agent Fleet Data
// ============================================

const agentNames = [
  'Atlas Support Bot',
  'Nexus Sales Assistant',
  'Quantum Analytics Engine',
  'Velocity Ops Manager',
  'Horizon Content Generator',
  'Summit Research Agent',
];

const agentTypes: AgentType[] = [
  'customer-service',
  'sales-assist',
  'analytics',
  'operations',
  'content-gen',
  'research',
];

export function generateAgentFleet(): AgentFleet {
  const statuses: AgentStatus[] = ['healthy', 'healthy', 'healthy', 'degraded', 'healthy', 'critical'];

  return agentNames.map((name, i) => ({
    id: generateUUID(),
    name,
    type: agentTypes[i],
    status: statuses[i],
    uptime: faker.number.float({ min: 94, max: 99.99, fractionDigits: 2 }),
    requestsPerHour: faker.number.int({ min: 500, max: 15000 }),
    avgLatencyMs: faker.number.int({ min: 80, max: 500 }),
    errorRate: faker.number.float({ min: 0, max: 5, fractionDigits: 2 }),
    tokensConsumed: faker.number.int({ min: 100000, max: 5000000 }),
    lastHealthCheck: faker.date.recent({ days: 0.1 }).toISOString(),
  }));
}

// ============================================
// Financial Metrics
// ============================================

export function generateROIMetrics(): ROIMetrics {
  const laborSavings = faker.number.int({ min: 800000, max: 2500000 });
  const efficiencyGains = faker.number.int({ min: 400000, max: 1200000 });
  const revenueUplift = faker.number.int({ min: 600000, max: 1800000 });
  const tokenCosts = faker.number.int({ min: 150000, max: 450000 });
  const netValue = laborSavings + efficiencyGains + revenueUplift - tokenCosts;

  return {
    totalROI: Math.round((netValue / tokenCosts) * 100),
    laborSavings,
    efficiencyGains,
    revenueUplift,
    tokenCosts,
    netValue,
  };
}

export function generateNRRMetrics(): NRRMetrics {
  return {
    current: faker.number.float({ min: 105, max: 125, fractionDigits: 1 }),
    target: 115,
    trend: generateTrend(),
    expansionRevenue: faker.number.int({ min: 500000, max: 1500000 }),
    contractionRevenue: faker.number.int({ min: 50000, max: 200000 }),
    churnedRevenue: faker.number.int({ min: 100000, max: 400000 }),
  };
}

export function generateRevenueData(months: number = 12): RevenueData[] {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - (months - 1 - i));
    const revenue = faker.number.int({ min: 800000, max: 1500000 });
    const tokenCost = faker.number.int({ min: 30000, max: 80000 });

    return {
      period: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue,
      tokenCost,
      margin: ((revenue - tokenCost) / revenue) * 100,
      aiContribution: faker.number.float({ min: 15, max: 35, fractionDigits: 1 }),
    };
  });
}

// ============================================
// Operations Data
// ============================================

export function generateTokenEfficiency(): TokenEfficiency {
  return {
    totalTokens: faker.number.int({ min: 50000000, max: 200000000 }),
    costPerToken: 0.00002,
    efficiencyScore: faker.number.float({ min: 70, max: 95, fractionDigits: 1 }),
    wastePercentage: faker.number.float({ min: 5, max: 20, fractionDigits: 1 }),
    optimizationPotential: faker.number.int({ min: 20000, max: 80000 }),
  };
}

export function generateDeveloperVelocity(): DeveloperVelocity {
  return {
    deploymentFrequency: faker.number.float({ min: 2, max: 8, fractionDigits: 1 }),
    leadTime: faker.number.float({ min: 4, max: 24, fractionDigits: 1 }),
    changeFailureRate: faker.number.float({ min: 1, max: 8, fractionDigits: 1 }),
    mttr: faker.number.int({ min: 15, max: 120 }),
    aiAssistedPRs: faker.number.float({ min: 40, max: 75, fractionDigits: 1 }),
  };
}

export function generateLatencyCostData(): LatencyCostPoint[] {
  const services = [
    'Customer Service Bot',
    'Sales Assistant',
    'Analytics Engine',
    'Content Generator',
    'Research Agent',
    'Ops Manager',
  ];

  return services.map((service) => ({
    service,
    latencyMs: faker.number.int({ min: 50, max: 800 }),
    costPerRequest: faker.number.float({ min: 0.001, max: 0.05, fractionDigits: 4 }),
    requestVolume: faker.number.int({ min: 10000, max: 500000 }),
  }));
}

// ============================================
// Intelligence Data
// ============================================

export function generateChurnPredictions(clients: ClientList): ChurnPrediction[] {
  return clients.slice(0, 5).map((client) => ({
    clientId: client.id,
    riskLevel: randomFromArray(['low', 'medium', 'high', 'critical'] as const),
    probability: faker.number.float({ min: 10, max: 85, fractionDigits: 1 }),
    factors: faker.helpers.arrayElements(
      [
        'Declining usage',
        'Low engagement',
        'Support ticket increase',
        'Contract renewal approaching',
        'Champion departure',
        'Budget constraints',
      ],
      { min: 2, max: 4 }
    ),
    recommendedActions: faker.helpers.arrayElements(
      [
        'Schedule executive review',
        'Offer usage optimization session',
        'Propose custom training',
        'Discuss contract flexibility',
        'Assign dedicated CSM',
      ],
      { min: 2, max: 3 }
    ),
    predictedChurnDate: faker.date.future({ years: 0.5 }).toISOString(),
  }));
}

export function generateResourceForecasts(months: number = 6): ResourceForecast[] {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() + i);
    const predicted = faker.number.int({ min: 50000000, max: 150000000 });

    return {
      period: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      predictedTokenUsage: predicted,
      predictedCost: predicted * 0.00002,
      confidenceInterval: {
        lower: predicted * 0.85,
        upper: predicted * 1.15,
      },
    };
  });
}

export function generateAIShareOfVoice(): AIShareOfVoice[] {
  const categories = [
    'Customer Support',
    'Sales Outreach',
    'Content Creation',
    'Data Analysis',
    'Code Review',
    'Documentation',
  ];

  return categories.map((category) => {
    const aiPercent = faker.number.float({ min: 30, max: 80, fractionDigits: 1 });
    return {
      category,
      aiPercentage: aiPercent,
      humanPercentage: 100 - aiPercent,
      trend: generateTrend(),
    };
  });
}

// ============================================
// Governance Data
// ============================================

export function generateBiasAuditResults(): BiasAuditResult[] {
  const dimensions = [
    'Gender Representation',
    'Age Bias',
    'Geographic Fairness',
    'Socioeconomic Balance',
    'Language Inclusivity',
  ];

  return dimensions.map((dimension) => {
    const score = faker.number.float({ min: 75, max: 98, fractionDigits: 1 });
    return {
      dimension,
      score,
      status: score >= 90 ? 'healthy' : score >= 80 ? 'warning' : 'critical',
      lastAudit: faker.date.recent({ days: 30 }).toISOString(),
      findings: faker.number.int({ min: 0, max: 5 }),
    };
  });
}

export function generateComplianceBadges(): ComplianceBadge[] {
  const frameworks = [
    { name: 'SOC 2 Type II', coverage: 98 },
    { name: 'GDPR', coverage: 95 },
    { name: 'HIPAA', coverage: 92 },
    { name: 'ISO 27001', coverage: 97 },
    { name: 'CCPA', coverage: 94 },
  ];

  return frameworks.map((fw) => ({
    framework: fw.name,
    status: fw.coverage >= 95 ? 'compliant' : fw.coverage >= 90 ? 'pending-review' : 'non-compliant',
    lastAssessment: faker.date.recent({ days: 90 }).toISOString(),
    nextReview: faker.date.future({ years: 0.5 }).toISOString(),
    coveragePercent: fw.coverage,
  }));
}

export function generateSecurityHealth(): SecurityHealth {
  return {
    overallScore: faker.number.float({ min: 85, max: 98, fractionDigits: 1 }),
    vulnerabilities: {
      critical: faker.number.int({ min: 0, max: 2 }),
      high: faker.number.int({ min: 0, max: 5 }),
      medium: faker.number.int({ min: 2, max: 15 }),
      low: faker.number.int({ min: 5, max: 30 }),
    },
    patchCompliance: faker.number.float({ min: 92, max: 99, fractionDigits: 1 }),
    encryptionCoverage: faker.number.float({ min: 95, max: 100, fractionDigits: 1 }),
    accessControlScore: faker.number.float({ min: 88, max: 98, fractionDigits: 1 }),
  };
}

// ============================================
// Insights Data
// ============================================

export function generateInsights(): InsightList {
  const insights: Insight[] = [
    {
      id: generateUUID(),
      title: 'ROI Milestone Achieved',
      summary: 'Your AI investments have exceeded 300% ROI this quarter, driven primarily by customer service automation savings.',
      priority: 'high',
      category: 'achievement',
      metric: 'ROI',
      value: 312,
      changePercent: 15,
      timestamp: new Date().toISOString(),
      actionable: false,
    },
    {
      id: generateUUID(),
      title: 'Churn Risk Detected',
      summary: 'Acme Corp shows early warning signs of churn. Usage dropped 25% last month and support tickets increased.',
      priority: 'critical',
      category: 'risk',
      metric: 'Churn Probability',
      value: 72,
      timestamp: new Date().toISOString(),
      actionable: true,
      action: 'Schedule executive review with Acme Corp',
    },
    {
      id: generateUUID(),
      title: 'Token Efficiency Opportunity',
      summary: 'Analytics Engine is consuming 40% more tokens than similar deployments. Prompt optimization could save $15K/month.',
      priority: 'medium',
      category: 'opportunity',
      metric: 'Potential Savings',
      value: 15000,
      timestamp: new Date().toISOString(),
      actionable: true,
      action: 'Review Analytics Engine prompts',
    },
  ];

  return insights;
}

// ============================================
// Time Series Data
// ============================================

export function generateTimeSeriesData(
  days: number = 30,
  baseValue: number = 100,
  volatility: number = 10
): TimeSeriesData {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      timestamp: date.toISOString(),
      value: baseValue + (Math.random() - 0.5) * volatility * 2,
    };
  });
}
