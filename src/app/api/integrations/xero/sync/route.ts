import { NextResponse } from 'next/server';
import { xeroService } from '@/infrastructure/services/XeroService';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * POST /api/integrations/xero/sync
 * Syncs data from Xero (accounts, transactions, reports)
 */
export async function POST() {
  try {
    // Check if Xero is connected
    const isConnected = await xeroService.isConnected();
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Xero not connected. Please connect your account first.' },
        { status: 401 }
      );
    }

    // Calculate date range (last 12 months)
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 12);

    // Fetch data from Xero
    const [accounts, transactions, balanceSheet, profitLoss] = await Promise.all([
      xeroService.getAccounts(),
      xeroService.getTransactions(fromDate, toDate),
      xeroService.getBalanceSheet(toDate),
      xeroService.getProfitAndLoss(fromDate, toDate),
    ]);

    // Save data to cache (/tmp for serverless compatibility)
    await Promise.all([
      fs.writeFile(
        path.join('/tmp', 'xero-accounts.json'),
        JSON.stringify(accounts, null, 2)
      ),
      fs.writeFile(
        path.join('/tmp', 'xero-transactions.json'),
        JSON.stringify(transactions, null, 2)
      ),
      fs.writeFile(
        path.join('/tmp', 'xero-balance-sheet.json'),
        JSON.stringify(balanceSheet, null, 2)
      ),
      fs.writeFile(
        path.join('/tmp', 'xero-profit-loss.json'),
        JSON.stringify(profitLoss, null, 2)
      ),
    ]);

    // Save sync metadata
    await fs.writeFile(
      path.join('/tmp', 'xero-sync-metadata.json'),
      JSON.stringify(
        {
          lastSyncAt: new Date().toISOString(),
          recordsCounts: {
            accounts: accounts.length,
            transactions: transactions.length,
          },
        },
        null,
        2
      )
    );

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      counts: {
        accounts: accounts.length,
        transactions: transactions.length,
      },
    });
  } catch (error) {
    console.error('Xero sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync Xero data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/integrations/xero/sync
 * Check last sync status
 */
export async function GET() {
  try {
    const metadataPath = path.join('/tmp', 'xero-sync-metadata.json');

    try {
      const data = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(data);
      return NextResponse.json(metadata);
    } catch {
      return NextResponse.json({
        lastSyncAt: null,
        recordsCounts: null,
      });
    }
  } catch (error) {
    console.error('Error reading sync metadata:', error);
    return NextResponse.json(
      { error: 'Failed to read sync metadata' },
      { status: 500 }
    );
  }
}
