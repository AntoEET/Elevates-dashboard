import { XeroClient } from 'xero-node';
import type {
  XeroAccount,
  XeroTransaction,
  XeroBalanceSheet,
  XeroProfitLoss,
  XeroTokens,
  XeroTenant,
} from '@/shared/schemas/xero';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * XeroService - Handles all Xero API interactions
 */
export class XeroService {
  private client: XeroClient;
  private tokensPath: string;

  constructor() {
    this.client = new XeroClient({
      clientId: process.env.XERO_CLIENT_ID!,
      clientSecret: process.env.XERO_CLIENT_SECRET!,
      redirectUris: [process.env.XERO_REDIRECT_URI!],
      scopes: 'openid profile email accounting.transactions accounting.reports.read accounting.settings'.split(' '),
    });

    this.tokensPath = path.join(process.cwd(), 'src', 'data', 'integrations', 'xero-tokens', 'tokens.json');
  }

  // ============================================================================
  // OAuth Flow
  // ============================================================================

  /**
   * Generate OAuth authorization URL
   */
  async buildConsentUrl(): Promise<string> {
    return await this.client.buildConsentUrl();
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<XeroTokens> {
    const tokenSet = await this.client.apiCallback(process.env.XERO_REDIRECT_URI + `?code=${code}`);

    const tokens: XeroTokens = {
      access_token: tokenSet.access_token!,
      refresh_token: tokenSet.refresh_token!,
      expires_at: tokenSet.expires_at!,
      token_type: 'Bearer',
      scope: tokenSet.scope,
    };

    await this.saveTokens(tokens);
    return tokens;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<XeroTokens> {
    const tokens = await this.loadTokens();

    this.client.setTokenSet({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
    });

    const newTokenSet = await this.client.refreshToken();

    const newTokens: XeroTokens = {
      access_token: newTokenSet.access_token!,
      refresh_token: newTokenSet.refresh_token!,
      expires_at: newTokenSet.expires_at!,
      token_type: 'Bearer',
      scope: newTokenSet.scope,
    };

    await this.saveTokens(newTokens);
    return newTokens;
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(tokens: XeroTokens): boolean {
    return Date.now() >= tokens.expires_at * 1000;
  }

  /**
   * Ensure valid token (refresh if needed)
   */
  private async ensureValidToken(): Promise<void> {
    const tokens = await this.loadTokens();

    if (this.isTokenExpired(tokens)) {
      await this.refreshAccessToken();
    }

    const currentTokens = await this.loadTokens();
    this.client.setTokenSet({
      access_token: currentTokens.access_token,
      refresh_token: currentTokens.refresh_token,
      expires_at: currentTokens.expires_at,
    });
  }

  // ============================================================================
  // Token Management
  // ============================================================================

  /**
   * Save tokens to file
   */
  private async saveTokens(tokens: XeroTokens): Promise<void> {
    const dir = path.dirname(this.tokensPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.tokensPath, JSON.stringify(tokens, null, 2));
  }

  /**
   * Load tokens from file
   */
  private async loadTokens(): Promise<XeroTokens> {
    try {
      const data = await fs.readFile(this.tokensPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error('Xero not connected. Please connect your Xero account first.');
    }
  }

  /**
   * Get current tenant ID
   */
  private async getTenantId(): Promise<string> {
    await this.ensureValidToken();
    const tenants = await this.client.updateTenants();

    if (!tenants || tenants.length === 0) {
      throw new Error('No Xero organization found');
    }

    return tenants[0].tenantId;
  }

  // ============================================================================
  // API Methods
  // ============================================================================

  /**
   * Get chart of accounts
   */
  async getAccounts(): Promise<XeroAccount[]> {
    await this.ensureValidToken();
    const tenantId = await this.getTenantId();

    const response = await this.client.accountingApi.getAccounts(tenantId);
    const accounts = response.body.accounts || [];

    return accounts
      .filter((acc) => acc.accountID && acc.code && acc.name && acc.type)
      .map((acc) => ({
        accountID: acc.accountID!,
        code: acc.code!,
        name: acc.name!,
        type: acc.type as any,
        currencyCode: String(acc.currencyCode || 'GBP'),
        taxType: acc.taxType,
        enablePaymentsToAccount: acc.enablePaymentsToAccount,
        bankAccountNumber: acc.bankAccountNumber,
        status: acc.status ? String(acc.status) : undefined,
        description: acc.description,
      }));
  }

  /**
   * Get bank transactions
   */
  async getTransactions(fromDate?: Date, toDate?: Date): Promise<XeroTransaction[]> {
    await this.ensureValidToken();
    const tenantId = await this.getTenantId();

    const where = [];
    if (fromDate) {
      where.push(`Date >= DateTime(${fromDate.getFullYear()}, ${fromDate.getMonth() + 1}, ${fromDate.getDate()})`);
    }
    if (toDate) {
      where.push(`Date <= DateTime(${toDate.getFullYear()}, ${toDate.getMonth() + 1}, ${toDate.getDate()})`);
    }

    const response = await this.client.accountingApi.getBankTransactions(
      tenantId,
      undefined,
      where.length > 0 ? where.join(' AND ') : undefined
    );

    const transactions = response.body.bankTransactions || [];

    return transactions
      .filter((tx) => tx.bankTransactionID && tx.date && tx.type)
      .map((tx) => ({
        bankTransactionID: tx.bankTransactionID!,
        type: String(tx.type) as 'SPEND' | 'RECEIVE',
        contact: tx.contact ? {
          contactID: tx.contact.contactID,
          name: tx.contact.name,
        } : undefined,
        date: tx.date!,
        reference: tx.reference,
        isReconciled: tx.isReconciled || false,
        status: String(tx.status || 'ACTIVE'),
        total: tx.total || 0,
        currencyCode: String(tx.currencyCode || 'GBP'),
        lineItems: (tx.lineItems || []).map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitAmount: item.unitAmount || 0,
          accountCode: item.accountCode || '',
          taxType: item.taxType,
          taxAmount: item.taxAmount,
          lineAmount: item.lineAmount || 0,
        })),
      }));
  }

  /**
   * Get balance sheet
   */
  async getBalanceSheet(date?: Date): Promise<XeroBalanceSheet> {
    await this.ensureValidToken();
    const tenantId = await this.getTenantId();

    const dateStr = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : undefined;

    const response = await this.client.accountingApi.getReportBalanceSheet(tenantId, dateStr);

    // Parse the report data (structure varies)
    const report = response.body.reports?.[0];

    // Simplified parsing - in production, parse the full report structure
    return {
      reportID: report?.reportID || '',
      reportName: report?.reportName || 'Balance Sheet',
      reportDate: report?.reportDate || dateStr || new Date().toISOString(),
      updatedDateUTC: report?.updatedDateUTC || new Date().toISOString(),
      assets: {
        current: 0, // Parse from report.rows
        fixed: 0,
        total: 0,
      },
      liabilities: {
        current: 0,
        longTerm: 0,
        total: 0,
      },
      equity: 0,
    };
  }

  /**
   * Get profit & loss statement
   */
  async getProfitAndLoss(fromDate: Date, toDate: Date): Promise<XeroProfitLoss> {
    await this.ensureValidToken();
    const tenantId = await this.getTenantId();

    const fromDateStr = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-${String(fromDate.getDate()).padStart(2, '0')}`;
    const toDateStr = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}-${String(toDate.getDate()).padStart(2, '0')}`;

    const response = await this.client.accountingApi.getReportProfitAndLoss(tenantId, fromDateStr, toDateStr);

    const report = response.body.reports?.[0];

    // Simplified parsing - in production, parse the full report structure
    return {
      reportID: report?.reportID || '',
      reportName: report?.reportName || 'Profit & Loss',
      fromDate: fromDateStr,
      toDate: toDateStr,
      updatedDateUTC: report?.updatedDateUTC || new Date().toISOString(),
      revenue: 0, // Parse from report.rows
      cogs: 0,
      grossProfit: 0,
      operatingExpenses: {},
      netProfit: 0,
    };
  }

  /**
   * Check connection status
   */
  async isConnected(): Promise<boolean> {
    try {
      const tokens = await this.loadTokens();
      return !!tokens.access_token;
    } catch {
      return false;
    }
  }

  /**
   * Disconnect (delete tokens)
   */
  async disconnect(): Promise<void> {
    try {
      await fs.unlink(this.tokensPath);
    } catch {
      // Already disconnected
    }
  }
}

// Export singleton instance
export const xeroService = new XeroService();
