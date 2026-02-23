import { google, calendar_v3 } from 'googleapis';
import { createOAuth2Client } from '@/lib/google-auth';
import { getValidAccessToken } from '@/infrastructure/services/oauth/token-refresh.service';
import { CalendarEvent } from '@/store/calendar.store';
import { mapGoogleEventToLocal, mapLocalEventToGoogle } from './google-calendar.mapper';
import { GoogleCalendarEvent, SyncResult } from './google-calendar.types';
import { retryWithBackoff } from '@/lib/retry';

const CALENDAR_ID = 'primary';

/**
 * Creates an authenticated Google Calendar API client
 */
async function getCalendarClient(userId: string): Promise<calendar_v3.Calendar> {
  const accessToken = await getValidAccessToken(userId);
  const oauth2Client = createOAuth2Client();

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Lists events from Google Calendar
 */
export async function listEvents(
  userId: string,
  options?: {
    timeMin?: Date;
    timeMax?: Date;
    maxResults?: number;
    syncToken?: string;
  }
): Promise<{ events: CalendarEvent[]; nextSyncToken?: string }> {
  return retryWithBackoff(async () => {
    const calendar = await getCalendarClient(userId);

    try {
      const response = await calendar.events.list({
        calendarId: CALENDAR_ID,
        timeMin: options?.timeMin?.toISOString(),
        timeMax: options?.timeMax?.toISOString(),
        maxResults: options?.maxResults || 250,
        singleEvents: true,
        orderBy: 'startTime',
        syncToken: options?.syncToken,
      });

      const googleEvents = response.data.items || [];
      const localEvents = googleEvents
        .filter((event) => event.id && event.summary) // Filter out invalid events
        .map((event) => mapGoogleEventToLocal(event, CALENDAR_ID));

      return {
        events: localEvents,
        nextSyncToken: response.data.nextSyncToken || undefined,
      };
    } catch (error: any) {
      // If sync token is invalid, we need to do a full sync
      if (error.code === 410) {
        console.warn('Sync token invalid, full sync required');
        return listEvents(userId, { ...options, syncToken: undefined });
      }
      throw error;
    }
  });
}

/**
 * Gets a single event from Google Calendar
 */
export async function getEvent(
  userId: string,
  eventId: string
): Promise<CalendarEvent | null> {
  const calendar = await getCalendarClient(userId);

  try {
    const response = await calendar.events.get({
      calendarId: CALENDAR_ID,
      eventId,
    });

    if (response.data) {
      return mapGoogleEventToLocal(response.data, CALENDAR_ID);
    }

    return null;
  } catch (error: any) {
    if (error.code === 404) {
      return null; // Event not found
    }
    throw error;
  }
}

/**
 * Creates a new event in Google Calendar
 */
export async function createEvent(
  userId: string,
  event: CalendarEvent
): Promise<CalendarEvent> {
  return retryWithBackoff(async () => {
    const calendar = await getCalendarClient(userId);

    const googleEvent = mapLocalEventToGoogle(event);

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: googleEvent,
    });

    return mapGoogleEventToLocal(response.data, CALENDAR_ID);
  });
}

/**
 * Updates an event in Google Calendar
 */
export async function updateEvent(
  userId: string,
  event: CalendarEvent
): Promise<CalendarEvent> {
  if (!event.googleEventId) {
    throw new Error('Event does not have a Google Calendar ID');
  }

  return retryWithBackoff(async () => {
    const calendar = await getCalendarClient(userId);
    const googleEvent = mapLocalEventToGoogle(event);

    const response = await calendar.events.update({
      calendarId: CALENDAR_ID,
      eventId: event.googleEventId,
      requestBody: googleEvent,
    });

    return mapGoogleEventToLocal(response.data, CALENDAR_ID);
  });
}

/**
 * Deletes an event from Google Calendar
 */
export async function deleteEvent(userId: string, googleEventId: string): Promise<void> {
  return retryWithBackoff(async () => {
    const calendar = await getCalendarClient(userId);

    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: googleEventId,
    });
  });
}

/**
 * Performs a full sync of events from Google Calendar
 */
export async function fullSync(userId: string): Promise<SyncResult> {
  try {
    // Get events from the last 90 days
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() - 90);

    const { events, nextSyncToken } = await listEvents(userId, {
      timeMin,
      maxResults: 250,
    });

    return {
      success: true,
      eventsAdded: events.length,
      eventsUpdated: 0,
      eventsDeleted: 0,
    };
  } catch (error) {
    console.error('Full sync failed:', error);
    return {
      success: false,
      eventsAdded: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Performs an incremental sync using a sync token
 */
export async function incrementalSync(
  userId: string,
  syncToken: string
): Promise<SyncResult> {
  try {
    const { events, nextSyncToken } = await listEvents(userId, {
      syncToken,
    });

    return {
      success: true,
      eventsAdded: events.length,
      eventsUpdated: 0,
      eventsDeleted: 0,
    };
  } catch (error) {
    console.error('Incremental sync failed:', error);
    return {
      success: false,
      eventsAdded: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
