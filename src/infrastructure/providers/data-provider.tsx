'use client';

import * as React from 'react';
import {
  generateClients,
  generateAgentFleet,
  generateROIMetrics,
  generateNRRMetrics,
  generateRevenueData,
  generateTokenEfficiency,
  generateDeveloperVelocity,
  generateLatencyCostData,
  generateChurnPredictions,
  generateResourceForecasts,
  generateAIShareOfVoice,
  generateBiasAuditResults,
  generateComplianceBadges,
  generateSecurityHealth,
  generateInsights,
  generateTimeSeriesData,
} from '@/infrastructure/repositories/mock/mock-data';
import type {
  AgentFleet,
  AIShareOfVoice,
  BiasAuditResult,
  ChurnPrediction,
  ClientList,
  ComplianceBadge,
  DeveloperVelocity,
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
import { REFRESH_INTERVALS } from '@/shared/constants';

// ============================================
// Repository Interface
// ============================================

export interface DataRepository {
  // Command Center
  getROIMetrics: () => Promise<ROIMetrics>;
  getNRRMetrics: () => Promise<NRRMetrics>;
  getAgentFleet: () => Promise<AgentFleet>;
  getRevenueData: () => Promise<RevenueData[]>;
  getInsights: () => Promise<InsightList>;
  getROITimeSeries: () => Promise<TimeSeriesData>;

  // Client Performance
  getClients: () => Promise<ClientList>;

  // Operations
  getTokenEfficiency: () => Promise<TokenEfficiency>;
  getDeveloperVelocity: () => Promise<DeveloperVelocity>;
  getLatencyCostData: () => Promise<LatencyCostPoint[]>;

  // Intelligence
  getChurnPredictions: () => Promise<ChurnPrediction[]>;
  getResourceForecasts: () => Promise<ResourceForecast[]>;
  getAIShareOfVoice: () => Promise<AIShareOfVoice[]>;

  // Governance
  getBiasAuditResults: () => Promise<BiasAuditResult[]>;
  getComplianceBadges: () => Promise<ComplianceBadge[]>;
  getSecurityHealth: () => Promise<SecurityHealth>;
}

// ============================================
// Mock Repository Implementation
// ============================================

function createMockRepository(): DataRepository {
  // Cache the generated data for consistency within a session
  const clients = generateClients();

  return {
    getROIMetrics: async () => {
      await simulateLatency();
      return generateROIMetrics();
    },

    getNRRMetrics: async () => {
      await simulateLatency();
      return generateNRRMetrics();
    },

    getAgentFleet: async () => {
      await simulateLatency();
      return generateAgentFleet();
    },

    getRevenueData: async () => {
      await simulateLatency();
      return generateRevenueData();
    },

    getInsights: async () => {
      await simulateLatency();
      return generateInsights();
    },

    getROITimeSeries: async () => {
      await simulateLatency();
      return generateTimeSeriesData(30, 280, 30);
    },

    getClients: async () => {
      await simulateLatency();
      return clients;
    },

    getTokenEfficiency: async () => {
      await simulateLatency();
      return generateTokenEfficiency();
    },

    getDeveloperVelocity: async () => {
      await simulateLatency();
      return generateDeveloperVelocity();
    },

    getLatencyCostData: async () => {
      await simulateLatency();
      return generateLatencyCostData();
    },

    getChurnPredictions: async () => {
      await simulateLatency();
      return generateChurnPredictions(clients);
    },

    getResourceForecasts: async () => {
      await simulateLatency();
      return generateResourceForecasts();
    },

    getAIShareOfVoice: async () => {
      await simulateLatency();
      return generateAIShareOfVoice();
    },

    getBiasAuditResults: async () => {
      await simulateLatency();
      return generateBiasAuditResults();
    },

    getComplianceBadges: async () => {
      await simulateLatency();
      return generateComplianceBadges();
    },

    getSecurityHealth: async () => {
      await simulateLatency();
      return generateSecurityHealth();
    },
  };
}

// Simulate network latency
function simulateLatency(minMs = 100, maxMs = 300): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// ============================================
// Context
// ============================================

interface DataContextValue {
  repository: DataRepository;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const DataContext = React.createContext<DataContextValue | null>(null);

export function useDataContext(): DataContextValue {
  const context = React.useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}

export function useRepository(): DataRepository {
  return useDataContext().repository;
}

// ============================================
// Provider Component
// ============================================

interface DataProviderProps {
  children: React.ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [isLoading, setLoading] = React.useState(false);

  // Create repository instance (could be swapped for real API in production)
  const repository = React.useMemo(() => createMockRepository(), []);

  const value = React.useMemo(
    () => ({
      repository,
      isLoading,
      setLoading,
    }),
    [repository, isLoading]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// ============================================
// Data Fetching Hook
// ============================================

interface UseDataOptions<T> {
  fetcher: () => Promise<T>;
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useData<T>({
  fetcher,
  refreshInterval = 0,
  enabled = true,
}: UseDataOptions<T>): UseDataResult<T> {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  // Use ref for fetcher to avoid re-renders when inline functions are passed
  const fetcherRef = React.useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetchData = React.useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  // Initial fetch - only run once when enabled changes
  const initialFetchDone = React.useRef(false);
  React.useEffect(() => {
    if (enabled && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchData();
    }
  }, [enabled, fetchData]);

  // Refresh interval
  React.useEffect(() => {
    if (refreshInterval > 0 && enabled) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval, enabled]);

  return { data, isLoading, error, refresh: fetchData };
}
