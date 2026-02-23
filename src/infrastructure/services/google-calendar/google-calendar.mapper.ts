import { CalendarEvent } from '@/store/calendar.store';
import { GoogleCalendarEvent } from './google-calendar.types';

const DEFAULT_COLOR = '#3B82F6';

/**
 * Maps a Google Calendar event to local CalendarEvent format
 */
export function mapGoogleEventToLocal(
  googleEvent: GoogleCalendarEvent,
  googleCalendarId: string
): CalendarEvent {
  const id = googleEvent.id || crypto.randomUUID();

  // Extract date and time
  let date: string;
  let startTime: string | undefined;
  let endTime: string | undefined;

  if (googleEvent.start?.dateTime) {
    // Event with specific time
    const startDate = new Date(googleEvent.start.dateTime);
    date = startDate.toISOString().split('T')[0];
    startTime = startDate.toTimeString().slice(0, 5); // HH:mm format

    if (googleEvent.end?.dateTime) {
      const endDate = new Date(googleEvent.end.dateTime);
      endTime = endDate.toTimeString().slice(0, 5);
    }
  } else if (googleEvent.start?.date) {
    // All-day event
    date = googleEvent.start.date;
  } else {
    // Fallback to today if no date
    date = new Date().toISOString().split('T')[0];
  }

  // Determine event type based on Google event properties
  let type: 'meeting' | 'task' | 'reminder' | 'event' = 'event';
  if (googleEvent.eventType === 'default') {
    type = 'meeting';
  }

  return {
    id,
    title: googleEvent.summary || 'Untitled Event',
    description: googleEvent.description || undefined,
    date,
    startTime,
    endTime,
    color: DEFAULT_COLOR, // We can map Google Calendar colors later
    type,
    source: 'google',
    googleEventId: googleEvent.id || undefined,
    googleCalendarId,
    lastSyncedAt: googleEvent.updated || new Date().toISOString(),
    syncStatus: 'synced',
    etag: googleEvent.etag || undefined,
  };
}

/**
 * Maps a local CalendarEvent to Google Calendar event format
 */
export function mapLocalEventToGoogle(event: CalendarEvent): GoogleCalendarEvent {
  const googleEvent: GoogleCalendarEvent = {
    summary: event.title,
    description: event.description,
  };

  // Set start and end times
  if (event.startTime) {
    // Event with specific time
    const startDateTime = new Date(`${event.date}T${event.startTime}:00`);
    googleEvent.start = {
      dateTime: startDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    if (event.endTime) {
      const endDateTime = new Date(`${event.date}T${event.endTime}:00`);
      googleEvent.end = {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    } else {
      // Default to 1 hour duration
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
      googleEvent.end = {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
  } else {
    // All-day event
    googleEvent.start = {
      date: event.date,
    };
    googleEvent.end = {
      date: event.date,
    };
  }

  return googleEvent;
}

/**
 * Resolves a conflict between local and Google events (newest wins)
 */
export function resolveConflict(
  localEvent: CalendarEvent,
  googleEvent: GoogleCalendarEvent
): 'update-local' | 'update-google' {
  const localTime = new Date(localEvent.lastSyncedAt || 0).getTime();
  const googleTime = new Date(googleEvent.updated || 0).getTime();

  return googleTime > localTime ? 'update-local' : 'update-google';
}
