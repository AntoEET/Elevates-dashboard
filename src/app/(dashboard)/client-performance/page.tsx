'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader, PageContent } from '@/presentation/components/layout/DashboardShell';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import { StatusBadge } from '@/presentation/components/data-display/StatusBadge';
import { ChartContainer, ChartLegend } from '@/presentation/components/charts/ChartContainer';
import { ClientFormModal } from '@/presentation/components/clients/ClientFormModal';
import { useClientPortfolioStore } from '@/store/client-portfolio.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import {
  Users,
  TrendingUp,
  DollarSign,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  Building2,
  Plus,
  Loader2,
} from 'lucide-react';
import { formatCurrency, cn } from '@/shared/lib/utils';
import type { ClientTier, ContractHealth } from '@/shared/schemas/client-portfolio';

// Calculate ROI from revenue and investment
// Formula: ((Revenue Generated - Total Investment) / Total Investment) × 100
function calculateROI(revenueGenerated: number, totalInvestment: number): number {
  if (totalInvestment <= 0) return 0;
  return ((revenueGenerated - totalInvestment) / totalInvestment) * 100;
}

// Hardcoded client data for now (matches the file-based data)
const MOCK_CLIENTS_RAW = [
  {
    id: 'acme-corp',
    name: 'Acme Corporation',
    industry: 'Manufacturing',
    tier: 'enterprise' as ClientTier,
    contractHealth: 'expanding' as ContractHealth,
    financials: {
      arr: 2500000,
      nrr: 115,
      revenueGenerated: 3850000,  // Total revenue from client
      totalInvestment: 1000000,   // Cost to serve (staff, resources, etc.)
      healthScore: 92
    },
    contract: { value: 2500000, startDate: '2024-01-15', endDate: '2027-01-14', status: 'active' as const },
    contact: { name: 'Sarah Johnson', email: 'sarah@acme.com' },
    tags: ['key-account'],
  },
  {
    id: 'techstart-io',
    name: 'TechStart.io',
    industry: 'Technology',
    tier: 'growth' as ClientTier,
    contractHealth: 'at-risk' as ContractHealth,
    financials: {
      arr: 450000,
      nrr: 108,
      revenueGenerated: 590000,   // Total revenue from client
      totalInvestment: 200000,    // Cost to serve
      healthScore: 78
    },
    contract: { value: 450000, startDate: '2024-03-20', endDate: '2025-03-19', status: 'active' as const },
    contact: { name: 'Alex Rivera', email: 'alex@techstart.io' },
    tags: ['startup', 'technology', 'high-growth'],
  },
  {
    id: 'global-foods',
    name: 'Global Foods Ltd',
    industry: 'Food & Beverage',
    tier: 'enterprise' as ClientTier,
    contractHealth: 'healthy' as ContractHealth,
    financials: {
      arr: 1800000,
      nrr: 112,
      revenueGenerated: 2760000,  // Total revenue from client
      totalInvestment: 800000,    // Cost to serve
      healthScore: 88
    },
    contract: { value: 1800000, startDate: '2024-02-01', endDate: '2026-01-31', status: 'active' as const },
    contact: { name: 'Marcus Chen', email: 'marcus.chen@globalfoods.com' },
    tags: ['enterprise', 'food-beverage', 'global'],
  },
];

// Add calculated ROI to each client
const MOCK_CLIENTS = MOCK_CLIENTS_RAW.map(client => ({
  ...client,
  financials: {
    ...client.financials,
    roi: calculateROI(client.financials.revenueGenerated, client.financials.totalInvestment),
  },
}));

type MockClient = typeof MOCK_CLIENTS[number];

const tierColors: Record<ClientTier, string> = {
  enterprise: '#1E3A8A',
  growth: '#3B82F6',
  starter: '#93C5FD',
};

const healthColors: Record<ContractHealth, string> = {
  healthy: '#059669',
  expanding: '#10B981',
  'at-risk': '#F59E0B',
  churning: '#EF4444',
};

