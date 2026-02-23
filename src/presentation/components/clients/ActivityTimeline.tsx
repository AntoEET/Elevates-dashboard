'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/shared/lib/utils';
import {
  User,
  FileText,
  CheckSquare,
  StickyNote,
  Calendar,
  Activity,
  AlertTriangle,
  Trash2,
  Edit,
  Plus,
} from 'lucide-react';
import type { ActivityEntry, ActivityType } from '@/shared/schemas/client-portfolio';

interface ActivityTimelineProps {
  activities: ActivityEntry[];
  className?: string;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  'client-created': <Plus className="h-3 w-3" />,
  'client-updated': <Edit className="h-3 w-3" />,
  'client-deleted': <Trash2 className="h-3 w-3" />,
  'task-created': <Plus className="h-3 w-3" />,
  'task-updated': <Edit className="h-3 w-3" />,
  'task-completed': <CheckSquare className="h-3 w-3" />,
  'task-deleted': <Trash2 className="h-3 w-3" />,
  'meeting-scheduled': <Calendar className="h-3 w-3" />,
  'meeting-completed': <Calendar className="h-3 w-3" />,
  'meeting-cancelled': <Calendar className="h-3 w-3" />,
  'note-created': <StickyNote className="h-3 w-3" />,
  'note-updated': <Edit className="h-3 w-3" />,
  'note-deleted': <Trash2 className="h-3 w-3" />,
  'document-uploaded': <FileText className="h-3 w-3" />,
  'document-deleted': <Trash2 className="h-3 w-3" />,
  'contact-updated': <User className="h-3 w-3" />,
  'contract-updated': <FileText className="h-3 w-3" />,
  'health-score-changed': <Activity className="h-3 w-3" />,
};

const activityColors: Record<ActivityType, string> = {
  'client-created': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  'client-updated': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  'client-deleted': 'bg-red-500/10 text-red-500 border-red-500/30',
  'task-created': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  'task-updated': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  'task-completed': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  'task-deleted': 'bg-red-500/10 text-red-500 border-red-500/30',
  'meeting-scheduled': 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  'meeting-completed': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  'meeting-cancelled': 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  'note-created': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  'note-updated': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  'note-deleted': 'bg-red-500/10 text-red-500 border-red-500/30',
  'document-uploaded': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  'document-deleted': 'bg-red-500/10 text-red-500 border-red-500/30',
  'contact-updated': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  'contract-updated': 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  'health-score-changed': 'bg-amber-500/10 text-amber-500 border-amber-500/30',
};

export function ActivityTimeline({ activities, className }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground text-sm', className)}>
        No activity recorded
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-glass-border" />

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <ActivityItem key={activity.id} activity={activity} isFirst={index === 0} />
        ))}
      </div>
    </div>
  );
}

interface ActivityItemProps {
  activity: ActivityEntry;
  isFirst: boolean;
}

function ActivityItem({ activity, isFirst }: ActivityItemProps) {
  const icon = activityIcons[activity.type] || <Activity className="h-3 w-3" />;
  const colorClass = activityColors[activity.type] || 'bg-slate-500/10 text-slate-500 border-slate-500/30';

  return (
    <div className="relative flex gap-3 pl-0">
      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex h-6 w-6 items-center justify-center rounded-full border',
          colorClass
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-4">
        <p className="text-sm leading-tight">{activity.description}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelativeTime(activity.timestamp)}
        </p>
      </div>
    </div>
  );
}

// Compact version for smaller spaces
interface ActivityTimelineCompactProps {
  activities: ActivityEntry[];
  maxItems?: number;
  className?: string;
}

export function ActivityTimelineCompact({
  activities,
  maxItems = 5,
  className,
}: ActivityTimelineCompactProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (displayActivities.length === 0) {
    return (
      <div className={cn('text-center py-4 text-muted-foreground text-xs', className)}>
        No recent activity
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {displayActivities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-2 text-xs"
        >
          <div
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full border flex-shrink-0',
              activityColors[activity.type] || 'bg-slate-500/10 text-slate-500 border-slate-500/30'
            )}
          >
            {activityIcons[activity.type] || <Activity className="h-2.5 w-2.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-muted-foreground line-clamp-2">{activity.description}</p>
            <p className="text-muted-foreground/70 text-[10px] mt-0.5">
              {formatRelativeTime(activity.timestamp)}
            </p>
          </div>
        </div>
      ))}
      {activities.length > maxItems && (
        <p className="text-xs text-muted-foreground/70 text-center pt-2">
          +{activities.length - maxItems} more activities
        </p>
      )}
    </div>
  );
}
