import { create } from 'zustand';
import type {
  ClientProfile,
  ClientTask,
  ClientMeeting,
  ClientNote,
  ClientDocument,
  ActivityEntry,
  ClientTier,
  ContractHealth,
  TaskStatus,
  TaskPriority,
} from '@/shared/schemas/client-portfolio';

// ============================================
// State Interfaces
// ============================================

interface ClientFilters {
  search: string;
  tier: ClientTier | 'all';
  health: ContractHealth | 'all';
  tags: string[];
}

interface TaskFilters {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  assignee: string | 'all';
}

interface ClientPortfolioState {
  // Client list
  clients: ClientProfile[];
  isLoadingClients: boolean;
  clientsError: string | null;
  clientFilters: ClientFilters;

  // Selected client
  selectedClient: ClientProfile | null;
  isLoadingClient: boolean;
  clientError: string | null;

  // Client sub-entities
  tasks: ClientTask[];
  isLoadingTasks: boolean;
  taskFilters: TaskFilters;

  meetings: ClientMeeting[];
  isLoadingMeetings: boolean;

  notes: ClientNote[];
  isLoadingNotes: boolean;

  documents: ClientDocument[];
  isLoadingDocuments: boolean;

  activities: ActivityEntry[];
  isLoadingActivities: boolean;

  // UI state
  isFormModalOpen: boolean;
  formModalMode: 'create' | 'edit';
  isTaskModalOpen: boolean;
  taskModalMode: 'create' | 'edit';
  selectedTask: ClientTask | null;
  isMeetingModalOpen: boolean;
  selectedMeeting: ClientMeeting | null;
  isNoteModalOpen: boolean;
  selectedNote: ClientNote | null;
}

// ============================================
// Actions Interface
// ============================================

interface ClientPortfolioActions {
  // Client CRUD
  fetchClients: () => Promise<void>;
  fetchClientById: (id: string) => Promise<void>;
  createClient: (data: Partial<ClientProfile>) => Promise<ClientProfile | null>;
  updateClient: (id: string, data: Partial<ClientProfile>) => Promise<ClientProfile | null>;
  deleteClient: (id: string) => Promise<boolean>;
  selectClient: (client: ClientProfile | null) => void;
  setClientFilters: (filters: Partial<ClientFilters>) => void;
  clearClientFilters: () => void;

  // Task CRUD
  fetchTasks: (clientId: string) => Promise<void>;
  createTask: (clientId: string, data: Partial<ClientTask>) => Promise<ClientTask | null>;
  updateTask: (clientId: string, taskId: string, data: Partial<ClientTask>) => Promise<ClientTask | null>;
  deleteTask: (clientId: string, taskId: string) => Promise<boolean>;
  setTaskFilters: (filters: Partial<TaskFilters>) => void;

  // Meeting CRUD
  fetchMeetings: (clientId: string) => Promise<void>;
  createMeeting: (clientId: string, data: Partial<ClientMeeting>) => Promise<ClientMeeting | null>;

  // Note CRUD
  fetchNotes: (clientId: string) => Promise<void>;
  createNote: (clientId: string, data: Partial<ClientNote>) => Promise<ClientNote | null>;

  // Document CRUD
  fetchDocuments: (clientId: string) => Promise<void>;
  createDocument: (clientId: string, data: Partial<ClientDocument>) => Promise<ClientDocument | null>;

  // Activity
  fetchActivities: (clientId: string, limit?: number) => Promise<void>;

  // Modal controls
  openClientFormModal: (mode: 'create' | 'edit') => void;
  closeClientFormModal: () => void;
  openTaskModal: (mode: 'create' | 'edit', task?: ClientTask) => void;
  closeTaskModal: () => void;
  openMeetingModal: (meeting?: ClientMeeting) => void;
  closeMeetingModal: () => void;
  openNoteModal: (note?: ClientNote) => void;
  closeNoteModal: () => void;

  // Utility
  getFilteredClients: () => ClientProfile[];
  getFilteredTasks: () => ClientTask[];
  getClientMetrics: () => {
    total: number;
    byTier: Record<ClientTier, number>;
    byHealth: Record<ContractHealth, number>;
    totalArr: number;
    avgHealthScore: number;
    atRiskCount: number;
  };
}

// ============================================
// Store Type
// ============================================

type ClientPortfolioStore = ClientPortfolioState & ClientPortfolioActions;

// ============================================
// Initial State
// ============================================

