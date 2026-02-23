import { create } from 'zustand';
import type { CrisisAlert, CrisisType } from '@/shared/schemas';
import { THRESHOLDS } from '@/shared/constants';

interface CrisisState {
  isActive: boolean;
  activeAlerts: CrisisAlert[];
  tokenSpikeTriggerPercent: number;
  autoDetectionEnabled: boolean;
}

interface CrisisActions {
  activateCrisisMode: () => void;
  deactivateCrisisMode: () => void;
  addAlert: (alert: Omit<CrisisAlert, 'id' | 'acknowledged'>) => void;
  dismissAlert: (alertId: string) => void;
  acknowledgeAlert: (alertId: string, acknowledgedBy: string) => void;
  clearAllAlerts: () => void;
  toggleAutoDetection: () => void;
  setTokenSpikeTrigger: (percent: number) => void;
  checkForCrisis: (metrics: { tokenChange?: number; errorRate?: number }) => void;
}

type CrisisStore = CrisisState & CrisisActions;

export const useCrisisStore = create<CrisisStore>((set, get) => ({
  // Initial state
  isActive: false,
  activeAlerts: [],
  tokenSpikeTriggerPercent: THRESHOLDS.TOKEN_SPIKE_PERCENT,
  autoDetectionEnabled: true,

  // Actions
  activateCrisisMode: () => set({ isActive: true }),

  deactivateCrisisMode: () => set({ isActive: false, activeAlerts: [] }),

  addAlert: (alert) => {
    const newAlert: CrisisAlert = {
      ...alert,
      id: crypto.randomUUID(),
      acknowledged: false,
    };

    set((state) => ({
      activeAlerts: [...state.activeAlerts, newAlert],
      isActive: true,
    }));
  },

  dismissAlert: (alertId) => {
    set((state) => {
      const newAlerts = state.activeAlerts.filter((a) => a.id !== alertId);
      return {
        activeAlerts: newAlerts,
        isActive: newAlerts.length > 0,
      };
    });
  },

  acknowledgeAlert: (alertId, acknowledgedBy) => {
    set((state) => ({
      activeAlerts: state.activeAlerts.map((a) =>
        a.id === alertId ? { ...a, acknowledged: true, acknowledgedBy } : a
      ),
    }));
  },

  clearAllAlerts: () => set({ activeAlerts: [], isActive: false }),

  toggleAutoDetection: () =>
    set((state) => ({ autoDetectionEnabled: !state.autoDetectionEnabled })),

  setTokenSpikeTrigger: (percent) => set({ tokenSpikeTriggerPercent: percent }),

  checkForCrisis: (metrics) => {
    const state = get();
    if (!state.autoDetectionEnabled) return;

    const alerts: Omit<CrisisAlert, 'id' | 'acknowledged'>[] = [];

    // Check for token spike
    if (
      metrics.tokenChange &&
      metrics.tokenChange > state.tokenSpikeTriggerPercent
    ) {
      alerts.push({
        type: 'token-spike',
        severity: metrics.tokenChange > 50 ? 'critical' : 'warning',
        title: `Token usage spike detected: +${metrics.tokenChange.toFixed(1)}%`,
        description: `Token consumption has increased by ${metrics.tokenChange.toFixed(1)}% in the last hour, exceeding the ${state.tokenSpikeTriggerPercent}% threshold.`,
        affectedSystems: ['AI Services', 'Cost Management'],
        startTime: new Date().toISOString(),
      });
    }

    // Check for API error rate
    if (metrics.errorRate && metrics.errorRate > THRESHOLDS.API_ERROR_RATE_PERCENT) {
      alerts.push({
        type: 'api-failure',
        severity: metrics.errorRate > 10 ? 'critical' : 'warning',
        title: `High API error rate: ${metrics.errorRate.toFixed(1)}%`,
        description: `API error rate is at ${metrics.errorRate.toFixed(1)}%, above the acceptable threshold of ${THRESHOLDS.API_ERROR_RATE_PERCENT}%.`,
        affectedSystems: ['API Gateway', 'Agent Fleet'],
        startTime: new Date().toISOString(),
      });
    }

    // Add detected alerts
    alerts.forEach((alert) => get().addAlert(alert));
  },
}));
