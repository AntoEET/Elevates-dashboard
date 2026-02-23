'use client';

import * as React from 'react';
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import type { TimeSeriesData } from '@/shared/schemas';

interface SparklineProps {
  data: TimeSeriesData | number[];
  color?: string;
  height?: number;
  showArea?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  color = 'var(--chart-1)',
  height = 40,
  showArea = false,
  className,
}: SparklineProps) {
  // Normalize data to array of { value } objects
  const chartData = React.useMemo(() => {
    if (Array.isArray(data)) {
      // Check if it's an array of numbers or TimeSeriesData
      if (data.length === 0) return [];
      const firstItem = data[0];
      if (typeof firstItem === 'number') {
        // Array of numbers
        return (data as number[]).map((value, index) => ({ value, index }));
      } else {
        // TimeSeriesData array
        return (data as TimeSeriesData).map((point, index) => ({ value: point.value, index }));
      }
    }
    return [];
  }, [data]);

  if (chartData.length === 0) return null;

  const minValue = Math.min(...chartData.map((d) => d.value));
  const maxValue = Math.max(...chartData.map((d) => d.value));
  const padding = (maxValue - minValue) * 0.1 || 1;

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis
            domain={[minValue - padding, maxValue + padding]}
            hide
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            fill={showArea ? color : 'none'}
            fillOpacity={showArea ? 0.1 : 0}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TrendSparklineProps {
  data: number[];
  trend: 'up' | 'down' | 'stable';
  height?: number;
  className?: string;
}

export function TrendSparkline({
  data,
  trend,
  height = 32,
  className,
}: TrendSparklineProps) {
  const color =
    trend === 'up'
      ? 'var(--success)'
      : trend === 'down'
        ? 'var(--danger)'
        : 'var(--muted)';

  return (
    <Sparkline
      data={data}
      color={color}
      height={height}
      showArea
      className={className}
    />
  );
}
