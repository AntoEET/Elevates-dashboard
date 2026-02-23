'use client';

import * as React from 'react';
import { PageHeader, PageContent } from '@/presentation/components/layout/DashboardShell';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import { StatusBadge } from '@/presentation/components/data-display/StatusBadge';
import { ChartContainer } from '@/presentation/components/charts/ChartContainer';
import { useRepository, useData } from '@/infrastructure/providers/data-provider';
import { useDrillDownStore } from '@/store/drill-down.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  Shield,
  Scale,
  FileCheck,
  AlertTriangle,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Lock,
  Eye,
  Bug,
  ShieldCheck,
} from 'lucide-react';
import { formatPercent, formatDate, cn } from '@/shared/lib/utils';
import { REFRESH_INTERVALS } from '@/shared/constants';
import type { BiasAuditResult, ComplianceBadge, SecurityHealth, ComplianceStatus, MetricStatus } from '@/shared/schemas';

const complianceIcons: Record<ComplianceStatus, React.ElementType> = {
  compliant: CheckCircle2,
  'non-compliant': XCircle,
  'pending-review': Clock,
};

const complianceColors: Record<ComplianceStatus, string> = {
  compliant: 'text-emerald-500 bg-emerald-500/10',
  'non-compliant': 'text-red-500 bg-red-500/10',
  'pending-review': 'text-amber-500 bg-amber-500/10',
};

