import { NextResponse } from 'next/server';
import { xeroService } from '@/infrastructure/services/XeroService';
import { stripeService } from '@/infrastructure/services/StripeService';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * GET /api/integrations/status
 * Check connection status for all integrations
 */
export async function GET() {
  try {
    // Check Xero connection
    const xeroConnected = await xeroService.isConnected();
    let xeroLastSync: Date | null = null;

    if (xeroConnected) {
      try {
        const metadataPath = path.join(
          process.cwd(),
          'src',
          'data',
          'integrations',
          'sync-metadata',
          'xero-sync.json'
        );
        const data = await fs.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(data);
        xeroLastSync = metadata.lastSyncAt ? new Date(metadata.lastSyncAt) : null;
      } catch {
        // No sync metadata yet
      }
    }

    // Check Stripe connection
    const stripeConnected = stripeService.isConnected();
    const stripeLastSync = stripeConnected ? await stripeService.getLastSyncTime() : null;

    return NextResponse.json({
      xero: {
        service: 'xero',
        connected: xeroConnected,
        lastSyncAt: xeroLastSync,
        status: xeroConnected ? 'active' : 'disconnected',
      },
      stripe: {
        service: 'stripe',
        connected: stripeConnected,
        lastSyncAt: stripeLastSync,
        status: stripeConnected ? 'active' : 'disconnected',
      },
    });
  } catch (error) {
    console.error('Error checking integration status:', error);
    return NextResponse.json(
      {
        error: 'Failed to check integration status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
