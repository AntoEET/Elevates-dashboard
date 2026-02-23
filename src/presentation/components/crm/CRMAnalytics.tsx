'use client';

import * as React from 'react';
import { useProspectStore } from '@/store/prospect.store';
import { GlassCard } from '@/presentation/components/glass/GlassCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
} from 'lucide-react';
import { ConversionFunnel } from './ConversionFunnel';
import { ProspectTrends } from './ProspectTrends';
import { SourceBreakdown } from './SourceBreakdown';
import { PerformanceMetrics } from './PerformanceMetrics';

export function CRMAnalytics() {
  const {
    prospects,
    getStageStats,
    getConversionRate,
    getPendingFollowUps,
    getFollowUpStats,
  } = useProspectStore();

  const stats = getStageStats();
  const conversionRate = getConversionRate();
  const pendingFollowUps = getPendingFollowUps();
  const followUpStats = getFollowUpStats();

  const activePipeline = prospects.length - stats['closed-won'] - stats['closed-lost'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard size="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Prospects</p>
              <p className="text-3xl font-bold">{prospects.length}</p>
            </div>
            <Users className="h-10 w-10 text-primary opacity-50" />
          </div>
        </GlassCard>

        <GlassCard size="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Pipeline</p>
              <p className="text-3xl font-bold">{activePipeline}</p>
              <p className="text-xs text-blue-500 mt-1">In progress</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-500 opacity-50" />
          </div>
        </GlassCard>

        <GlassCard size="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-3xl font-bold">{conversionRate.toFixed(1)}%</p>
              <p className="text-xs text-emerald-500 mt-1">
                {stats['closed-won']} won / {stats['closed-won'] + stats['closed-lost']} closed
              </p>
            </div>
            <Target className="h-10 w-10 text-emerald-500 opacity-50" />
          </div>
        </GlassCard>

        <GlassCard size="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Follow-up Rate</p>
              <p className="text-3xl font-bold">{followUpStats.completionRate.toFixed(0)}%</p>
              <p className="text-xs text-amber-500 mt-1">
                {followUpStats.completed} / {followUpStats.total} completed
              </p>
            </div>
            <CheckCircle2 className="h-10 w-10 text-amber-500 opacity-50" />
          </div>
        </GlassCard>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">
            <BarChart3 className="h-4 w-4 mr-2" />
            Conversion Funnel
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="sources">
            <Target className="h-4 w-4 mr-2" />
            Sources
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Clock className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="funnel">
          <ConversionFunnel />
        </TabsContent>

        <TabsContent value="trends">
          <ProspectTrends />
        </TabsContent>

        <TabsContent value="sources">
          <SourceBreakdown />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