export default function GovernancePage() {
  const repository = useRepository();
  const openDrillDown = useDrillDownStore((s) => s.openDrillDown);

  const { data: biasResults, isLoading: biasLoading } = useData({
    fetcher: () => repository.getBiasAuditResults(),
    refreshInterval: REFRESH_INTERVALS.SLOW,
  });

  const { data: compliance, isLoading: complianceLoading } = useData({
    fetcher: () => repository.getComplianceBadges(),
    refreshInterval: REFRESH_INTERVALS.SLOW,
  });

  const { data: security, isLoading: securityLoading } = useData({
    fetcher: () => repository.getSecurityHealth(),
    refreshInterval: REFRESH_INTERVALS.NORMAL,
  });

  // Calculate compliance summary
  const complianceSummary = React.useMemo(() => {
    if (!compliance) return null;
    return {
      compliant: compliance.filter((c) => c.status === 'compliant').length,
      pending: compliance.filter((c) => c.status === 'pending-review').length,
      nonCompliant: compliance.filter((c) => c.status === 'non-compliant').length,
      total: compliance.length,
    };
  }, [compliance]);

  // Prepare radar chart data
  const radarData = biasResults?.map((result) => ({
    dimension: result.dimension.split(' ')[0], // Shorten label
    score: result.score,
    fullMark: 100,
  }));

  return (
    <>
      <PageHeader
        title="Governance"
        description="AI ethics, compliance monitoring, and security health"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="glass">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="icon" className="glass">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <PageContent>
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Compliance Score */}
          <GlassCard size="lg" variant={complianceSummary?.nonCompliant ? 'crisis' : 'glow'}>
            <GlassCardHeader className="mb-1">
              <GlassCardTitle>Compliance Status</GlassCardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </GlassCardHeader>
            <GlassCardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">
                  {complianceSummary
                    ? `${complianceSummary.compliant}/${complianceSummary.total}`
                    : '---'}
                </div>
                <div className="flex-1 space-y-1">
                  {complianceSummary && (
                    <>
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span>{complianceSummary.compliant} Compliant</span>
                      </div>
                      {complianceSummary.pending > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="h-3 w-3 text-amber-500" />
                          <span>{complianceSummary.pending} Pending</span>
                        </div>
                      )}
                      {complianceSummary.nonCompliant > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <XCircle className="h-3 w-3 text-red-500" />
                          <span>{complianceSummary.nonCompliant} Non-Compliant</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Security Score */}
          <GlassCard size="lg">
            <GlassCardHeader className="mb-1">
              <GlassCardTitle>Security Score</GlassCardTitle>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </GlassCardHeader>
            <GlassCardContent>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    'text-4xl font-bold',
                    security?.overallScore && security.overallScore >= 90
                      ? 'text-emerald-500'
                      : security?.overallScore && security.overallScore >= 75
                        ? 'text-amber-500'
                        : 'text-red-500'
                  )}
                >
                  {security?.overallScore.toFixed(1) || '---'}
                </span>
                <span className="text-xl text-muted-foreground">/100</span>
              </div>
              {security && (
                <div className="mt-3">
                  <Progress
                    value={security.overallScore}
                    className="h-2"
                  />
                </div>
              )}
            </GlassCardContent>
          </GlassCard>

          {/* Vulnerabilities */}
          <GlassCard
            size="lg"
            variant={security?.vulnerabilities.critical ? 'crisis' : 'default'}
          >
            <GlassCardHeader className="mb-1">
              <GlassCardTitle>Vulnerabilities</GlassCardTitle>
              <Bug className="h-4 w-4 text-primary" />
            </GlassCardHeader>
            <GlassCardContent>
              {security && (
                <div className="grid grid-cols-4 gap-2">
                  <VulnCounter label="Critical" count={security.vulnerabilities.critical} variant="critical" />
                  <VulnCounter label="High" count={security.vulnerabilities.high} variant="high" />
                  <VulnCounter label="Medium" count={security.vulnerabilities.medium} variant="medium" />
                  <VulnCounter label="Low" count={security.vulnerabilities.low} variant="low" />
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bias Audit Radar */}
          <ChartContainer
            title="Bias Audit Results"
            subtitle="AI fairness across dimensions"
            isLoading={biasLoading}
          >
            {radarData && (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="var(--glass-border)" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}

            {biasResults && (
              <div className="mt-4 space-y-2">
                {biasResults.map((result) => (
                  <BiasResultRow key={result.dimension} result={result} />
                ))}
              </div>
            )}
          </ChartContainer>

          {/* Compliance Badges */}
          <ChartContainer
            title="Compliance Frameworks"
            subtitle="Certification and audit status"
            isLoading={complianceLoading}
          >
            <div className="space-y-3">
              {compliance?.map((badge) => (
                <ComplianceBadgeCard
                  key={badge.framework}
                  badge={badge}
                  onClick={() =>
                    openDrillDown({
                      type: 'compliance-detail',
                      title: badge.framework,
                      subtitle: `Status: ${badge.status}`,
                      data: badge,
                      sourceWidget: 'compliance-badges',
                    })
                  }
                />
              ))}
            </div>
          </ChartContainer>
        </div>

        {/* Security Health Details */}
        <GlassCard size="lg">
          <GlassCardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <GlassCardTitle>Security Health Metrics</GlassCardTitle>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            {security && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SecurityMetric
                  icon={<FileCheck className="h-5 w-5" />}
                  label="Patch Compliance"
                  value={security.patchCompliance}
                  target={95}
                />
                <SecurityMetric
                  icon={<Lock className="h-5 w-5" />}
                  label="Encryption Coverage"
                  value={security.encryptionCoverage}
                  target={100}
                />
                <SecurityMetric
                  icon={<Eye className="h-5 w-5" />}
                  label="Access Control Score"
                  value={security.accessControlScore}
                  target={95}
                />
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </PageContent>
    </>
  );
}

function VulnCounter({
  label,
  count,
  variant,
}: {
  label: string;
  count: number;
  variant: 'critical' | 'high' | 'medium' | 'low';
}) {
  const colors = {
    critical: 'text-red-500 bg-red-500/10',
    high: 'text-orange-500 bg-orange-500/10',
    medium: 'text-amber-500 bg-amber-500/10',
    low: 'text-slate-500 bg-slate-500/10',
  };

  return (
    <div className={cn('p-2 rounded-lg text-center', colors[variant])}>
      <p className="text-xl font-bold">{count}</p>
      <p className="text-[10px] uppercase tracking-wider">{label}</p>
    </div>
  );
}

function BiasResultRow({ result }: { result: BiasAuditResult }) {
  const statusColors: Record<MetricStatus, string> = {
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg glass-inner">
      <div className="flex items-center gap-3">
        <div className={cn('w-2 h-2 rounded-full', statusColors[result.status])} />
        <span className="text-sm">{result.dimension}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{result.score.toFixed(1)}%</span>
        {result.findings > 0 && (
          <Badge variant="outline" className="text-[10px]">
            {result.findings} findings
          </Badge>
        )}
      </div>
    </div>
  );
}

function ComplianceBadgeCard({
  badge,
  onClick,
}: {
  badge: ComplianceBadge;
  onClick: () => void;
}) {
  const Icon = complianceIcons[badge.status];

  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg glass-inner hover:bg-muted/30 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', complianceColors[badge.status])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-medium">{badge.framework}</h4>
          <p className="text-xs text-muted-foreground">
            Last assessed: {formatDate(badge.lastAssessment)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <StatusBadge status={badge.status} size="sm" />
        <p className="text-xs text-muted-foreground mt-1">
          {badge.coveragePercent.toFixed(0)}% coverage
        </p>
      </div>
    </div>
  );
}

function SecurityMetric({
  icon,
  label,
  value,
  target,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  target: number;
}) {
  const isGood = value >= target;

  return (
    <div className="p-4 rounded-lg glass-inner">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('text-muted-foreground', isGood && 'text-emerald-500')}>
          {icon}
        </div>
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className={cn('text-2xl font-bold', isGood ? 'text-emerald-500' : 'text-amber-500')}>
          {value.toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground">/ {target}% target</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}
