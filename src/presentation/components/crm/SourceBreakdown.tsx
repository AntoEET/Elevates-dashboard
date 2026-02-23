'use client';

import * as React from 'react';
import { useProspectStore } from '@/store/prospect.store';
import { GlassCard } from '@/presentation/components/glass/GlassCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#F97316', // orange
  '#EC4899', // pink
];

export function SourceBreakdown() {
  const { getSourceStats, getPriorityStats } = useProspectStore();

  const sourceData = getSourceStats();
  const priorityData = getPriorityStats();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Source Breakdown */}
      <GlassCard size="md">
        <h3 className="font-semibold text-lg mb-4">Prospect Sources</h3>

        {sourceData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(12px)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Source List */}
            <div className="mt-6 space-y-2">
              {sourceData
                .sort((a, b) => b.value - a.value)
                .map((source, index) => (
                  <div
                    key={source.name}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{source.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{source.value} prospects</span>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No source data available</p>
            <p className="text-sm mt-1">Add source information to prospects to see breakdown</p>
          </div>
        )}
      </GlassCard>

      {/* Priority Distribution */}
      <GlassCard size="md">
        <h3 className="font-semibold text-lg mb-4">Priority Distribution</h3>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={priorityData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                backdropFilter: 'blur(12px)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Priority List */}
        <div className="mt-6 space-y-2">
          {priorityData.map((priority) => (
            <div
              key={priority.name}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: priority.color }}
                />
                <span className="text-sm font-medium">{priority.name} Priority</span>
              </div>
              <span className="text-sm text-muted-foreground">{priority.value} prospects</span>
            </div>
          ))}
        </div>

        {/* Priority Insights */}
        <div className="mt-6 pt-6 border-t border-glass-border">
          <h4 className="font-semibold text-sm mb-3">Priority Insights</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">High Priority</span>
              <span className="font-medium text-red-500">
                {priorityData[0]?.value > 0
                  ? ((priorityData[0].value / (priorityData[0].value + priorityData[1].value + priorityData[2].value)) * 100).toFixed(0)
                  : '0'}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Needs Attention</span>
              <span className="font-medium">
                {priorityData[0]?.value + priorityData[1]?.value || 0} prospects
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
