import { calendar_v3 } from 'googleapis';

export type GoogleCalendarEvent = calendar_v3.Schema$Event;

export interface SyncMetadata {
  userId: string;
  lastFullSync: string | null;
  lastIncrementalSync: string | null;
  syncToken: string | null;
  eventMappings: EventMapping[];
}

export interface EventMapping {
  localId: string;
  googleEventId: string;
  googleCalendarId: string;
  etag: string;
  lastSyncedAt: string;
}

export interface SyncResult {
  success: boolean;
  eventsAdded: number;
  eventsUpdated: number;
  eventsDeleted: number;
  error?: string;
}

export interface ConflictResolution {
  action: 'update-local' | 'update-google';
  source: 'local' | 'google';
  event: any;
}
