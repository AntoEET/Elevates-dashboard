import { z } from 'zod';

/**
 * Schema for Google Calendar event creation/update
 */
export const googleCalendarEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
  color: z.string().optional(),
  type: z.enum(['meeting', 'task', 'reminder', 'event']),
  source: z.enum(['local', 'google']).optional(),
  googleEventId: z.string().optional(),
  googleCalendarId: z.string().optional(),
  syncStatus: z.enum(['synced', 'pending', 'error']).optional(),
});

/**
 * Schema for OAuth configuration
 */
export const oauthConfigSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  redirectUri: z.string().url('Invalid redirect URI'),
  stateSecret: z.string().min(32, 'State secret must be at least 32 characters'),
  encryptionKey: z.string().min(32, 'Encryption key must be at least 32 characters'),
});

/**
 * Schema for sync metadata
 */
export const syncMetadataSchema = z.object({
  userId: z.string(),
  lastFullSync: z.string().nullable(),
  lastIncrementalSync: z.string().nullable(),
  syncToken: z.string().nullable(),
  eventMappings: z.array(
    z.object({
      localId: z.string(),
      googleEventId: z.string(),
      googleCalendarId: z.string(),
      etag: z.string(),
      lastSyncedAt: z.string(),
    })
  ),
});

export type GoogleCalendarEventInput = z.infer<typeof googleCalendarEventSchema>;
export type OAuthConfig = z.infer<typeof oauthConfigSchema>;
export type SyncMetadata = z.infer<typeof syncMetadataSchema>;
