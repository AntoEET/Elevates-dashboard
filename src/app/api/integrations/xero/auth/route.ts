import { NextResponse } from 'next/server';
import { xeroService } from '@/infrastructure/services/XeroService';

/**
 * GET /api/integrations/xero/auth
 * Initiates Xero OAuth 2.0 flow
 */
export async function GET() {
  try {
    // Generate OAuth consent URL
    const consentUrl = await xeroService.buildConsentUrl();

    // Redirect user to Xero authorization page
    return NextResponse.redirect(consentUrl);
  } catch (error) {
    console.error('Xero auth error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate Xero authorization',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
