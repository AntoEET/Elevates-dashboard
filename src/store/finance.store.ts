import { create } from 'zustand';
import type {
  RevenueMetrics,
  SaaSMetrics,
  CashFlow,
  PLStatement,
  FinancialMetrics,
  IntegrationStatus,
  Currency,
} from '@/shared/schemas/finance';

interface FinanceState {
  // ============================================================================
  // Financial Data
  // ============================================================================
  metrics: {
    revenue: RevenueMetrics | null;
    saas: SaaSMetrics | null;
    cashFlow: CashFlow | null;
    pl: PLStatement | null;
  };

  // Historical data for charts
  historicalRevenue: RevenueMetrics[];
  historicalCashFlow: CashFlow[];

  // ============================================================================
  // UI State
  // ============================================================================
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  // Current period being viewed (e.g., "2026-02")
  currentPeriod: string;

  // Display currency (user preference)
  displayCurrency: Currency;

  // ============================================================================
  // Integration Status
  // ============================================================================
  integrations: {
    xero: IntegrationStatus;
    stripe: IntegrationStatus;
  };

  // ============================================================================
  // Actions - Data Fetching
  // ============================================================================

  /**
   * Fetch financial metrics for a given period
   */
  fetchMetrics: (period?: string) => Promise<void>;

  /**
   * Fetch historical data for charts
   */
  fetchHistoricalData: (months?: number) => Promise<void>;

  /**
   * Refresh all data (fetch metrics + historical)
   */
  refreshAll: () => Promise<void>;

  // ============================================================================
  // Actions - Data Sync
  // ============================================================================

  /**
   * Sync data from external sources (Xero + Stripe)
   */
  syncData: () => Promise<void>;

  /**
   * Sync Xero data only
   */
  syncXero: () => Promise<void>;

  /**
   * Sync Stripe data only
   */
  syncStripe: () => Promise<void>;

  // ============================================================================
  // Actions - Integration Management
  // ============================================================================

  /**
   * Connect Xero account (redirect to OAuth)
   */
  connectXero: () => void;

  /**
   * Connect Stripe account
   */
  connectStripe: () => void;

  /**
   * Check integration status
   */
  checkIntegrationStatus: () => Promise<void>;

  // ============================================================================
  // Actions - UI State
  // ============================================================================

  /**
   * Set current period
   */
  setCurrentPeriod: (period: string) => void;

  /**
   * Set display currency
   */
  setDisplayCurrency: (currency: Currency) => void;

  /**
   * Clear error
   */
  clearError: () => void;
}

// Helper to get current period (YYYY-MM format)
function getCurrentPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  // ============================================================================
  // Initial State
  // ============================================================================
  metrics: {
    revenue: null,
    saas: null,
    cashFlow: null,
    pl: null,
  },
  historicalRevenue: [],
  historicalCashFlow: [],
  isLoading: false,
  isSyncing: false,
  error: null,
  currentPeriod: getCurrentPeriod(),
  displayCurrency: 'GBP',
  integrations: {
    xero: {
      service: 'xero',
      connected: false,
      lastSyncAt: null,
      status: 'disconnected',
    },
    stripe: {
      service: 'stripe',
      connected: false,
      lastSyncAt: null,
      status: 'disconnected',
    },
  },

  // ============================================================================
  // Data Fetching Actions
  // ============================================================================

  fetchMetrics: async (period?: string) => {
    const targetPeriod = period || get().currentPeriod;
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/finance/metrics?period=${targetPeriod}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const data: FinancialMetrics = await response.json();

      set({
        metrics: {
          revenue: data.revenue,
          saas: data.saas,
          cashFlow: data.cashFlow,
          pl: data.pl || null,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch metrics',
      });
    }
  },

  fetchHistoricalData: async (months: number = 12) => {
    set({ isLoading: true, error: null });

    try {
      const [revenueResponse, cashFlowResponse] = await Promise.all([
        fetch(`/api/finance/revenue?months=${months}`),
        fetch(`/api/finance/cash-flow?months=${months}`),
      ]);

      if (!revenueResponse.ok || !cashFlowResponse.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const revenueData = await revenueResponse.json();
      const cashFlowData = await cashFlowResponse.json();

      set({
        historicalRevenue: revenueData,
        historicalCashFlow: cashFlowData,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch historical data',
      });
    }
  },

  refreshAll: async () => {
    await Promise.all([
      get().fetchMetrics(),
      get().fetchHistoricalData(),
    ]);
  },

  // ============================================================================
  // Data Sync Actions
  // ============================================================================

  syncData: async () => {
    set({ isSyncing: true, error: null });

    try {
      const response = await fetch('/api/finance/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync data');
      }

      // Update last sync times
      const now = new Date();
      set((state) => ({
        integrations: {
          xero: {
            ...state.integrations.xero,
            lastSyncAt: now,
          },
          stripe: {
            ...state.integrations.stripe,
            lastSyncAt: now,
          },
        },
        isSyncing: false,
      }));

      // Refresh data after sync
      await get().refreshAll();
    } catch (error) {
      set({
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Failed to sync data',
      });
    }
  },

  syncXero: async () => {
    set({ isSyncing: true, error: null });

    try {
      const response = await fetch('/api/integrations/xero/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync Xero data');
      }

      const now = new Date();
      set((state) => ({
        integrations: {
          ...state.integrations,
          xero: {
            ...state.integrations.xero,
            lastSyncAt: now,
          },
        },
        isSyncing: false,
      }));

      await get().refreshAll();
    } catch (error) {
      set({
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Failed to sync Xero',
      });
    }
  },

  syncStripe: async () => {
    set({ isSyncing: true, error: null });

    try {
      const response = await fetch('/api/integrations/stripe/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync Stripe data');
      }

      const now = new Date();
      set((state) => ({
        integrations: {
          ...state.integrations,
          stripe: {
            ...state.integrations.stripe,
            lastSyncAt: now,
          },
        },
        isSyncing: false,
      }));

      await get().refreshAll();
    } catch (error) {
      set({
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Failed to sync Stripe',
      });
    }
  },

  // ============================================================================
  // Integration Management Actions
  // ============================================================================

  connectXero: () => {
    window.location.href = '/api/integrations/xero/auth';
  },

  connectStripe: () => {
    // For now, Stripe is configured via environment variables
    // In future, could implement Stripe Connect OAuth flow
    window.alert('Stripe is configured via environment variables. Please contact your administrator.');
  },

  checkIntegrationStatus: async () => {
    try {
      const response = await fetch('/api/finance/integrations/status');

      if (!response.ok) {
        throw new Error('Failed to check integration status');
      }

      const statuses = await response.json();

      set({
        integrations: {
          xero: statuses.xero,
          stripe: statuses.stripe,
        },
      });
    } catch (error) {
      console.error('Failed to check integration status:', error);
    }
  },

  // ============================================================================
  // UI State Actions
  // ============================================================================

  setCurrentPeriod: (period: string) => {
    set({ currentPeriod: period });
    get().fetchMetrics(period);
  },

  setDisplayCurrency: (currency: Currency) => {
    set({ displayCurrency: currency });
  },

  clearError: () => {
    set({ error: null });
  },
}));
