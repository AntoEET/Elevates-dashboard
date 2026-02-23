'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Target,
  Lightbulb,
  ChevronRight,
  Trophy,
} from 'lucide-react';
import type { Insight, InsightPriority, InsightCategory } from '@/shared/schemas';
import { formatRelativeTime } from '@/shared/lib/utils';

interface InsightsPanelProps {
  insights: Insight[];
  isLoading?: boolean;
  className?: string;
  maxItems?: number;
  onInsightClick?: (insight: Insight) => void;
}

const priorityColors: Record<InsightPriority, string> = {
  critical: 'border-l-red-500 bg-red-500/5',
  high: 'border-l-orange-500 bg-orange-500/5',
  medium: 'border-l-amber-500 bg-amber-500/5',
  low: 'border-l-slate-500 bg-slate-500/5',
};

const categoryIcons: Record<InsightCategory, React.ElementType> = {
  opportunity: Lightbulb,
  risk: AlertTriangle,
  'action-required': Target,
  achievement: Trophy,
  trend: TrendingUp,
};

const categoryColors: Record<InsightCategory, string> = {
  opportunity: 'text-blue-500',
  risk: 'text-red-500',
  'action-required': 'text-amber-500',
  achievement: 'text-emerald-500',
  trend: 'text-purple-500',
};

export function InsightsPanel({
  insights,
  isLoading = false,
  className,
  maxItems = 5,
  onInsightClick,
}: InsightsPanelProps) {
  const displayInsights = insights.slice(0, maxItems);

  return (
    <GlassCard size="lg" className={className}>
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <GlassCardTitle>AI Insights</GlassCardTitle>
        </div>
        <span className="text-xs text-muted-foreground">
          {insights.length} insight{insights.length !== 1 ? 's' : ''}
        </span>
      </GlassCardHeader>

      <GlassCardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : displayInsights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No insights available</p>
          </div>
        ) : (
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-3">
              {displayInsights.map((insight, index) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onClick={() => onInsightClick?.(insight)}
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}

interface InsightCardProps {
  insight: Insight;
  onClick?: () => void;
  style?: React.CSSProperties;
}

function InsightCard({ insight, onClick, style }: InsightCardProps) {
  const Icon = categoryIcons[insight.category];

  return (
    <div
      className={cn(
        'p-3 rounded-lg border-l-4 transition-all animate-fade-in',
        'hover:translate-x-1 cursor-pointer',
        priorityColors[insight.priority]
      )}
      onClick={onClick}
      style={style}
    >
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', categoryColors[insight.category])}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium truncate">{insight.title}</h4>
            {insight.priority === 'critical' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-500 font-medium">
                URGENT
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {insight.summary}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">
              {formatRelativeTime(insight.timestamp)}
            </span>
            {insight.actionable && insight.action && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-primary hover:text-primary"
              >
                {insight.action}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function InsightsSummary({ insights }: { insights: Insight[] }) {
  const criticalCount = insights.filter((i) => i.priority === 'critical').length;
  const actionableCount = insights.filter((i) => i.actionable).length;

  return (
    <div className="flex items-center gap-4 text-xs">
      {criticalCount > 0 && (
        <span className="text-red-500 font-medium">
          {criticalCount} critical
        </span>
      )}
      {actionableCount > 0 && (
        <span className="text-amber-500">
          {actionableCount} actionable
        </span>
      )}
    </div>
  );
}
