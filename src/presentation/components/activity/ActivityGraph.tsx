'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import { useCalendarStore } from '@/store/calendar.store';
import { useTodoStore } from '@/store/todo.store';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { formatRelativeTime } from '@/shared/lib/utils';

interface ActivityGraphProps {
  className?: string;
  compact?: boolean;
}

interface ActivityItem {
  id: string;
  type: 'event' | 'task_completed' | 'task_created';
  title: string;
  timestamp: string;
  color?: string;
}

export function ActivityGraph({ className, compact = false }: ActivityGraphProps) {
  const { events } = useCalendarStore();
  const { todos } = useTodoStore();

  // Generate activity data for the last 14 days
  const activityData = React.useMemo(() => {
    const data: { date: string; events: number; tasks: number; label: string }[] = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayEvents = events.filter((e) => e.date === dateStr).length;
      const dayTasks = todos.filter((t) => {
        if (!t.completedAt) return false;
        return t.completedAt.split('T')[0] === dateStr;
      }).length;

      data.push({
        date: dateStr,
        events: dayEvents,
        tasks: dayTasks,
        label: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      });
    }

    return data;
  }, [events, todos]);

  // Generate recent activity feed
  const recentActivity = React.useMemo(() => {
    const activities: ActivityItem[] = [];

    // Add events from today and upcoming
    const today = new Date().toISOString().split('T')[0];
    events
      .filter((e) => e.date >= today)
      .slice(0, 5)
      .forEach((e) => {
        activities.push({
          id: e.id,
          type: 'event',
          title: e.title,
          timestamp: `${e.date}T${e.startTime || '00:00'}:00`,
          color: e.color,
        });
      });

    // Add completed tasks
    todos
      .filter((t) => t.completed && t.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 5)
      .forEach((t) => {
        activities.push({
          id: t.id,
          type: 'task_completed',
          title: t.title,
          timestamp: t.completedAt!,
        });
      });

    // Sort by timestamp
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [events, todos]);

  // Calculate stats
  const stats = React.useMemo(() => {
    const totalEvents = activityData.reduce((sum, d) => sum + d.events, 0);
    const totalTasks = activityData.reduce((sum, d) => sum + d.tasks, 0);
    const todayData = activityData[activityData.length - 1];

    return {
      totalEvents,
      totalTasks,
      todayEvents: todayData?.events || 0,
      todayTasks: todayData?.tasks || 0,
    };
  }, [activityData]);

  return (
    <GlassCard size={compact ? 'md' : 'lg'} className={className}>
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <GlassCardTitle>Activity Overview</GlassCardTitle>
        </div>
        <div className={cn('flex items-center gap-4 text-xs', compact && 'gap-2')}>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">Events ({stats.totalEvents})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Tasks ({stats.totalTasks})</span>
          </div>
        </div>
      </GlassCardHeader>

      <GlassCardContent>
        {/* Stats Row */}
        <div className={cn('grid gap-3 mb-4', compact ? 'grid-cols-2' : 'grid-cols-4')}>
          <StatCard
            icon={<Calendar className="h-4 w-4" />}
            label="Today's Events"
            value={stats.todayEvents}
            color="text-primary"
            compact={compact}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Tasks Done Today"
            value={stats.todayTasks}
            color="text-emerald-500"
            compact={compact}
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="14-Day Events"
            value={stats.totalEvents}
            color="text-blue-500"
            compact={compact}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="14-Day Tasks"
            value={stats.totalTasks}
            color="text-emerald-500"
            compact={compact}
          />
        </div>

        {/* Activity Chart */}
        <div className={compact ? 'h-[140px]' : 'h-[180px] mb-4'}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--muted-foreground)', fontSize: compact ? 8 : 10 }}
                tickLine={false}
                axisLine={false}
                interval={compact ? 1 : 0}
              />
              <YAxis
                tick={{ fill: 'var(--muted-foreground)', fontSize: compact ? 8 : 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={compact ? 20 : 30}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(12px)',
                }}
                formatter={(value, name) => [
                  value,
                  name === 'events' ? 'Events' : 'Tasks Completed',
                ]}
              />
              <Bar dataKey="events" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tasks" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity Feed - Hidden in compact mode */}
        {!compact && (
          <div className="border-t border-glass-border pt-4">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Recent Activity
            </h4>
            <ScrollArea className="h-[140px]">
              <div className="space-y-2">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                ) : (
                  recentActivity.map((activity) => (
                    <ActivityItemRow key={`${activity.type}-${activity.id}`} activity={activity} />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  compact = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  compact?: boolean;
}) {
  return (
    <div className={cn('rounded-lg glass-inner', compact ? 'p-2' : 'p-3')}>
      <div className={cn('mb-1', color)}>{icon}</div>
      <p className={cn('font-bold', compact ? 'text-lg' : 'text-xl')}>{value}</p>
      <p className={cn('text-muted-foreground', compact ? 'text-[9px]' : 'text-[10px]')}>{label}</p>
    </div>
  );
}

function ActivityItemRow({ activity }: { activity: ActivityItem }) {
  const isEvent = activity.type === 'event';
  const Icon = isEvent ? Calendar : CheckCircle2;

  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          isEvent ? 'bg-primary/10' : 'bg-emerald-500/10'
        )}
        style={activity.color ? { backgroundColor: `${activity.color}20` } : undefined}
      >
        <Icon
          className="h-4 w-4"
          style={activity.color ? { color: activity.color } : undefined}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{activity.title}</p>
        <p className="text-[10px] text-muted-foreground">
          {isEvent ? 'Scheduled' : 'Completed'} {formatRelativeTime(activity.timestamp)}
        </p>
      </div>
    </div>
  );
}
