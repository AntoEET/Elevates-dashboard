import { promises as fs } from 'fs';
import { join } from 'path';
import { SyncMetadata } from '@/infrastructure/services/google-calendar/google-calendar.types';

const SYNC_DIR = join(process.cwd(), 'src', 'data', 'calendar-sync');

/**
 * Ensures the sync metadata directory exists
 */
async function ensureSyncDir(): Promise<void> {
  try {
    await fs.mkdir(SYNC_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

/**
 * Gets the file path for a user's sync metadata
 */
function getSyncFilePath(userId: string): string {
  return join(SYNC_DIR, `${userId}.json`);
}

/**
 * Loads sync metadata for a user
 */
export async function loadSyncMetadata(userId: string): Promise<SyncMetadata | null> {
  const filePath = getSyncFilePath(userId);

  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null; // File doesn't exist
    }
    throw error;
  }
}

/**
 * Saves sync metadata for a user
 */
export async function saveSyncMetadata(metadata: SyncMetadata): Promise<void> {
  await ensureSyncDir();

  const filePath = getSyncFilePath(metadata.userId);
  await fs.writeFile(filePath, JSON.stringify(metadata, null, 2), 'utf8');
}

/**
 * Updates the sync token for a user
 */
export async function updateSyncToken(userId: string, syncToken: string): Promise<void> {
  let metadata = await loadSyncMetadata(userId);

  if (!metadata) {
    metadata = {
      userId,
      lastFullSync: null,
      lastIncrementalSync: null,
      syncToken: null,
      eventMappings: [],
    };
  }

  metadata.syncToken = syncToken;
  metadata.lastIncrementalSync = new Date().toISOString();

  await saveSyncMetadata(metadata);
}

/**
 * Marks a full sync as completed
 */
export async function markFullSyncComplete(userId: string, syncToken?: string): Promise<void> {
  let metadata = await loadSyncMetadata(userId);

  if (!metadata) {
    metadata = {
      userId,
      lastFullSync: null,
      lastIncrementalSync: null,
      syncToken: null,
      eventMappings: [],
    };
  }

  metadata.lastFullSync = new Date().toISOString();
  if (syncToken) {
    metadata.syncToken = syncToken;
  }

  await saveSyncMetadata(metadata);
}

/**
 * Adds or updates an event mapping
 */
export async function upsertEventMapping(
  userId: string,
  localId: string,
  googleEventId: string,
  googleCalendarId: string,
  etag: string
): Promise<void> {
  let metadata = await loadSyncMetadata(userId);

  if (!metadata) {
    metadata = {
      userId,
      lastFullSync: null,
      lastIncrementalSync: null,
      syncToken: null,
      eventMappings: [],
    };
  }

  const existingIndex = metadata.eventMappings.findIndex((m) => m.localId === localId);

  const mapping = {
    localId,
    googleEventId,
    googleCalendarId,
    etag,
    lastSyncedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    metadata.eventMappings[existingIndex] = mapping;
  } else {
    metadata.eventMappings.push(mapping);
  }

  await saveSyncMetadata(metadata);
}

/**
 * Removes an event mapping
 */
export async function removeEventMapping(userId: string, localId: string): Promise<void> {
  const metadata = await loadSyncMetadata(userId);

  if (!metadata) {
    return;
  }

  metadata.eventMappings = metadata.eventMappings.filter((m) => m.localId !== localId);

  await saveSyncMetadata(metadata);
}

/**
 * Gets the Google event ID for a local event
 */
export async function getGoogleEventId(userId: string, localId: string): Promise<string | null> {
  const metadata = await loadSyncMetadata(userId);

  if (!metadata) {
    return null;
  }

  const mapping = metadata.eventMappings.find((m) => m.localId === localId);
  return mapping?.googleEventId || null;
}
