'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDrillDownStore, type DrillDownData } from '@/store/drill-down.store';
import { formatCurrency, formatCompact, formatPercent, cn } from '@/shared/lib/utils';
import { X, Download, ExternalLink } from 'lucide-react';
import type {
  ROIMetrics,
  Client,
  ChurnPrediction,
  Insight,
  RevenueData,
  LatencyCostPoint,
  ComplianceBadge,
} from '@/shared/schemas';

export function DrillDownModal() {
  const { isOpen, currentData, closeDrillDown } = useDrillDownStore();

  if (!currentData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDrillDown()}>
      <DialogContent className="max-w-2xl glass border-glass-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{currentData.title}</DialogTitle>
              {currentData.subtitle && (
                <DialogDescription>{currentData.subtitle}</DialogDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="glass">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <DrillDownContent type={currentData.type} data={currentData.data} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function DrillDownContent({ type, data }: { type: string; data: unknown }) {
  switch (type) {
    case 'roi-breakdown':
      return <ROIBreakdown data={data as ROIMetrics} />;
    case 'client-detail':
      return <ClientDetail data={data as Client} />;
    case 'churn-detail':
      return <ChurnDetail data={data as ChurnPrediction} />;
    case 'insight-detail':
      return <InsightDetail data={data as Insight} />;
    case 'revenue-analysis':
      return <RevenueAnalysis data={data as RevenueData[]} />;
    case 'latency-analysis':
      return <LatencyAnalysis data={data as LatencyCostPoint[]} />;
    case 'compliance-detail':
      return <ComplianceDetail data={data as ComplianceBadge} />;
    default:
      return <GenericDetail data={data} />;
  }
}

function ROIBreakdown({ data }: { data: ROIMetrics }) {
  return (
    <div className="space-y-6 py-4">
      <div className="text-center p-6 rounded-lg glass-inner">
        <p className="text-sm text-muted-foreground">Total ROI</p>
        <p className="text-5xl font-bold text-emerald-500">{data.totalROI}%</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricBox
          label="Labor Savings"
          value={formatCurrency(data.laborSavings)}
          variant="positive"
        />
        <MetricBox
          label="Efficiency Gains"
          value={formatCurrency(data.efficiencyGains)}
          variant="positive"
        />
        <MetricBox
          label="Revenue Uplift"
          value={formatCurrency(data.revenueUplift)}
          variant="positive"
        />
        <MetricBox
          label="Token Costs"
          value={formatCurrency(data.tokenCosts)}
          variant="negative"
        />
      </div>

      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex justify-between items-center">
          <span className="font-medium">Net Value Created</span>
          <span className="text-2xl font-bold text-emerald-500">
            {formatCurrency(data.netValue)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ClientDetail({ data }: { data: Client }) {
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <span className="text-xl font-bold text-primary">
            {data.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="text-xl font-semibold">{data.name}</h3>
          <p className="text-muted-foreground">
            {data.tier.charAt(0).toUpperCase() + data.tier.slice(1)} | {data.industry}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricBox label="Contract Value" value={formatCurrency(data.contractValue)} />
        <MetricBox label="Health Score" value={`${data.healthScore.toFixed(1)}%`} />
        <MetricBox label="ROI" value={`${data.roi}%`} variant={data.roi >= 200 ? 'positive' : 'neutral'} />
        <MetricBox label="NRR" value={`${data.nrr.toFixed(1)}%`} variant={data.nrr >= 100 ? 'positive' : 'negative'} />
        <MetricBox label="AI Adoption" value={`${data.aiAdoptionScore.toFixed(1)}%`} />
        <MetricBox label="Contract Health" value={data.contractHealth} />
      </div>
    </div>
  );
}

function ChurnDetail({ data }: { data: ChurnPrediction }) {
  return (
    <div className="space-y-6 py-4">
      <div className="text-center p-6 rounded-lg glass-inner">
        <p className="text-sm text-muted-foreground">Churn Probability</p>
        <p className={cn(
          'text-5xl font-bold',
          data.probability >= 70 ? 'text-red-500' : data.probability >= 40 ? 'text-amber-500' : 'text-emerald-500'
        )}>
          {data.probability.toFixed(0)}%
        </p>
      </div>

      <div>
        <h4 className="font-medium mb-3">Risk Factors</h4>
        <ul className="space-y-2">
          {data.factors.map((factor, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {factor}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-medium mb-3">Recommended Actions</h4>
        <ul className="space-y-2">
          {data.recommendedActions.map((action, i) => (
            <li key={i} className="flex items-center gap-2 text-sm p-3 rounded-lg glass-inner">
              <span className="text-primary">→</span>
              {action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function InsightDetail({ data }: { data: Insight }) {
  return (
    <div className="space-y-6 py-4">
      <p className="text-muted-foreground">{data.summary}</p>

      {data.metric && (
        <div className="p-4 rounded-lg glass-inner">
          <p className="text-sm text-muted-foreground">{data.metric}</p>
          <p className="text-3xl font-bold">
            {typeof data.value === 'number' ? formatCompact(data.value) : data.value}
          </p>
          {data.changePercent !== undefined && (
            <p className={cn(
              'text-sm',
              data.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'
            )}>
              {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(1)}%
            </p>
          )}
        </div>
      )}

      {data.actionable && data.action && (
        <Button className="w-full">
          {data.action}
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
}

function RevenueAnalysis({ data }: { data: RevenueData[] }) {
  const totals = React.useMemo(() => ({
    revenue: data.reduce((sum, d) => sum + d.revenue, 0),
    tokenCost: data.reduce((sum, d) => sum + d.tokenCost, 0),
    avgMargin: data.reduce((sum, d) => sum + d.margin, 0) / data.length,
    avgAIContribution: data.reduce((sum, d) => sum + d.aiContribution, 0) / data.length,
  }), [data]);

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <MetricBox label="Total Revenue" value={formatCurrency(totals.revenue)} />
        <MetricBox label="Total Token Cost" value={formatCurrency(totals.tokenCost)} />
        <MetricBox label="Avg Margin" value={`${totals.avgMargin.toFixed(1)}%`} />
        <MetricBox label="Avg AI Contribution" value={`${totals.avgAIContribution.toFixed(1)}%`} />
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Period Breakdown</h4>
        {data.map((period) => (
          <div key={period.period} className="flex items-center justify-between p-3 rounded-lg glass-inner">
            <span>{period.period}</span>
            <div className="text-right">
              <p className="font-medium">{formatCurrency(period.revenue)}</p>
              <p className="text-xs text-muted-foreground">{period.margin.toFixed(1)}% margin</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LatencyAnalysis({ data }: { data: LatencyCostPoint[] }) {
  const sorted = [...data].sort((a, b) => b.latencyMs - a.latencyMs);

  return (
    <div className="space-y-4 py-4">
      {sorted.map((service) => (
        <div key={service.service} className="p-4 rounded-lg glass-inner">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium">{service.service}</h4>
            <span className={cn(
              'text-sm font-medium',
              service.latencyMs > 500 ? 'text-red-500' : service.latencyMs > 200 ? 'text-amber-500' : 'text-emerald-500'
            )}>
              {service.latencyMs}ms
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Cost/Request</span>
              <p className="font-medium">${service.costPerRequest.toFixed(4)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Volume</span>
              <p className="font-medium">{formatCompact(service.requestVolume)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ComplianceDetail({ data }: { data: ComplianceBadge }) {
  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <MetricBox label="Coverage" value={`${data.coveragePercent.toFixed(0)}%`} />
        <MetricBox label="Status" value={data.status} />
        <MetricBox label="Last Assessment" value={new Date(data.lastAssessment).toLocaleDateString()} />
        <MetricBox label="Next Review" value={new Date(data.nextReview).toLocaleDateString()} />
      </div>
    </div>
  );
}

function GenericDetail({ data }: { data: unknown }) {
  return (
    <div className="py-4">
      <pre className="text-xs overflow-auto p-4 rounded-lg glass-inner">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function MetricBox({
  label,
  value,
  variant = 'neutral',
}: {
  label: string;
  value: string;
  variant?: 'positive' | 'negative' | 'neutral';
}) {
  const colors = {
    positive: 'text-emerald-500',
    negative: 'text-red-500',
    neutral: '',
  };

  return (
    <div className="p-4 rounded-lg glass-inner">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn('text-lg font-semibold', colors[variant])}>{value}</p>
    </div>
  );
}
