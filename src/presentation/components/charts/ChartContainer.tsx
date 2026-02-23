'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import { Loader2 } from 'lucide-react';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  contentClassName?: string;
  onClick?: () => void;
}

export function ChartContainer({
  title,
  subtitle,
  actions,
  children,
  isLoading = false,
  className,
  contentClassName,
  onClick,
}: ChartContainerProps) {
  return (
    <GlassCard
      size="lg"
      hover={!!onClick}
      className={cn('relative', className)}
      onClick={onClick}
    >
      <GlassCardHeader>
        <div>
          <GlassCardTitle>{title}</GlassCardTitle>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions}
      </GlassCardHeader>

      <GlassCardContent className={cn('relative min-h-[200px]', contentClassName)}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          children
        )}
      </GlassCardContent>
    </GlassCard>
  );
}

interface ChartLegendProps {
  items: Array<{
    label: string;
    color: string;
    value?: string | number;
  }>;
  className?: string;
}

export function ChartLegend({ items, className }: ChartLegendProps) {
  return (
    <div className={cn('flex flex-wrap gap-4 mt-4', className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs text-muted-foreground">{item.label}</span>
          {item.value !== undefined && (
            <span className="text-xs font-medium">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

interface ChartTooltipProps {
  label?: string;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    formatter?: (value: number) => string;
  }>;
  className?: string;
}

export function ChartTooltip({ label, payload, className }: ChartTooltipProps) {
  if (!payload || payload.length === 0) return null;

  return (
    <div className={cn('glass rounded-lg p-3 min-w-[120px]', className)}>
      {label && (
        <p className="text-xs text-muted-foreground mb-2">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs">{entry.name}</span>
            </div>
            <span className="text-xs font-medium">
              {entry.formatter ? entry.formatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
