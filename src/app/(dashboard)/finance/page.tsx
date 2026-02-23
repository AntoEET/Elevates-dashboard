'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, TrendingUp, DollarSign, Activity } from 'lucide-react';

export default function FinanceOverviewPage() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/integrations/status');
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.xero?.connected || data.stripe?.connected);
      }
    } catch (error) {
      console.error('Failed to check connection:', error);
      setIsConnected(false);
    }
  };

  if (isConnected === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading finance dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <div className="mb-8">
            <DollarSign className="w-20 h-20 mx-auto text-blue-600 mb-4" />
            <h1 className="text-4xl font-bold mb-3">Welcome to Finance Dashboard</h1>
            <p className="text-xl text-muted-foreground">
              Your complete SaaS financial management platform
            </p>
          </div>

          <Card className="max-w-2xl mx-auto mb-8">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Connect your Xero or Stripe account to start tracking your financial metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <div className="space-y-2">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Track Metrics</h3>
                  <p className="text-sm text-muted-foreground">
                    MRR, ARR, churn rate, and all essential SaaS metrics
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Monitor Cash</h3>
                  <p className="text-sm text-muted-foreground">
                    Burn rate, runway, and cash flow analysis
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-3">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Forecast</h3>
                  <p className="text-sm text-muted-foreground">
                    12-month projections and scenario planning
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button size="lg" onClick={() => router.push('/finance/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Connect Your Accounts
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">What You'll Get</h2>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>• MRR/ARR tracking with growth rates</li>
                    <li>• New, expansion, contraction breakdown</li>
                    <li>• Customer cohort analysis</li>
                    <li>• Revenue by plan/tier</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SaaS Metrics</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>• CAC & LTV calculations</li>
                    <li>• Magic Number & Rule of 40</li>
                    <li>• Net Revenue Retention (NRR)</li>
                    <li>• Quick Ratio & efficiency metrics</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cash Management</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>• Real-time burn rate monitoring</li>
                    <li>• Runway calculations</li>
                    <li>• Cash flow waterfall charts</li>
                    <li>• Funding requirement analysis</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reports</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>• Automated board decks</li>
                    <li>• Investor update PDFs</li>
                    <li>• Excel exports</li>
                    <li>• P&L statements</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If connected, show the main dashboard (to be built in Week 3)
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Finance Dashboard</h1>
        <p className="text-muted-foreground">
          Your financial metrics and insights at a glance
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <Activity className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h2 className="text-xl font-semibold mb-2">Dashboard Coming Soon</h2>
        <p className="text-muted-foreground mb-4">
          Your Xero/Stripe accounts are connected! The dashboard UI will be built in Week 3.
        </p>
        <Button variant="outline" onClick={() => router.push('/finance/settings')}>
          <Settings className="w-4 h-4 mr-2" />
          Manage Integrations
        </Button>
      </div>
    </div>
  );
}
