import { create } from 'zustand';

export interface DrillDownData {
  type: string;
  title: string;
  subtitle?: string;
  data: unknown;
  sourceWidget: string;
}

interface DrillDownState {
  isOpen: boolean;
  currentData: DrillDownData | null;
}

interface DrillDownActions {
  openDrillDown: (data: DrillDownData) => void;
  closeDrillDown: () => void;
}

type DrillDownStore = DrillDownState & DrillDownActions;

export const useDrillDownStore = create<DrillDownStore>((set) => ({
  // Initial state
  isOpen: false,
  currentData: null,

  // Actions
  openDrillDown: (data) => set({ isOpen: true, currentData: data }),
  closeDrillDown: () => set({ isOpen: false, currentData: null }),
}));
