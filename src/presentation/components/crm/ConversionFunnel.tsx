'use client';

import * as React from 'react';
import { useProspectStore } from '@/store/prospect.store';
import { GlassCard } from '@/presentation/components/glass/GlassCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = [
  '#64748B', // slate
  '#3B82F6', // blue
  '#06B6D4', // cyan
  '#6366F1', // indigo
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#F97316', // orange
  '#10B981', // emerald
];

export function ConversionFunnel() {
  const { getConversionFunnel } = useProspectStore();
  const funnelData = getConversionFunnel();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Funnel Chart */}
      <GlassCard size="md" className="lg:col-span-2">
        <h3 className="font-semibold text-lg mb-4">Pipeline Conversion Funnel</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={funnelData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
            <XAxis type="number" stroke="var(--muted-foreground)" />
            <YAxis
              type="category"
              dataKey="stage"
              stroke="var(--muted-foreground)"
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                backdropFilter: 'blur(12px)',
              }}
              formatter={(value: any, name: any, props: any) => [
                `${value || 0} prospects (${props.payload.percentage.toFixed(1)}%)`,
                'Count',
              ]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Stage Breakdown */}
      <GlassCard size="md">
        <h3 className="font-semibold text-lg mb-4">Stage Breakdown</h3>
        <div className="space-y-3">
          {funnelData.map((item, index) => (
            <div key={item.stage} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.stage}</span>
                <span className="text-muted-foreground">
                  {item.count} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Conversion Insights */}
        <div className="mt-6 pt-6 border-t border-glass-border space-y-2">
          <h4 className="font-semibold text-sm mb-3">Key Insights</h4>
          <div className="text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Lead → Invited</span>
              <span className="font-medium">
                {funnelData[0]?.count > 0
                  ? ((funnelData[1]?.count / funnelData[0]?.count) * 100).toFixed(1)
                  : '0'}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Invited → Connected</span>
              <span className="font-medium">
                {funnelData[1]?.count > 0
                  ? ((funnelData[2]?.count / funnelData[1]?.count) * 100).toFixed(1)
                  : '0'}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Proposal → Won</span>
              <span className="font-medium text-emerald-500">
                {funnelData[6]?.count > 0
                  ? ((funnelData[7]?.count / funnelData[6]?.count) * 100).toFixed(1)
                  : '0'}%
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
