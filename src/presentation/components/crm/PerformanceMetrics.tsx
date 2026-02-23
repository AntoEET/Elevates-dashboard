'use client';

import * as React from 'react';
import { useProspectStore } from '@/store/prospect.store';
import { GlassCard } from '@/presentation/components/glass/GlassCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

const STAGE_COLORS: Record<string, string> = {
  'new-lead': '#64748B',
  'invited': '#3B82F6',
  'connected': '#06B6D4',
  'first-message': '#6366F1',
  'follow-up': '#8B5CF6',
  'meeting-scheduled': '#F59E0B',
  'proposal-sent': '#F97316',
  'closed-won': '#10B981',
  'closed-lost': '#EF4444',
};

export function PerformanceMetrics() {
  const { getFollowUpStats, getAverageTimeInStage, getPendingFollowUps } = useProspectStore();

  const followUpStats = getFollowUpStats();
  const timeInStage = getAverageTimeInStage();
  const pendingFollowUps = getPendingFollowUps();

  // Prepare data for time in stage chart
  const stageTimeData = timeInStage
    .filter((item) => item.averageDays > 0)
    .map((item) => ({
      stage: item.stage
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      days: item.averageDays,
    }));

  // Calculate overdue follow-ups
  const now = new Date();
  const overdueFollowUps = pendingFollowUps.filter(
    (item) => new Date(item.followUp.date) < now
  ).length;

  return (
    <div className="space-y-6">
      {/* Follow-up Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard size="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Follow-ups</p>
              <p className="text-3xl font-bold">{followUpStats.total}</p>
            </div>
            <Clock className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
        </GlassCard>

        <GlassCard size="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold text-emerald-500">{followUpStats.completed}</p>
              <p className="text-xs text-emerald-500 mt-1">
                {followUpStats.completionRate.toFixed(0)}% rate
              </p>
            </div>
            <CheckCircle2 className="h-10 w-10 text-emerald-500 opacity-50" />
          </div>
        </GlassCard>

        <GlassCard size="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-amber-500">{followUpStats.pending}</p>
              <p className="text-xs text-muted-foreground mt-1">Active</p>
            </div>
            <Clock className="h-10 w-10 text-amber-500 opacity-50" />
          </div>
        </GlassCard>

        <GlassCard size="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-3xl font-bold text-red-500">{overdueFollowUps}</p>
              <p className="text-xs text-red-500 mt-1">Needs attention</p>
            </div>
            <XCircle className="h-10 w-10 text-red-500 opacity-50" />
          </div>
        </GlassCard>
      </div>

      {/* Average Time in Stage */}
      <GlassCard size="md">
        <h3 className="font-semibold text-lg mb-4">Average Time in Stage</h3>

        {stageTimeData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={stageTimeData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                <XAxis
                  dataKey="stage"
                  stroke="var(--muted-foreground)"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(12px)',
                  }}
                  formatter={(value: any) => [`${value || 0} days`, 'Average Time']}
                />
                <Bar dataKey="days" radius={[4, 4, 0, 0]}>
                  {stageTimeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STAGE_COLORS[entry.stage.toLowerCase().replace(/ /g, '-')] || '#64748B'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Fastest Stage</p>
                <p className="text-lg font-bold">
                  {stageTimeData.reduce((min, item) => (item.days < min.days ? item : min)).stage}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stageTimeData.reduce((min, item) => (item.days < min.days ? item : min)).days} days avg
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Slowest Stage</p>
                <p className="text-lg font-bold">
                  {stageTimeData.reduce((max, item) => (item.days > max.days ? item : max)).stage}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stageTimeData.reduce((max, item) => (item.days > max.days ? item : max)).days} days avg
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Not enough data yet</p>
            <p className="text-sm mt-1">
              Move prospects through stages to see average time metrics
            </p>
          </div>
        )}
      </GlassCard>

      {/* Upcoming Follow-ups */}
      <GlassCard size="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Upcoming Follow-ups</h3>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>

        {pendingFollowUps.length > 0 ? (
          <div className="space-y-2">
            {pendingFollowUps.slice(0, 10).map((item) => {
              const isOverdue = new Date(item.followUp.date) < now;
              const daysUntil = Math.ceil(
                (new Date(item.followUp.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={`${item.prospect.id}-${item.followUp.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.prospect.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.followUp.type} • {item.followUp.notes.slice(0, 50)}
                      {item.followUp.notes.length > 50 ? '...' : ''}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p
                      className={`text-sm font-medium ${
                        isOverdue ? 'text-red-500' : daysUntil === 0 ? 'text-amber-500' : ''
                      }`}
                    >
                      {isOverdue
                        ? `${Math.abs(daysUntil)} days overdue`
                        : daysUntil === 0
                        ? 'Today'
                        : `In ${daysUntil} days`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.followUp.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No pending follow-ups</p>
            <p className="text-sm mt-1">All caught up!</p>
          </div>
        )}

        {pendingFollowUps.length > 10 && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            ... and {pendingFollowUps.length - 10} more
          </p>
        )}
      </GlassCard>
    </div>
  );
}
