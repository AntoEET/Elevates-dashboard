import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/lib/auth';
import {
  updateEvent,
  deleteEvent,
} from '@/infrastructure/services/google-calendar/google-calendar.service';
import {
  upsertEventMapping,
  removeEventMapping,
} from '@/infrastructure/repositories/sync-metadata.repository';

/**
 * PATCH /api/calendar/google/events/[eventId]
 * Updates an event in Google Calendar
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
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

    // Update event in Google Calendar
    const updatedEvent = await updateEvent(session.userId, event);

    // Update event mapping
    if (updatedEvent.googleEventId && updatedEvent.googleCalendarId) {
      await upsertEventMapping(
        session.userId,
        updatedEvent.id,
        updatedEvent.googleEventId,
        updatedEvent.googleCalendarId,
        updatedEvent.etag || ''
      );
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update event',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calendar/google/events/[eventId]
 * Deletes an event from Google Calendar
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
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

    const { eventId } = await params;
    const url = new URL(request.url);
    const googleEventId = url.searchParams.get('googleEventId');

    if (!googleEventId) {
      return NextResponse.json(
        { error: 'Missing googleEventId parameter' },
        { status: 400 }
      );
    }

    // Delete event from Google Calendar
    await deleteEvent(session.userId, googleEventId);

    // Remove event mapping
    await removeEventMapping(session.userId, eventId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete event',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
