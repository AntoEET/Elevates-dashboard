'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface SyncStatusBadgeProps {
  status: 'idle' | 'syncing' | 'error';
  lastSyncTime?: string | null;
  className?: string;
}

export function SyncStatusBadge({ status, lastSyncTime, className }: SyncStatusBadgeProps) {
  const getStatusInfo = () => {
    if (status === 'syncing') {
      return {
        icon: Loader2,
        text: 'Syncing...',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        animate: true,
      };
    }

    if (status === 'error') {
      return {
        icon: AlertCircle,
        text: 'Sync Error',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        animate: false,
      };
    }

    // Idle status - check last sync time
    if (lastSyncTime) {
      const syncDate = new Date(lastSyncTime);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / 60000);

      if (diffMinutes < 5) {
        return {
          icon: CheckCircle2,
          text: 'Synced',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          animate: false,
        };
      } else if (diffMinutes < 30) {
        return {
          icon: Clock,
          text: `${diffMinutes}m ago`,
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          animate: false,
        };
      } else {
        return {
          icon: Clock,
          text: 'Stale',
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          animate: false,
        };
      }
    }

    return {
      icon: Clock,
      text: 'Not synced',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/30',
      animate: false,
    };
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
        statusInfo.bgColor,
        statusInfo.color,
        className
      )}
    >
      <Icon
        className={cn('h-3.5 w-3.5', statusInfo.animate && 'animate-spin')}
      />
      <span>{statusInfo.text}</span>
    </div>
  );
}
