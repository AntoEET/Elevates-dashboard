import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/lib/auth';
import { deleteTokens } from '@/infrastructure/services/oauth/token-storage.service';

/**
 * POST /api/calendar/google/auth/disconnect
 * Disconnects Google Calendar by deleting stored tokens
 */
export async function POST() {
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

    // Delete tokens
    await deleteTokens(session.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar' },
      { status: 500 }
    );
  }
}