const initialState: ClientPortfolioState = {
  clients: [],
  isLoadingClients: false,
  clientsError: null,
  clientFilters: {
    search: '',
    tier: 'all',
    health: 'all',
    tags: [],
  },

  selectedClient: null,
  isLoadingClient: false,
  clientError: null,

  tasks: [],
  isLoadingTasks: false,
  taskFilters: {
    status: 'all',
    priority: 'all',
    assignee: 'all',
  },

  meetings: [],
  isLoadingMeetings: false,

  notes: [],
  isLoadingNotes: false,

  documents: [],
  isLoadingDocuments: false,

  activities: [],
  isLoadingActivities: false,

  isFormModalOpen: false,
  formModalMode: 'create',
  isTaskModalOpen: false,
  taskModalMode: 'create',
  selectedTask: null,
  isMeetingModalOpen: false,
  selectedMeeting: null,
  isNoteModalOpen: false,
  selectedNote: null,
};

// ============================================
// Store Implementation
// ============================================

export const useClientPortfolioStore = create<ClientPortfolioStore>((set, get) => ({
  ...initialState,

  // ============================================
  // Client CRUD Actions
  // ============================================

  fetchClients: async () => {
    set({ isLoadingClients: true, clientsError: null });
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      set({ clients: data.clients, isLoadingClients: false });
    } catch (error) {
      set({
        clientsError: error instanceof Error ? error.message : 'Unknown error',
        isLoadingClients: false,
      });
    }
  },

  fetchClientById: async (id: string) => {
    set({ isLoadingClient: true, clientError: null });
    try {
      const response = await fetch(`/api/clients/${id}`);
      if (!response.ok) throw new Error('Failed to fetch client');
      const data = await response.json();
      set({ selectedClient: data.client, isLoadingClient: false });
    } catch (error) {
      set({
        clientError: error instanceof Error ? error.message : 'Unknown error',
        isLoadingClient: false,
      });
    }
  },

  createClient: async (data) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create client');
      const result = await response.json();

      // Update local state
      set((state) => ({
        clients: [result.client, ...state.clients],
      }));

      return result.client;
    } catch (error) {
      console.error('Error creating client:', error);
      return null;
    }
  },

  updateClient: async (id, data) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update client');
      const result = await response.json();

      // Update local state
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? result.client : c)),
        selectedClient: state.selectedClient?.id === id ? result.client : state.selectedClient,
      }));

      return result.client;
    } catch (error) {
      console.error('Error updating client:', error);
      return null;
    }
  },

  deleteClient: async (id) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete client');

      // Update local state
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
        selectedClient: state.selectedClient?.id === id ? null : state.selectedClient,
      }));

      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      return false;
    }
  },

  selectClient: (client) => {
    set({ selectedClient: client });
  },

  setClientFilters: (filters) => {
    set((state) => ({
      clientFilters: { ...state.clientFilters, ...filters },
    }));
  },

  clearClientFilters: () => {
    set({
      clientFilters: {
        search: '',
        tier: 'all',
        health: 'all',
        tags: [],
      },
    });
  },

  // ============================================
  // Task CRUD Actions
  // ============================================

  fetchTasks: async (clientId) => {
    set({ isLoadingTasks: true });
    try {
      const response = await fetch(`/api/clients/${clientId}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      set({ tasks: data.tasks, isLoadingTasks: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ isLoadingTasks: false });
    }
  },

  createTask: async (clientId, data) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create task');
      const result = await response.json();

      set((state) => ({
        tasks: [result.task, ...state.tasks],
      }));

      return result.task;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  },

  updateTask: async (clientId, taskId, data) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update task');
      const result = await response.json();

      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? result.task : t)),
      }));

      return result.task;
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  },

  deleteTask: async (clientId, taskId) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');

      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      }));

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  },

  setTaskFilters: (filters) => {
    set((state) => ({
      taskFilters: { ...state.taskFilters, ...filters },
    }));
  },

  // ============================================
  // Meeting CRUD Actions
  // ============================================

  fetchMeetings: async (clientId) => {
    set({ isLoadingMeetings: true });
    try {
      const response = await fetch(`/api/clients/${clientId}/meetings`);
      if (!response.ok) throw new Error('Failed to fetch meetings');
      const data = await response.json();
      set({ meetings: data.meetings, isLoadingMeetings: false });
    } catch (error) {
      console.error('Error fetching meetings:', error);
      set({ isLoadingMeetings: false });
    }
  },

  createMeeting: async (clientId, data) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create meeting');
      const result = await response.json();

      set((state) => ({
        meetings: [result.meeting, ...state.meetings],
      }));

      return result.meeting;
    } catch (error) {
      console.error('Error creating meeting:', error);
      return null;
    }
  },

  // ============================================
  // Note CRUD Actions
  // ============================================

  fetchNotes: async (clientId) => {
    set({ isLoadingNotes: true });
    try {
      const response = await fetch(`/api/clients/${clientId}/notes`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      set({ notes: data.notes, isLoadingNotes: false });
    } catch (error) {
      console.error('Error fetching notes:', error);
      set({ isLoadingNotes: false });
    }
  },

  createNote: async (clientId, data) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create note');
      const result = await response.json();

      set((state) => ({
        notes: [result.note, ...state.notes],
      }));

      return result.note;
    } catch (error) {
      console.error('Error creating note:', error);
      return null;
    }
  },

  // ============================================
  // Document CRUD Actions
  // ============================================

  fetchDocuments: async (clientId) => {
    set({ isLoadingDocuments: true });
    try {
      const response = await fetch(`/api/clients/${clientId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      set({ documents: data.documents, isLoadingDocuments: false });
    } catch (error) {
      console.error('Error fetching documents:', error);
      set({ isLoadingDocuments: false });
    }
  },

  createDocument: async (clientId, data) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create document');
      const result = await response.json();

      set((state) => ({
        documents: [result.document, ...state.documents],
      }));

      return result.document;
    } catch (error) {
      console.error('Error creating document:', error);
      return null;
    }
  },

  // ============================================
  // Activity Actions
  // ============================================

  fetchActivities: async (clientId, limit = 50) => {
    set({ isLoadingActivities: true });
    try {
      const response = await fetch(`/api/clients/${clientId}/activity?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      set({ activities: data.activities, isLoadingActivities: false });
    } catch (error) {
      console.error('Error fetching activities:', error);
      set({ isLoadingActivities: false });
    }
  },

  // ============================================
  // Modal Control Actions
  // ============================================

  openClientFormModal: (mode) => {
    set({ isFormModalOpen: true, formModalMode: mode });
  },

  closeClientFormModal: () => {
    set({ isFormModalOpen: false });
  },

  openTaskModal: (mode, task) => {
    set({ isTaskModalOpen: true, taskModalMode: mode, selectedTask: task || null });
  },

  closeTaskModal: () => {
    set({ isTaskModalOpen: false, selectedTask: null });
  },

  openMeetingModal: (meeting) => {
    set({ isMeetingModalOpen: true, selectedMeeting: meeting || null });
  },

  closeMeetingModal: () => {
    set({ isMeetingModalOpen: false, selectedMeeting: null });
  },

  openNoteModal: (note) => {
    set({ isNoteModalOpen: true, selectedNote: note || null });
  },

  closeNoteModal: () => {
    set({ isNoteModalOpen: false, selectedNote: null });
  },

  // ============================================
  // Utility Functions
  // ============================================

  getFilteredClients: () => {
    const { clients, clientFilters } = get();

    return clients.filter((client) => {
      // Search filter
      if (clientFilters.search) {
        const search = clientFilters.search.toLowerCase();
        const matchesSearch =
          client.name.toLowerCase().includes(search) ||
          client.industry.toLowerCase().includes(search) ||
          client.contact.name.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Tier filter
      if (clientFilters.tier !== 'all' && client.tier !== clientFilters.tier) {
        return false;
      }

      // Health filter
      if (clientFilters.health !== 'all' && client.contractHealth !== clientFilters.health) {
        return false;
      }

      // Tags filter
      if (clientFilters.tags.length > 0) {
        const hasMatchingTag = clientFilters.tags.some((tag) => client.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  },

  getFilteredTasks: () => {
    const { tasks, taskFilters } = get();

    return tasks.filter((task) => {
      if (taskFilters.status !== 'all' && task.status !== taskFilters.status) {
        return false;
      }
      if (taskFilters.priority !== 'all' && task.priority !== taskFilters.priority) {
        return false;
      }
      if (taskFilters.assignee !== 'all' && task.assignee !== taskFilters.assignee) {
        return false;
      }
      return true;
    });
  },

  getClientMetrics: () => {
    const { clients } = get();

    const byTier: Record<ClientTier, number> = {
      enterprise: 0,
      growth: 0,
      starter: 0,
    };

    const byHealth: Record<ContractHealth, number> = {
      healthy: 0,
      'at-risk': 0,
      churning: 0,
      expanding: 0,
    };

    let totalArr = 0;
    let totalHealthScore = 0;
    let atRiskCount = 0;

    clients.forEach((client) => {
      byTier[client.tier]++;
      byHealth[client.contractHealth]++;
      totalArr += client.financials.arr;
      totalHealthScore += client.financials.healthScore;

      if (client.contractHealth === 'at-risk' || client.contractHealth === 'churning') {
        atRiskCount++;
      }
    });

    return {
      total: clients.length,
      byTier,
      byHealth,
      totalArr,
      avgHealthScore: clients.length > 0 ? totalHealthScore / clients.length : 0,
      atRiskCount,
    };
  },
}));
