'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { AgentStatus, MetricStatus, ContractHealth, ComplianceStatus } from '@/shared/schemas';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
  {
    variants: {
      status: {
        healthy: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        warning: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        critical: 'text-red-500 bg-red-500/10 border-red-500/20',
        degraded: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        offline: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
        // Contract health
        'at-risk': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        churning: 'text-red-500 bg-red-500/10 border-red-500/20',
        expanding: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        // Compliance
        compliant: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        'non-compliant': 'text-red-500 bg-red-500/10 border-red-500/20',
        'pending-review': 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      status: 'healthy',
      size: 'md',
    },
  }
);

type AllStatuses = AgentStatus | MetricStatus | ContractHealth | ComplianceStatus;

interface StatusBadgeProps extends Omit<VariantProps<typeof statusBadgeVariants>, 'status'> {
  status: AllStatuses;
  label?: string;
  showDot?: boolean;
  className?: string;
}

const statusLabels: Record<AllStatuses, string> = {
  healthy: 'Healthy',
  warning: 'Warning',
  critical: 'Critical',
  degraded: 'Degraded',
  offline: 'Offline',
  'at-risk': 'At Risk',
  churning: 'Churning',
  expanding: 'Expanding',
  compliant: 'Compliant',
  'non-compliant': 'Non-Compliant',
  'pending-review': 'Pending Review',
};

export function StatusBadge({
  status,
  label,
  showDot = true,
  size,
  className,
}: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status, size }), className)}>
      {showDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            status === 'healthy' || status === 'compliant' || status === 'expanding'
              ? 'bg-emerald-500'
              : status === 'warning' || status === 'at-risk' || status === 'pending-review'
                ? 'bg-amber-500'
                : status === 'critical' || status === 'churning' || status === 'non-compliant'
                  ? 'bg-red-500 animate-pulse'
                  : status === 'degraded'
                    ? 'bg-orange-500'
                    : 'bg-slate-500'
          )}
        />
      )}
      {label || statusLabels[status]}
    </span>
  );
}

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}

const riskColors = {
  low: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  high: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  critical: 'text-red-500 bg-red-500/10 border-red-500/20',
};

export function RiskBadge({ level, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        riskColors[level],
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          level === 'low'
            ? 'bg-emerald-500'
            : level === 'medium'
              ? 'bg-amber-500'
              : level === 'high'
                ? 'bg-orange-500'
                : 'bg-red-500 animate-pulse'
        )}
      />
      {level.charAt(0).toUpperCase() + level.slice(1)} Risk
    </span>
  );
}
