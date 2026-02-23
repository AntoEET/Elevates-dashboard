'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/presentation/components/glass/GlassCard';
import { StatusBadge } from '@/presentation/components/data-display/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/shared/lib/utils';
import { ArrowUpRight, Building2 } from 'lucide-react';
import type { ClientProfile } from '@/shared/schemas/client-portfolio';

interface ClientCardProps {
  client: ClientProfile;
  onClick?: () => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export function ClientCard({ client, onClick, variant = 'default', className }: ClientCardProps) {
  const isCompact = variant === 'compact';

  return (
    <GlassCard
      variant="inner"
      hover={!!onClick}
      className={cn(
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:bg-muted/30',
        className
      )}
      onClick={onClick}
    >
      <div className={cn('flex items-center justify-between', isCompact ? 'gap-3' : 'gap-4')}>
        {/* Client Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <div
            className={cn(
              'rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0',
              isCompact ? 'w-8 h-8' : 'w-10 h-10'
            )}
          >
            {client.logo ? (
              <img src={client.logo} alt={client.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className={cn('font-medium text-primary', isCompact ? 'text-xs' : 'text-sm')}>
                {client.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          {/* Name and Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={cn('font-medium truncate', isCompact ? 'text-sm' : '')}>
                {client.name}
              </h4>
              <Badge variant="outline" className="text-[10px] flex-shrink-0">
                {client.tier}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">{client.industry}</p>
          </div>
        </div>

        {/* Metrics - Hidden on compact */}
        {!isCompact && (
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">ARR</p>
              <p className="font-medium">
                {formatCurrency(client.financials.arr, { compact: true })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">ROI</p>
              <p className={cn('font-medium', (client.financials.roi || 0) >= 200 ? 'text-emerald-500' : '')}>
                {client.financials.roi}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Health</p>
              <StatusBadge status={client.contractHealth} size="sm" showDot={false} />
            </div>
            {onClick && <ArrowUpRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
          </div>
        )}

        {/* Compact metrics */}
        {isCompact && (
          <div className="flex items-center gap-3">
            <StatusBadge status={client.contractHealth} size="sm" showDot />
            {onClick && <ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// Grid card variant for card view
interface ClientGridCardProps {
  client: ClientProfile;
  onClick?: () => void;
  className?: string;
}

export function ClientGridCard({ client, onClick, className }: ClientGridCardProps) {
  return (
    <GlassCard
      hover={!!onClick}
      className={cn('cursor-pointer', className)}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">{client.name}</h4>
            <p className="text-xs text-muted-foreground">{client.industry}</p>
          </div>
        </div>
        <Badge variant="outline">{client.tier}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">ARR</p>
          <p className="font-medium">{formatCurrency(client.financials.arr, { compact: true })}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Health Score</p>
          <p className="font-medium">{client.financials.healthScore}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">NRR</p>
          <p className="font-medium">{client.financials.nrr}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">ROI</p>
          <p className={cn('font-medium', (client.financials.roi || 0) >= 200 ? 'text-emerald-500' : '')}>
            {client.financials.roi}%
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-glass-border">
        <StatusBadge status={client.contractHealth} size="sm" />
        <div className="flex gap-1">
          {client.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
