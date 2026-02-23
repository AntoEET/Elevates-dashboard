import type { DashboardView } from '@/shared/schemas';

// ============================================
// Route Configuration
// ============================================

export const ROUTES = {
  COMMAND_CENTER: '/command-center',
  CLIENT_PERFORMANCE: '/client-performance',
  CLIENT_DETAIL: '/client-performance/:id',
  OPERATIONS: '/operations',
  INTELLIGENCE: '/intelligence',
  GOVERNANCE: '/governance',
  CRM: '/crm',
} as const;

export function getClientDetailRoute(clientId: string): string {
  return `/client-performance/${clientId}`;
}

export const ROUTE_LABELS: Record<DashboardView, string> = {
  'command-center': 'Command Center',
  'client-performance': 'Client Performance',
  'operations': 'Operations',
  'intelligence': 'Intelligence',
  'governance': 'Governance',
  'crm': 'Prospect CRM',
};

// ============================================
// Thresholds
// ============================================

export const THRESHOLDS = {
  // Crisis mode triggers
  TOKEN_SPIKE_PERCENT: 30,
  API_ERROR_RATE_PERCENT: 5,
  LATENCY_MS: 2000,

  // Health indicators
  HEALTHY_UPTIME_PERCENT: 99.5,
  WARNING_UPTIME_PERCENT: 95,

  // NRR targets
  NRR_TARGET_PERCENT: 110,
  NRR_WARNING_PERCENT: 100,

  // ROI thresholds
  ROI_EXCELLENT: 300,
  ROI_GOOD: 200,
  ROI_WARNING: 100,

  // Client health
  CLIENT_HEALTH_GOOD: 80,
  CLIENT_HEALTH_WARNING: 60,

  // Compliance
  COMPLIANCE_COVERAGE_TARGET: 95,
} as const;

// ============================================
// Refresh Intervals (in milliseconds)
// ============================================

export const REFRESH_INTERVALS = {
  REAL_TIME: 5000, // 5 seconds
  FAST: 15000, // 15 seconds
  NORMAL: 30000, // 30 seconds
  SLOW: 60000, // 1 minute
  BACKGROUND: 300000, // 5 minutes
} as const;

// ============================================
// Chart Configuration
// ============================================

export const CHART_COLORS = {
  primary: 'var(--chart-1)',
  secondary: 'var(--chart-2)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  muted: 'var(--muted)',
} as const;

export const CHART_GRID_STYLE = {
  stroke: 'var(--glass-border)',
  strokeDasharray: '3 3',
} as const;

// ============================================
// Animation Durations
// ============================================

export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  COUNTER_TICK: 50,
} as const;

// ============================================
// Pagination
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// ============================================
// Status Colors
// ============================================

export const STATUS_COLORS = {
  healthy: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  warning: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  critical: 'text-red-500 bg-red-500/10 border-red-500/20',
  degraded: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  offline: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
} as const;

export const TREND_COLORS = {
  up: 'text-emerald-500',
  down: 'text-red-500',
  stable: 'text-slate-500',
} as const;

// ============================================
// Number Formatting
// ============================================

export const NUMBER_FORMATS = {
  currency: {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
  currencyCompact: {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  },
  percent: {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  },
  decimal: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  },
  compact: {
    notation: 'compact',
    maximumFractionDigits: 1,
  },
} as const;
