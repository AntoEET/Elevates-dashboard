import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/lib/auth';
import { listEvents, updateEvent as updateGoogleEvent } from '@/infrastructure/services/google-calendar/google-calendar.service';
import {
  loadSyncMetadata,
  markFullSyncComplete,
  updateSyncToken,
} from '@/infrastructure/repositories/sync-metadata.repository';
import { resolveConflict } from '@/infrastructure/services/google-calendar/google-calendar.mapper';

/**
 * GET /api/calendar/google/sync
 * Syncs events from Google Calendar
 */
export async function GET() {
  try {
    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('elevates-session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify session and get user ID
    const session = verifySessionCookie(sessionCookie.value);
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Load sync metadata
    const syncMetadata = await loadSyncMetadata(session.userId);

    let events;
    let nextSyncToken;

    if (syncMetadata?.syncToken) {
      // Incremental sync using sync token
      try {
        const result = await listEvents(session.userId, {
          syncToken: syncMetadata.syncToken,
        });
        events = result.events;
        nextSyncToken = result.nextSyncToken;

        // Update sync token
        if (nextSyncToken) {
          await updateSyncToken(session.userId, nextSyncToken);
        }
      } catch (error: any) {
        // If sync token is invalid (410), fall back to full sync
        if (error.code === 410) {
          console.warn('Sync token invalid, performing full sync');
          const timeMin = new Date();
          timeMin.setDate(timeMin.getDate() - 90);

          const result = await listEvents(session.userId, {
            timeMin,
            maxResults: 250,
          });
          events = result.events;
          nextSyncToken = result.nextSyncToken;

          // Mark full sync complete
          await markFullSyncComplete(session.userId, nextSyncToken);
        } else {
          throw error;
        }
      }
    } else {
      // Full sync - get events from the last 90 days
      const timeMin = new Date();
      timeMin.setDate(timeMin.getDate() - 90);

      const result = await listEvents(session.userId, {
        timeMin,
        maxResults: 250,
      });
      events = result.events;
      nextSyncToken = result.nextSyncToken;

      // Mark full sync complete
      await markFullSyncComplete(session.userId, nextSyncToken);
    }

    return NextResponse.json({
      success: true,
      events,
      syncToken: nextSyncToken,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync with Google Calendar',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
