import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProspectStage =
  | 'new-lead'
  | 'invited'
  | 'connected'
  | 'first-message'
  | 'follow-up'
  | 'meeting-scheduled'
  | 'proposal-sent'
  | 'closed-won'
  | 'closed-lost';

export type FollowUpType = 'email' | 'phone' | 'linkedin' | 'meeting' | 'other';

export interface FollowUp {
  id: string;
  date: string; // ISO date string
  type: FollowUpType;
  notes: string;
  completed: boolean;
  completedDate?: string;
}

export interface Prospect {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  linkedinProfile?: string;
  twitterProfile?: string;
  instagramProfile?: string;
  otherProfile?: string;

  // Pipeline tracking
  stage: ProspectStage;
  dateAdded: string;
  dateInvited?: string;
  dateConnected?: string;
  dateFirstMessage?: string;
  dateMeetingScheduled?: string;
  dateProposalSent?: string;
  dateClosed?: string;

  // Quick tracking fields
  accepted?: boolean; // Did they accept the connection?
  firstEmailDate?: string;
  followUp1Date?: string;
  followUp2Date?: string;
  followUp3Date?: string;
  followUp4Date?: string;

  // Follow-ups (max 5)
  followUps: FollowUp[];

  // Additional info
  notes: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  source?: string; // Where did you find them? (LinkedIn, Twitter, Referral, etc.)

  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface ProspectState {
  prospects: Prospect[];
  selectedProspectId: string | null;
  viewMode: 'pipeline' | 'table' | 'analytics';
  searchQuery: string;
  filterStage: ProspectStage | 'all';
  filterPriority: 'all' | 'low' | 'medium' | 'high';
}

interface ProspectActions {
  // CRUD operations
  addProspect: (prospect: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProspect: (id: string, updates: Partial<Omit<Prospect, 'id' | 'createdAt'>>) => void;
  deleteProspect: (id: string) => void;

  // Stage management
  moveToStage: (id: string, stage: ProspectStage) => void;

  // Follow-up management
  addFollowUp: (prospectId: string, followUp: Omit<FollowUp, 'id'>) => void;
  updateFollowUp: (prospectId: string, followUpId: string, updates: Partial<FollowUp>) => void;
  deleteFollowUp: (prospectId: string, followUpId: string) => void;
  completeFollowUp: (prospectId: string, followUpId: string) => void;

  // View management
  setSelectedProspect: (id: string | null) => void;
  setViewMode: (mode: 'pipeline' | 'table' | 'analytics') => void;
  setSearchQuery: (query: string) => void;
  setFilterStage: (stage: ProspectStage | 'all') => void;
  setFilterPriority: (priority: 'all' | 'low' | 'medium' | 'high') => void;

  // Queries
  getProspectById: (id: string) => Prospect | undefined;
  getProspectsByStage: (stage: ProspectStage) => Prospect[];
  getFilteredProspects: () => Prospect[];
  getPendingFollowUps: () => { prospect: Prospect; followUp: FollowUp }[];

  // Analytics
  getStageStats: () => Record<ProspectStage, number>;
  getConversionRate: () => number;
  getSourceStats: () => Array<{ name: string; value: number }>;
  getPriorityStats: () => Array<{ name: string; value: number; color: string }>;
  getFollowUpStats: () => { total: number; completed: number; pending: number; completionRate: number };
  getConversionFunnel: () => Array<{ stage: string; count: number; percentage: number }>;
  getTrendData: (days?: number) => Array<{ date: string; added: number; won: number; lost: number }>;
  getAverageTimeInStage: () => Array<{ stage: string; averageDays: number }>;
}

type ProspectStore = ProspectState & ProspectActions;

// Helper function to sanitize prospect data and prevent NaN values
function sanitizeProspect(prospect: any): any {
  const sanitized = { ...prospect };

  // Ensure string fields are never NaN
  const stringFields = ['name', 'company', 'email', 'phone', 'linkedinProfile', 'twitterProfile',
                        'instagramProfile', 'otherProfile', 'notes', 'source'];

  stringFields.forEach(field => {
    if (sanitized[field] !== undefined && (typeof sanitized[field] !== 'string' || Number.isNaN(Number(sanitized[field])))) {
      sanitized[field] = '';
    }
  });

  return sanitized;
}

export const useProspectStore = create<ProspectStore>()(
  persist(
    (set, get) => ({
      // Initial state
      prospects: [],
      selectedProspectId: null,
      viewMode: 'pipeline',
      searchQuery: '',
      filterStage: 'all',
      filterPriority: 'all',

      // CRUD operations
      addProspect: (prospect) => {
        const sanitized = sanitizeProspect(prospect);
        const newProspect: Prospect = {
          ...sanitized,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          prospects: [...state.prospects, newProspect],
        }));
      },

      updateProspect: (id, updates) => {
        const sanitized = sanitizeProspect(updates);
        set((state) => ({
          prospects: state.prospects.map((prospect) =>
            prospect.id === id
              ? { ...prospect, ...sanitized, updatedAt: new Date().toISOString() }
              : prospect
          ),
        }));
      },

      deleteProspect: (id) => {
        set((state) => ({
          prospects: state.prospects.filter((p) => p.id !== id),
          selectedProspectId: state.selectedProspectId === id ? null : state.selectedProspectId,
        }));
      },

      // Stage management
      moveToStage: (id, stage) => {
        const updates: Partial<Prospect> = { stage };

        // Update date fields based on stage
        const now = new Date().toISOString();
        switch (stage) {
          case 'invited':
            updates.dateInvited = now;
            break;
          case 'connected':
            updates.dateConnected = now;
            break;
          case 'first-message':
            updates.dateFirstMessage = now;
            break;
          case 'meeting-scheduled':
            updates.dateMeetingScheduled = now;
            break;
          case 'proposal-sent':
            updates.dateProposalSent = now;
            break;
          case 'closed-won':
          case 'closed-lost':
            updates.dateClosed = now;
            break;
        }

        get().updateProspect(id, updates);
      },

      // Follow-up management
      addFollowUp: (prospectId, followUp) => {
        const prospect = get().getProspectById(prospectId);
        if (!prospect) return;

        if (prospect.followUps.length >= 5) {
          console.warn('Maximum 5 follow-ups allowed per prospect');
          return;
        }

        const newFollowUp: FollowUp = {
          ...followUp,
          id: crypto.randomUUID(),
        };

        get().updateProspect(prospectId, {
          followUps: [...prospect.followUps, newFollowUp],
        });
      },

      updateFollowUp: (prospectId, followUpId, updates) => {
        const prospect = get().getProspectById(prospectId);
        if (!prospect) return;

        get().updateProspect(prospectId, {
          followUps: prospect.followUps.map((fu) =>
            fu.id === followUpId ? { ...fu, ...updates } : fu
          ),
        });
      },

      deleteFollowUp: (prospectId, followUpId) => {
        const prospect = get().getProspectById(prospectId);
        if (!prospect) return;

        get().updateProspect(prospectId, {
          followUps: prospect.followUps.filter((fu) => fu.id !== followUpId),
        });
      },

      completeFollowUp: (prospectId, followUpId) => {
        get().updateFollowUp(prospectId, followUpId, {
          completed: true,
          completedDate: new Date().toISOString(),
        });
      },

      // View management
      setSelectedProspect: (id) => set({ selectedProspectId: id }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFilterStage: (stage) => set({ filterStage: stage }),
      setFilterPriority: (priority) => set({ filterPriority: priority }),

      // Queries
      getProspectById: (id) => {
        return get().prospects.find((p) => p.id === id);
      },

      getProspectsByStage: (stage) => {
        return get().prospects.filter((p) => p.stage === stage);
      },

      getFilteredProspects: () => {
        const { prospects, searchQuery, filterStage, filterPriority } = get();

        return prospects.filter((prospect) => {
          // Search filter
          const matchesSearch = searchQuery === '' ||
            prospect.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prospect.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prospect.email?.toLowerCase().includes(searchQuery.toLowerCase());

          // Stage filter
          const matchesStage = filterStage === 'all' || prospect.stage === filterStage;

          // Priority filter
          const matchesPriority = filterPriority === 'all' || prospect.priority === filterPriority;

          return matchesSearch && matchesStage && matchesPriority;
        });
      },

      getPendingFollowUps: () => {
        const prospects = get().prospects;
        const pending: { prospect: Prospect; followUp: FollowUp }[] = [];

        prospects.forEach((prospect) => {
          prospect.followUps
            .filter((fu) => !fu.completed)
            .forEach((followUp) => {
              pending.push({ prospect, followUp });
            });
        });

        // Sort by date
        return pending.sort((a, b) =>
          new Date(a.followUp.date).getTime() - new Date(b.followUp.date).getTime()
        );
      },

      // Analytics
      getStageStats: () => {
        const prospects = get().prospects;
        const stats: Record<ProspectStage, number> = {
          'new-lead': 0,
          'invited': 0,
          'connected': 0,
          'first-message': 0,
          'follow-up': 0,
          'meeting-scheduled': 0,
          'proposal-sent': 0,
          'closed-won': 0,
          'closed-lost': 0,
        };

        prospects.forEach((prospect) => {
          stats[prospect.stage]++;
        });

        return stats;
      },

      getConversionRate: () => {
        const prospects = get().prospects;
        const total = prospects.length;
        if (total === 0) return 0;

        const won = prospects.filter((p) => p.stage === 'closed-won').length;
        return (won / total) * 100;
      },

      // Advanced Analytics
      getSourceStats: () => {
        const prospects = get().prospects;
        const stats: Record<string, number> = {};

        prospects.forEach((prospect) => {
          const source = prospect.source || 'Unknown';
          stats[source] = (stats[source] || 0) + 1;
        });

        return Object.entries(stats).map(([name, value]) => ({ name, value }));
      },

      getPriorityStats: () => {
        const prospects = get().prospects;
        const stats = {
          low: 0,
          medium: 0,
          high: 0,
        };

        prospects.forEach((prospect) => {
          stats[prospect.priority]++;
        });

        return [
          { name: 'High', value: stats.high, color: '#EF4444' },
          { name: 'Medium', value: stats.medium, color: '#F59E0B' },
          { name: 'Low', value: stats.low, color: '#64748B' },
        ];
      },

      getFollowUpStats: () => {
        const prospects = get().prospects;
        let totalFollowUps = 0;
        let completedFollowUps = 0;

        prospects.forEach((prospect) => {
          totalFollowUps += prospect.followUps.length;
          completedFollowUps += prospect.followUps.filter((fu) => fu.completed).length;
        });

        return {
          total: totalFollowUps,
          completed: completedFollowUps,
          pending: totalFollowUps - completedFollowUps,
          completionRate: totalFollowUps > 0 ? (completedFollowUps / totalFollowUps) * 100 : 0,
        };
      },

      getConversionFunnel: () => {
        const stats = get().getStageStats();
        return [
          { stage: 'New Lead', count: stats['new-lead'], percentage: 100 },
          { stage: 'Invited', count: stats['invited'], percentage: 0 },
          { stage: 'Connected', count: stats['connected'], percentage: 0 },
          { stage: 'First Message', count: stats['first-message'], percentage: 0 },
          { stage: 'Follow-up', count: stats['follow-up'], percentage: 0 },
          { stage: 'Meeting', count: stats['meeting-scheduled'], percentage: 0 },
          { stage: 'Proposal', count: stats['proposal-sent'], percentage: 0 },
          { stage: 'Closed Won', count: stats['closed-won'], percentage: 0 },
        ].map((item, index, arr) => ({
          ...item,
          percentage: arr[0].count > 0 ? (item.count / arr[0].count) * 100 : 0,
        }));
      },

      getTrendData: (days: number = 30) => {
        const prospects = get().prospects;
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        // Group by date
        const dataByDate: Record<string, { added: number; won: number; lost: number }> = {};

        prospects.forEach((prospect) => {
          const addedDate = new Date(prospect.dateAdded);
          if (addedDate >= startDate) {
            const dateKey = addedDate.toISOString().split('T')[0];
            if (!dataByDate[dateKey]) {
              dataByDate[dateKey] = { added: 0, won: 0, lost: 0 };
            }
            dataByDate[dateKey].added++;
          }

          if (prospect.dateClosed && prospect.stage === 'closed-won') {
            const closedDate = new Date(prospect.dateClosed);
            if (closedDate >= startDate) {
              const dateKey = closedDate.toISOString().split('T')[0];
              if (!dataByDate[dateKey]) {
                dataByDate[dateKey] = { added: 0, won: 0, lost: 0 };
              }
              dataByDate[dateKey].won++;
            }
          }

          if (prospect.dateClosed && prospect.stage === 'closed-lost') {
            const closedDate = new Date(prospect.dateClosed);
            if (closedDate >= startDate) {
              const dateKey = closedDate.toISOString().split('T')[0];
              if (!dataByDate[dateKey]) {
                dataByDate[dateKey] = { added: 0, won: 0, lost: 0 };
              }
              dataByDate[dateKey].lost++;
            }
          }
        });

        // Convert to array and fill gaps
        const result = [];
        for (let i = 0; i < days; i++) {
          const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          const dateKey = date.toISOString().split('T')[0];
          result.push({
            date: dateKey,
            added: dataByDate[dateKey]?.added || 0,
            won: dataByDate[dateKey]?.won || 0,
            lost: dataByDate[dateKey]?.lost || 0,
          });
        }

        return result;
      },

      getAverageTimeInStage: () => {
        const prospects = get().prospects;
        const stageTimes: Record<ProspectStage, { total: number; count: number }> = {
          'new-lead': { total: 0, count: 0 },
          'invited': { total: 0, count: 0 },
          'connected': { total: 0, count: 0 },
          'first-message': { total: 0, count: 0 },
          'follow-up': { total: 0, count: 0 },
          'meeting-scheduled': { total: 0, count: 0 },
          'proposal-sent': { total: 0, count: 0 },
          'closed-won': { total: 0, count: 0 },
          'closed-lost': { total: 0, count: 0 },
        };

        prospects.forEach((prospect) => {
          // Calculate time from added to next stage (simplified)
          const stages: Array<{ stage: ProspectStage; date: string | undefined }> = [
            { stage: 'new-lead', date: prospect.dateAdded },
            { stage: 'invited', date: prospect.dateInvited },
            { stage: 'connected', date: prospect.dateConnected },
            { stage: 'first-message', date: prospect.dateFirstMessage },
            { stage: 'meeting-scheduled', date: prospect.dateMeetingScheduled },
            { stage: 'proposal-sent', date: prospect.dateProposalSent },
            { stage: 'closed-won', date: prospect.dateClosed },
            { stage: 'closed-lost', date: prospect.dateClosed },
          ];

          for (let i = 0; i < stages.length - 1; i++) {
            const current = stages[i];
            const next = stages[i + 1];
            if (current.date && next.date) {
              const days = (new Date(next.date).getTime() - new Date(current.date).getTime()) / (1000 * 60 * 60 * 24);
              stageTimes[current.stage].total += days;
              stageTimes[current.stage].count++;
            }
          }
        });

        return Object.entries(stageTimes).map(([stage, data]) => ({
          stage,
          averageDays: data.count > 0 ? Math.round(data.total / data.count) : 0,
        }));
      },
    }),
    {
      name: 'elevates-prospects',
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate prospect store:', error);
          // Clear corrupted data
          localStorage.removeItem('elevates-prospects');
          window.location.reload();
        }
      },
    }
  )
);
