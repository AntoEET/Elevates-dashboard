import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/lib/auth';
import { createEvent } from '@/infrastructure/services/google-calendar/google-calendar.service';
import { upsertEventMapping } from '@/infrastructure/repositories/sync-metadata.repository';

/**
 * POST /api/calendar/google/events
 * Creates a new event in Google Calendar
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const event = await request.json();

    // Create event in Google Calendar
    const createdEvent = await createEvent(session.userId, event);

    // Store event mapping
    if (createdEvent.googleEventId && createdEvent.googleCalendarId) {
      await upsertEventMapping(
        session.userId,
        createdEvent.id,
        createdEvent.googleEventId,
        createdEvent.googleCalendarId,
        createdEvent.etag || ''
      );
    }

    return NextResponse.json({
      success: true,
      event: createdEvent,
    });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create event',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
