'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import { AnimatedCounter } from './AnimatedCounter';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MetricTrend } from '@/shared/schemas';

interface MetricCardProps {
  title: string;
  value: number;
  format?: 'number' | 'currency' | 'percent' | 'compact';
  prefix?: string;
  suffix?: string;
  trend?: MetricTrend;
  trendValue?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'crisis' | 'glow';
}

export function MetricCard({
  title,
  value,
  format = 'number',
  prefix,
  suffix,
  trend,
  trendValue,
  trendLabel,
  icon,
  className,
  onClick,
  size = 'md',
  variant = 'default',
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const trendColors = {
    up: 'text-emerald-500',
    down: 'text-red-500',
    stable: 'text-slate-500',
  };

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const valueSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <GlassCard
      variant={variant}
      hover={!!onClick}
      className={cn(sizeClasses[size], onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      <GlassCardHeader className="mb-2">
        <GlassCardTitle>{title}</GlassCardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </GlassCardHeader>

      <GlassCardContent>
        <div className="flex items-end gap-2">
          <span className={cn('font-bold tracking-tight', valueSizes[size])}>
            {prefix}
            <AnimatedCounter
              value={value}
              format={format}
            />
            {suffix}
          </span>
        </div>

        {(trend || trendValue !== undefined) && (
          <div className={cn('flex items-center gap-1.5 mt-2', trend && trendColors[trend])}>
            {trend && <TrendIcon className="h-4 w-4" />}
            {trendValue !== undefined && (
              <span className="text-sm font-medium">
                {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%
              </span>
            )}
            {trendLabel && (
              <span className="text-xs text-muted-foreground ml-1">{trendLabel}</span>
            )}
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}

interface MiniMetricProps {
  label: string;
  value: string | number;
  trend?: MetricTrend;
  className?: string;
}

export function MiniMetric({ label, value, trend, className }: MiniMetricProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  const trendColors = {
    up: 'text-emerald-500',
    down: 'text-red-500',
    stable: 'text-slate-500',
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-lg font-semibold">{value}</span>
        {trend && TrendIcon && (
          <TrendIcon className={cn('h-3 w-3', trendColors[trend])} />
        )}
      </div>
    </div>
  );
}