export default function ClientPerformancePage() {
  const router = useRouter();
  const {
    isFormModalOpen,
    formModalMode,
    openClientFormModal,
    closeClientFormModal,
  } = useClientPortfolioStore();

  // Use mock data directly - no API call
  const clients = MOCK_CLIENTS;
  const isLoading = false;

  const handleClientClick = (clientId: string) => {
    router.push(`/client-performance/${clientId}`);
  };

  // Calculate metrics
  const metrics = React.useMemo(() => {
    if (!clients || clients.length === 0) return null;

    const totalClients = clients.length;
    const avgROI = clients.reduce((sum, c) => sum + c.financials.roi, 0) / totalClients;
    const avgNRR = clients.reduce((sum, c) => sum + c.financials.nrr, 0) / totalClients;
    const totalARR = clients.reduce((sum, c) => sum + c.financials.arr, 0);
    const atRiskCount = clients.filter(
      (c) => c.contractHealth === 'at-risk' || c.contractHealth === 'churning'
    ).length;

    return { totalClients, avgROI, avgNRR, totalARR, atRiskCount };
  }, [clients]);

  // Group by tier for chart
  const tierData = React.useMemo(() => {
    if (!clients || clients.length === 0) return [];
    const grouped = clients.reduce(
      (acc, client) => {
        if (!acc[client.tier]) {
          acc[client.tier] = { tier: client.tier, count: 0, value: 0, avgROI: 0 };
        }
        acc[client.tier].count++;
        acc[client.tier].value += client.contract.value;
        acc[client.tier].avgROI += client.financials.roi;
        return acc;
      },
      {} as Record<string, { tier: string; count: number; value: number; avgROI: number }>
    );

    return Object.values(grouped).map((g) => ({
      ...g,
      avgROI: g.avgROI / g.count,
    }));
  }, [clients]);

  // ROI scatter data
  const roiScatterData = React.useMemo(() => {
    if (!clients || clients.length === 0) return [];
    return clients.map((c) => ({
      name: c.name,
      x: c.financials.healthScore, // Use health score as x-axis
      y: c.financials.roi,
      z: c.contract.value / 10000,
      health: c.contractHealth,
    }));
  }, [clients]);

  return (
    <>
      <PageHeader
        title="Client Performance"
        description="Monitor client health, ROI metrics, and contract performance"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="glass">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="glass">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => openClientFormModal('create')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        }
      />

      <PageContent>
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <GlassCard size="md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{metrics?.totalClients || '---'}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard size="md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg ROI</p>
                <p className="text-2xl font-bold">
                  {metrics ? `${metrics.avgROI.toFixed(0)}%` : '---'}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard size="md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total ARR</p>
                <p className="text-2xl font-bold">
                  {metrics ? formatCurrency(metrics.totalARR, { compact: true }) : '---'}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard size="md" variant={metrics?.atRiskCount ? 'default' : 'default'}>
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', metrics?.atRiskCount ? 'bg-amber-500/10' : 'bg-muted')}>
                <Building2 className={cn('h-5 w-5', metrics?.atRiskCount ? 'text-amber-500' : 'text-muted-foreground')} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">At Risk</p>
                <p className={cn('text-2xl font-bold', metrics?.atRiskCount && 'text-amber-500')}>
                  {metrics?.atRiskCount || 0}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* ROI by Tier */}
          <ChartContainer
            title="Portfolio by Tier"
            subtitle="Contract value and ROI distribution"
            isLoading={isLoading}
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tierData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v, { compact: true })} />
                <YAxis
                  type="category"
                  dataKey="tier"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {tierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={tierColors[entry.tier as ClientTier]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <ChartLegend
              items={[
                { label: 'Enterprise', color: tierColors.enterprise },
                { label: 'Growth', color: tierColors.growth },
                { label: 'Starter', color: tierColors.starter },
              ]}
            />
          </ChartContainer>

          {/* ROI vs Health Score Scatter */}
          <ChartContainer
            title="ROI vs Health Score"
            subtitle="Bubble size represents contract value"
            isLoading={isLoading}
          >
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Health Score"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  label={{ value: 'Health Score %', position: 'bottom', fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="ROI"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  label={{ value: 'ROI %', angle: -90, position: 'insideLeft', fill: 'var(--muted-foreground)' }}
                />
                <ZAxis type="number" dataKey="z" range={[50, 500]} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                  }}
                  formatter={(value, name) => [
                    `${value}%`,
                    name as string,
                  ]}
                />
                <Scatter data={roiScatterData}>
                  {roiScatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={healthColors[entry.health]} fillOpacity={0.7} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Client List */}
        <GlassCard size="lg">
          <GlassCardHeader>
            <GlassCardTitle>Client Portfolio</GlassCardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="pl-9 pr-4 py-1.5 text-sm rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <Building2 className="h-12 w-12 mb-4 opacity-50" />
                <p>No clients found</p>
                <p className="text-sm">Add your first client to get started</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {clients.map((client) => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      onClick={() => handleClientClick(client.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </GlassCardContent>
        </GlassCard>
      </PageContent>

      <ClientFormModal
        open={isFormModalOpen}
        mode={formModalMode}
        onClose={closeClientFormModal}
      />
    </>
  );
}

function ClientRow({ client, onClick }: { client: MockClient; onClick: () => void }) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg glass-inner hover:bg-muted/30 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <span className="text-sm font-medium text-primary">
            {client.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{client.name}</h4>
            <Badge variant="outline" className="text-[10px]">
              {client.tier}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{client.industry}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">ARR</p>
          <p className="font-medium">{formatCurrency(client.financials.arr, { compact: true })}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">ROI</p>
          <p className={cn('font-medium', client.financials.roi >= 200 ? 'text-emerald-500' : '')}>
            {client.financials.roi}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Health</p>
          <StatusBadge status={client.contractHealth} size="sm" showDot={false} />
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}
