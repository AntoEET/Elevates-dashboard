'use client';

import { create } from 'zustand';

// Clear old persisted auth data from localStorage (migration from old implementation)
if (typeof window !== 'undefined') {
  localStorage.removeItem('elevates-auth');
}

interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
  isLoading: boolean;
  error: string | null;
  login: (userId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,

  login: async (userId: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = response.status === 429
          ? `Too many attempts. Try again in ${data.resetIn} seconds.`
          : data.error || 'Invalid credentials';
        set({ isLoading: false, error: errorMessage });
        return false;
      }

      set({ isAuthenticated: true, user: data.user, isLoading: false, error: null });
      return true;
    } catch (error) {
      set({ isLoading: false, error: 'Network error. Please try again.' });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear any old localStorage data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('elevates-auth');
    }

    set({ isAuthenticated: false, user: null, isLoading: false, error: null });
  },

  checkSession: async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (response.ok && data.authenticated) {
        set({ isAuthenticated: true, user: data.user });
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } catch (error) {
      set({ isAuthenticated: false, user: null });
    }
  },

  clearError: () => set({ error: null }),
}));
