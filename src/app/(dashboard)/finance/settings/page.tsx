'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface IntegrationStatus {
  service: string;
  connected: boolean;
  lastSyncAt: string | null;
  status: 'active' | 'error' | 'disconnected';
}

function FinanceSettingsContent() {
  const searchParams = useSearchParams();
  const [xeroStatus, setXeroStatus] = useState<IntegrationStatus | null>(null);
  const [stripeStatus, setStripeStatus] = useState<IntegrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchStatus();

    // Check for OAuth callback messages
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    const errorMessage = searchParams.get('message');

    if (connected === 'xero') {
      setMessage({ type: 'success', text: 'Xero connected successfully!' });
      setTimeout(() => setMessage(null), 5000);
    } else if (error) {
      let errorText = 'Failed to connect';
      if (error === 'xero_denied') {
        errorText = 'Xero authorization was denied';
      } else if (errorMessage) {
        errorText = decodeURIComponent(errorMessage);
      }
      setMessage({ type: 'error', text: errorText });
      setTimeout(() => setMessage(null), 5000);
    }
  }, [searchParams]);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/integrations/status');
      if (response.ok) {
        const data = await response.json();
        setXeroStatus(data.xero);
        setStripeStatus(data.stripe);
      }
    } catch (error) {
      console.error('Failed to fetch integration status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectXero = () => {
    window.location.href = '/api/integrations/xero/auth';
  };

  const handleSyncXero = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/integrations/xero/sync', {
        method: 'POST',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Xero data synced successfully!' });
        await fetchStatus();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to sync Xero data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to sync Xero data' });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const formatLastSync = (date: string | null) => {
    if (!date) return 'Never';
    const syncDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - syncDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Finance Settings</h1>
        <p className="text-muted-foreground">
          Connect your accounting and payment platforms to import financial data
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-900 border border-green-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Xero Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Xero</CardTitle>
                <CardDescription>Connect your Xero accounting system</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : xeroStatus?.connected ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">
                  {isLoading
                    ? 'Checking...'
                    : xeroStatus?.connected
                    ? 'Connected'
                    : 'Not connected'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Sync</p>
                <p className="font-medium">
                  {isLoading ? 'Checking...' : formatLastSync(xeroStatus?.lastSyncAt || null)}
                </p>
              </div>
            </div>

            {xeroStatus?.connected ? (
              <div className="flex gap-3">
                <Button onClick={handleSyncXero} disabled={isSyncing} variant="default">
                  <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://go.xero.com" target="_blank" rel="noopener noreferrer">
                    Open Xero
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            ) : (
              <div>
                <Button onClick={handleConnectXero} size="lg">
                  Connect Xero Account
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  You'll be redirected to Xero to authorize access to your financial data
                </p>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">What data will be imported:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Chart of accounts</li>
                <li>• Bank transactions (last 12 months)</li>
                <li>• Balance sheet</li>
                <li>• Profit & loss statement</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Stripe Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Stripe</CardTitle>
                <CardDescription>Connect your Stripe payment platform</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : stripeStatus?.connected ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">
                  {isLoading
                    ? 'Checking...'
                    : stripeStatus?.connected
                    ? 'Connected'
                    : 'Not configured'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Sync</p>
                <p className="font-medium">
                  {isLoading ? 'Checking...' : formatLastSync(stripeStatus?.lastSyncAt || null)}
                </p>
              </div>
            </div>

            {stripeStatus?.connected ? (
              <div className="flex gap-3">
                <Button disabled variant="default">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync Now
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                    Open Stripe
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  Stripe is configured via environment variables
                </p>
                <p className="text-sm text-blue-800">
                  Add your Stripe API keys to <code className="bg-blue-100 px-1 py-0.5 rounded">.env.local</code>:
                </p>
                <pre className="text-xs bg-blue-100 p-2 rounded mt-2 overflow-x-auto">
                  STRIPE_SECRET_KEY=sk_test_your_key_here
                </pre>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">What data will be imported:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Customer subscriptions</li>
                <li>• Customer information</li>
                <li>• Invoices and payments</li>
                <li>• Revenue metrics (MRR, churn)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium mb-1">Setting up Xero</p>
              <p className="text-sm text-muted-foreground">
                See the <code className="bg-gray-100 px-1 py-0.5 rounded">XERO_SETUP_GUIDE.md</code> file
                for detailed instructions
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Data Sync Frequency</p>
              <p className="text-sm text-muted-foreground">
                Data is automatically synced every 6 hours. You can also manually sync at any time.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">Data Security</p>
              <p className="text-sm text-muted-foreground">
                All connections use OAuth 2.0 secure authentication. Your credentials are never stored.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FinanceSettingsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    }>
      <FinanceSettingsContent />
    </Suspense>
  );
}
