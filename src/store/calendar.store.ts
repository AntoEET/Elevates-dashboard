import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  color?: string;
  type: 'meeting' | 'task' | 'reminder' | 'event';
  source?: 'local' | 'google';
  googleEventId?: string;
  googleCalendarId?: string;
  lastSyncedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'error';
  etag?: string;
}

interface CalendarState {
  events: CalendarEvent[];
  selectedDate: string | null;
  googleConnected: boolean;
  googleSyncStatus: 'idle' | 'syncing' | 'error';
  lastSyncTime: string | null;
  syncError: string | null;
}

interface CalendarActions {
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<Omit<CalendarEvent, 'id'>>) => void;
  removeEvent: (id: string) => void;
  setSelectedDate: (date: string | null) => void;
  getEventsForDate: (date: string) => CalendarEvent[];
  getEventsForMonth: (year: number, month: number) => CalendarEvent[];
  setGoogleConnected: (connected: boolean) => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'error', error?: string) => void;
  mergeSyncedEvents: (googleEvents: CalendarEvent[]) => void;
  setLastSyncTime: (time: string | null) => void;
}

type CalendarStore = CalendarState & CalendarActions;

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      events: [
        // Sample events
        {
          id: '1',
          title: 'Team Standup',
          description: 'Daily sync with the team',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '09:30',
          color: '#3B82F6',
          type: 'meeting',
        },
        {
          id: '2',
          title: 'Q4 Planning Review',
          description: 'Review quarterly objectives',
          date: new Date().toISOString().split('T')[0],
          startTime: '14:00',
          endTime: '15:30',
          color: '#8B5CF6',
          type: 'meeting',
        },
        {
          id: '3',
          title: 'Client Call - Acme Corp',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          startTime: '11:00',
          endTime: '12:00',
          color: '#059669',
          type: 'meeting',
        },
      ],
      selectedDate: null,
      googleConnected: false,
      googleSyncStatus: 'idle',
      lastSyncTime: null,
      syncError: null,

      addEvent: (event) => {
        const newEvent: CalendarEvent = {
          ...event,
          id: crypto.randomUUID(),
          source: event.source || 'local',
          lastSyncedAt: new Date().toISOString(),
          syncStatus: get().googleConnected ? 'pending' : undefined,
        };
        set((state) => ({
          events: [...state.events, newEvent],
        }));

        // Sync to Google Calendar if connected
        if (get().googleConnected) {
          fetch('/api/calendar/google/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEvent),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                // Update event with Google data
                get().updateEvent(newEvent.id, {
                  googleEventId: data.event.googleEventId,
                  googleCalendarId: data.event.googleCalendarId,
                  syncStatus: 'synced',
                  source: 'google',
                  etag: data.event.etag,
                });
              }
            })
            .catch((error) => {
              console.error('Failed to sync event to Google:', error);
              get().updateEvent(newEvent.id, { syncStatus: 'error' });
            });
        }
      },

      updateEvent: (id, updates) => {
        const event = get().events.find((e) => e.id === id);

        set((state) => ({
          events: state.events.map((event) =>
            event.id === id
              ? {
                  ...event,
                  ...updates,
                  lastSyncedAt: new Date().toISOString(),
                  syncStatus: get().googleConnected && event.source === 'google' ? 'pending' : event.syncStatus,
                }
              : event
          ),
        }));

        // Sync to Google Calendar if connected and event is from Google
        if (get().googleConnected && event?.source === 'google' && event.googleEventId) {
          const updatedEvent = get().events.find((e) => e.id === id);
          if (updatedEvent) {
            fetch(`/api/calendar/google/events/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedEvent),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  get().updateEvent(id, {
                    syncStatus: 'synced',
                    etag: data.event.etag,
                  });
                }
              })
              .catch((error) => {
                console.error('Failed to sync event update to Google:', error);
                get().updateEvent(id, { syncStatus: 'error' });
              });
          }
        }
      },

      removeEvent: (id) => {
        const event = get().events.find((e) => e.id === id);

        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));

        // Sync deletion to Google Calendar if connected and event is from Google
        if (get().googleConnected && event?.source === 'google' && event.googleEventId) {
          fetch(`/api/calendar/google/events/${id}?googleEventId=${event.googleEventId}`, {
            method: 'DELETE',
          }).catch((error) => {
            console.error('Failed to delete event from Google:', error);
          });
        }
      },

      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },

      getEventsForDate: (date) => {
        return get().events.filter((event) => event.date === date);
      },

      getEventsForMonth: (year, month) => {
        return get().events.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate.getFullYear() === year && eventDate.getMonth() === month;
        });
      },

      setGoogleConnected: (connected) => {
        set({ googleConnected: connected });
      },

      setSyncStatus: (status, error) => {
        set({
          googleSyncStatus: status,
          syncError: error || null,
        });
      },

      mergeSyncedEvents: (googleEvents) => {
        set((state) => {
          const existingEvents = state.events;
          const mergedEvents = [...existingEvents];

          googleEvents.forEach((googleEvent) => {
            // Check if event already exists by googleEventId
            const existingIndex = mergedEvents.findIndex(
              (e) => e.googleEventId === googleEvent.googleEventId
            );

            if (existingIndex >= 0) {
              // Update existing event
              mergedEvents[existingIndex] = googleEvent;
            } else {
              // Add new event
              mergedEvents.push(googleEvent);
            }
          });

          return { events: mergedEvents };
        });
      },

      setLastSyncTime: (time) => {
        set({ lastSyncTime: time });
      },
    }),
    {
      name: 'elevates-calendar',
    }
  )
);
