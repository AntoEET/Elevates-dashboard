import { NextRequest, NextResponse } from 'next/server';
import { createOAuth2Client, verifyStateParameter } from '@/lib/google-auth';
import { saveTokens } from '@/infrastructure/services/oauth/token-storage.service';

/**
 * GET /api/calendar/google/auth/callback
 * Handles the OAuth callback from Google
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Check for OAuth errors
  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/?error=oauth_${error}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/?error=oauth_missing_params', request.url)
    );
  }

  try {
    // Verify state parameter (CSRF protection)
    const userId = verifyStateParameter(state);

    // Exchange authorization code for tokens
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Missing tokens from OAuth response');
    }

    // Save encrypted tokens
    await saveTokens(userId, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expiry_date || Date.now() + 3600 * 1000,
      scope: tokens.scope || '',
      tokenType: tokens.token_type || 'Bearer',
    });

    // Redirect back to dashboard with success
    return NextResponse.redirect(
      new URL('/?google_calendar_connected=true', request.url)
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/?error=oauth_callback_failed', request.url)
    );
  }
}
