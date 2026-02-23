'use client';

import * as React from 'react';
import { useProspectStore } from '@/store/prospect.store';
import { GlassCard } from '@/presentation/components/glass/GlassCard';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function ProspectTrends() {
  const { getTrendData } = useProspectStore();
  const [days, setDays] = React.useState(30);

  const trendData = React.useMemo(() => getTrendData(days), [getTrendData, days]);

  // Calculate cumulative totals
  const cumulativeData = React.useMemo(() => {
    let cumulativeAdded = 0;
    let cumulativeWon = 0;
    let cumulativeLost = 0;

    return trendData.map((item) => {
      cumulativeAdded += item.added;
      cumulativeWon += item.won;
      cumulativeLost += item.lost;

      return {
        ...item,
        cumulativeAdded,
        cumulativeWon,
        cumulativeLost,
        displayDate: new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      };
    });
  }, [trendData]);

  const totalAdded = trendData.reduce((sum, item) => sum + item.added, 0);
  const totalWon = trendData.reduce((sum, item) => sum + item.won, 0);
  const totalLost = trendData.reduce((sum, item) => sum + item.lost, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard size="sm">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Prospects Added</p>
            <p className="text-3xl font-bold">{totalAdded}</p>
            <p className="text-xs text-muted-foreground mt-1">Last {days} days</p>
          </div>
        </GlassCard>

        <GlassCard size="sm">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Deals Won</p>
            <p className="text-3xl font-bold text-emerald-500">{totalWon}</p>
            <p className="text-xs text-muted-foreground mt-1">Last {days} days</p>
          </div>
        </GlassCard>

        <GlassCard size="sm">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Deals Lost</p>
            <p className="text-3xl font-bold text-red-500">{totalLost}</p>
            <p className="text-xs text-muted-foreground mt-1">Last {days} days</p>
          </div>
        </GlassCard>
      </div>

      {/* Trend Chart */}
      <GlassCard size="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Activity Trends</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={days === 7 ? 'default' : 'outline'}
              onClick={() => setDays(7)}
            >
              7D
            </Button>
            <Button
              size="sm"
              variant={days === 30 ? 'default' : 'outline'}
              onClick={() => setDays(30)}
            >
              30D
            </Button>
            <Button
              size="sm"
              variant={days === 90 ? 'default' : 'outline'}
              onClick={() => setDays(90)}
            >
              90D
            </Button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={cumulativeData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
            <XAxis
              dataKey="displayDate"
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                backdropFilter: 'blur(12px)',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="cumulativeAdded"
              name="Total Added"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="cumulativeWon"
              name="Total Won"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="cumulativeLost"
              name="Total Lost"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Daily Activity Chart */}
      <GlassCard size="md">
        <h3 className="font-semibold text-lg mb-4">Daily Activity</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={cumulativeData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
            <XAxis
              dataKey="displayDate"
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 12 }}
            />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                backdropFilter: 'blur(12px)',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="added"
              name="Added"
              stroke="#3B82F6"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="won"
              name="Won"
              stroke="#10B981"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="lost"
              name="Lost"
              stroke="#EF4444"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}
