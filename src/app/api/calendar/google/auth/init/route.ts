import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateAuthUrl } from '@/lib/google-auth';
import { verifySessionCookie } from '@/lib/auth';

/**
 * GET /api/calendar/google/auth/init
 * Initiates the OAuth flow by redirecting to Google's consent screen
 */
export async function GET() {
  try {
    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('elevates-session');

    // Debug logging
    console.log('=== OAuth Init Debug ===');
    console.log('All cookies:', cookieStore.getAll().map(c => c.name));
    console.log('Session cookie exists:', !!sessionCookie);
    if (sessionCookie) {
      console.log('Session cookie value length:', sessionCookie.value.length);
    }

    if (!sessionCookie) {
      console.error('No session cookie found');
      return NextResponse.json({ error: 'Not authenticated - no session cookie found' }, { status: 401 });
    }

    // Verify session and get user ID
    const session = verifySessionCookie(sessionCookie.value);
    console.log('Session verification result:', !!session);
    if (session) {
      console.log('User ID:', session.userId);
    }

    if (!session) {
      console.error('Invalid session cookie');
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Generate OAuth URL with state parameter
    const authUrl = generateAuthUrl(session.userId);
    console.log('Generated auth URL, redirecting to Google');

    // Redirect to Google's OAuth consent screen
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('OAuth init error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
