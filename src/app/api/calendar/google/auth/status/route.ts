import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/lib/auth';
import { hasTokens } from '@/infrastructure/services/oauth/token-storage.service';

/**
 * GET /api/calendar/google/auth/status
 * Checks if the user has connected their Google Calendar
 */
export async function GET() {
  try {
    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('elevates-session');

    console.log('=== Auth Status Debug ===');
    console.log('All cookies:', cookieStore.getAll().map(c => c.name));
    console.log('Session cookie exists:', !!sessionCookie);

    if (!sessionCookie) {
      console.log('No session cookie in status check');
      return NextResponse.json({ connected: false }, { status: 401 });
    }

    // Verify session and get user ID
    const session = verifySessionCookie(sessionCookie.value);
    console.log('Session valid:', !!session);

    if (!session) {
      console.log('Invalid session in status check');
      return NextResponse.json({ connected: false }, { status: 401 });
    }

    // Check if user has tokens stored
    const connected = await hasTokens(session.userId);
    console.log('Has tokens:', connected);

    return NextResponse.json({
      connected,
      userId: session.userId,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 }
    );
  }
}
