import { NextRequest, NextResponse } from 'next/server';
import { xeroService } from '@/infrastructure/services/XeroService';

/**
 * GET /api/integrations/xero/callback
 * Handles OAuth callback from Xero
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth error (user denied access)
    if (error) {
      console.error('Xero OAuth error:', error);
      return NextResponse.redirect(
        new URL('/finance/settings?error=xero_denied', request.url)
      );
    }

    // Handle missing code
    if (!code) {
      return NextResponse.redirect(
        new URL('/finance/settings?error=missing_code', request.url)
      );
    }

    // Exchange code for tokens
    await xeroService.exchangeCodeForTokens(code);

    // Trigger initial data sync in background (don't wait for it)
    fetch(new URL('/api/integrations/xero/sync', request.url).toString(), {
      method: 'POST',
    }).catch((err) => {
      console.error('Initial sync failed:', err);
    });

    // Redirect to settings page with success message
    return NextResponse.redirect(
      new URL('/finance/settings?connected=xero', request.url)
    );
  } catch (error) {
    console.error('Xero callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/finance/settings?error=xero_callback&message=${encodeURIComponent(
          error instanceof Error ? error.message : 'Unknown error'
        )}`,
        request.url
      )
    );
  }
}
