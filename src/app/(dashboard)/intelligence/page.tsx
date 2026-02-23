'use client';

import * as React from 'react';
import { PageHeader, PageContent } from '@/presentation/components/layout/DashboardShell';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import { ChatBot } from '@/presentation/components/chat/ChatBot';
import { RiskBadge } from '@/presentation/components/data-display/StatusBadge';
import { ChartContainer, ChartLegend } from '@/presentation/components/charts/ChartContainer';
import { useRepository, useData } from '@/infrastructure/providers/data-provider';
import { useDrillDownStore } from '@/store/drill-down.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  RefreshCw,
  Target,
  Users,
  ChevronRight,
  Lightbulb,
  Bot,
  User,
} from 'lucide-react';
import { formatCurrency, formatCompact, formatPercent, cn } from '@/shared/lib/utils';
import { REFRESH_INTERVALS } from '@/shared/constants';
import type { ChurnPrediction, ResourceForecast, AIShareOfVoice, ChurnRisk } from '@/shared/schemas';

const riskColors: Record<ChurnRisk, string> = {
  low: '#059669',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

export default function IntelligencePage() {
  const repository = useRepository();
  const openDrillDown = useDrillDownStore((s) => s.openDrillDown);

  const { data: clients } = useData({
    fetcher: () => repository.getClients(),
  });

  const { data: churnPredictions, isLoading: churnLoading } = useData({
    fetcher: () => repository.getChurnPredictions(),
    refreshInterval: REFRESH_INTERVALS.SLOW,
  });

  const { data: forecasts, isLoading: forecastLoading } = useData({
    fetcher: () => repository.getResourceForecasts(),
    refreshInterval: REFRESH_INTERVALS.SLOW,
  });

  const { data: shareOfVoice, isLoading: sovLoading } = useData({
    fetcher: () => repository.getAIShareOfVoice(),
    refreshInterval: REFRESH_INTERVALS.NORMAL,
  });

  // Get client name from ID
  const getClientName = (clientId: string) => {
    return clients?.find((c) => c.id === clientId)?.name || 'Unknown';
  };

  // Calculate AI adoption summary
  const sovSummary = React.useMemo(() => {
    if (!shareOfVoice) return null;
    const avgAI = shareOfVoice.reduce((sum, s) => sum + s.aiPercentage, 0) / shareOfVoice.length;
    const growing = shareOfVoice.filter((s) => s.trend === 'up').length;
    return { avgAI, growing };
  }, [shareOfVoice]);

  return (
    <>
      <PageHeader
        title="Intelligence"
        description="AI-powered predictions, forecasts, and strategic insights"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="glass">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="icon" className="glass">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <PageContent>
        {/* AI Assistant ChatBot */}
        <div className="mb-6">
          <ChatBot />
        </div>

        {/* Churn Predictor Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ChartContainer
            title="Churn Risk Predictor"
            subtitle="ML-powered early warning system"
            className="lg:col-span-2"
            isLoading={churnLoading}
          >
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {churnPredictions?.map((prediction) => (
                  <ChurnPredictionCard
                    key={prediction.clientId}
                    prediction={prediction}
                    clientName={getClientName(prediction.clientId)}
                    onClick={() =>
                      openDrillDown({
                        type: 'churn-detail',
                        title: `Churn Analysis: ${getClientName(prediction.clientId)}`,
                        subtitle: `Risk Level: ${prediction.riskLevel}`,
                        data: prediction,
                        sourceWidget: 'churn-predictor',
                      })
                    }
                  />
                ))}
              </div>
            </ScrollArea>
          </ChartContainer>

          {/* Risk Distribution */}
          <GlassCard size="lg">
            <GlassCardHeader>
              <GlassCardTitle>Risk Distribution</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              {churnPredictions && (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Low', value: churnPredictions.filter((p) => p.riskLevel === 'low').length, fill: riskColors.low },
                          { name: 'Medium', value: churnPredictions.filter((p) => p.riskLevel === 'medium').length, fill: riskColors.medium },
                          { name: 'High', value: churnPredictions.filter((p) => p.riskLevel === 'high').length, fill: riskColors.high },
                          { name: 'Critical', value: churnPredictions.filter((p) => p.riskLevel === 'critical').length, fill: riskColors.critical },
                        ].filter((d) => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {(['low', 'medium', 'high', 'critical'] as const).map((risk) => {
                      const count = churnPredictions.filter((p) => p.riskLevel === risk).length;
                      if (count === 0) return null;
                      return (
                        <div key={risk} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: riskColors[risk] }}
                          />
                          <span className="text-xs">
                            {risk.charAt(0).toUpperCase() + risk.slice(1)}: {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Resource Forecast */}
        <ChartContainer
          title="Resource Forecast"
          subtitle="Predicted token usage and costs"
          className="mb-6"
          isLoading={forecastLoading}
        >
          {forecasts && (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={forecasts}>
                  <defs>
                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="tokens"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    tickFormatter={(v) => formatCompact(v)}
                  />
                  <YAxis
                    yAxisId="cost"
                    orientation="right"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    tickFormatter={(v) => formatCurrency(v, { compact: true })}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                    }}
                    formatter={(value, name) => {
                      const v = value as number;
                      if (name === 'predictedTokenUsage') return [formatCompact(v), 'Tokens'];
                      if (name === 'predictedCost') return [formatCurrency(v), 'Cost'];
                      return [v, name];
                    }}
                  />
                  <Area
                    yAxisId="tokens"
                    type="monotone"
                    dataKey="predictedTokenUsage"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#forecastGradient)"
                  />
                  <Area
                    yAxisId="cost"
                    type="monotone"
                    dataKey="predictedCost"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <ChartLegend
                items={[
                  { label: 'Predicted Tokens', color: 'var(--chart-1)' },
                  { label: 'Predicted Cost', color: 'var(--chart-2)' },
                ]}
              />
            </>
          )}
        </ChartContainer>

        {/* AI Share of Voice */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartContainer
            title="AI Share of Voice"
            subtitle="AI vs Human contribution by category"
            className="lg:col-span-2"
            isLoading={sovLoading}
          >
            {shareOfVoice && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={shareOfVoice} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="aiPercentage" stackId="a" fill="var(--chart-1)" name="AI" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="humanPercentage" stackId="a" fill="var(--chart-3)" name="Human" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>

          {/* AI Adoption Summary */}
          <GlassCard size="lg">
            <GlassCardHeader>
              <GlassCardTitle>AI Adoption Insights</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              {sovSummary && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
                      <Brain className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-3xl font-bold">{sovSummary.avgAI.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Average AI Share</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg glass-inner">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="text-sm">AI-Dominant</span>
                      </div>
                      <Badge variant="secondary">
                        {shareOfVoice?.filter((s) => s.aiPercentage > 50).length} categories
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg glass-inner">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">Growing</span>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
                        {sovSummary.growing} categories
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg glass-inner">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Human-Led</span>
                      </div>
                      <Badge variant="secondary">
                        {shareOfVoice?.filter((s) => s.aiPercentage <= 50).length} categories
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        </div>
      </PageContent>
    </>
  );
}

function ChurnPredictionCard({
  prediction,
  clientName,
  onClick,
}: {
  prediction: ChurnPrediction;
  clientName: string;
  onClick: () => void;
}) {
  return (
    <div
      className="p-4 rounded-lg glass-inner hover:bg-muted/30 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">{clientName}</h4>
            <div className="flex items-center gap-2">
              <RiskBadge level={prediction.riskLevel} />
              <span className="text-xs text-muted-foreground">
                {prediction.probability.toFixed(0)}% probability
              </span>
            </div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Key Factors</p>
          <div className="flex flex-wrap gap-1">
            {prediction.factors.slice(0, 3).map((factor, i) => (
              <Badge key={i} variant="outline" className="text-[10px]">
                {factor}
              </Badge>
            ))}
          </div>
        </div>

        {prediction.recommendedActions.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-primary">
            <Lightbulb className="h-3 w-3" />
            <span>{prediction.recommendedActions[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
}
