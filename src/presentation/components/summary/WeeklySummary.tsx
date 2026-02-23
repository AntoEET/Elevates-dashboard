'use client';

import * as React from 'react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import {
  Calendar,
  CheckSquare,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useTodoStore } from '@/store/todo.store';
import { useCalendarStore } from '@/store/calendar.store';
import Link from 'next/link';

// Mock clients for follow-up detection
const MOCK_CLIENTS = [
  { id: 'acme-corp', name: 'Acme Corporation', lastContact: 5, health: 'healthy' },
  { id: 'techstart-io', name: 'TechStart.io', lastContact: 12, health: 'expanding' },
  { id: 'global-foods', name: 'Global Foods Ltd', lastContact: 8, health: 'at-risk' },
];

export function WeeklySummary() {
  const todos = useTodoStore((state) => state.todos);
  const events = useCalendarStore((state) => state.events);

  // Calculate week boundaries
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  endOfWeek.setHours(23, 59, 59, 999);

  // Get week's meetings
  const weekMeetings = events.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      event.type === 'meeting' &&
      eventDate >= startOfWeek &&
      eventDate <= endOfWeek
    );
  });

  // Get tasks due this week
  const weekTasks = todos.filter((todo) => {
    if (!todo.dueDate || todo.completed) return false;
    const dueDate = new Date(todo.dueDate);
    return dueDate >= startOfWeek && dueDate <= endOfWeek;
  });

  // Get overdue tasks
  const overdueTasks = todos.filter((todo) => {
    if (!todo.dueDate || todo.completed) return false;
    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return dueDate < todayStart;
  });

  // Get clients needing follow-up (last contact > 7 days or at-risk)
  const clientsNeedingFollowUp = MOCK_CLIENTS.filter(
    (client) => client.lastContact > 7 || client.health === 'at-risk'
  );

  // Calculate completion rate
  const completedThisWeek = todos.filter((todo) => {
    if (!todo.completedAt) return false;
    const completedDate = new Date(todo.completedAt);
    return completedDate >= startOfWeek && completedDate <= endOfWeek;
  }).length;

  const totalTasksThisWeek = weekTasks.length + completedThisWeek;
  const completionRate = totalTasksThisWeek > 0
    ? Math.round((completedThisWeek / totalTasksThisWeek) * 100)
    : 100;

  const summaryItems = [
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Meetings This Week',
      value: weekMeetings.length,
      color: 'text-blue-500 bg-blue-500/10',
      href: '/calendar',
    },
    {
      icon: <CheckSquare className="h-5 w-5" />,
      label: 'Tasks Due',
      value: weekTasks.length,
      color: 'text-emerald-500 bg-emerald-500/10',
      href: '/tasks',
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      label: 'Overdue',
      value: overdueTasks.length,
      color: overdueTasks.length > 0 ? 'text-red-500 bg-red-500/10' : 'text-emerald-500 bg-emerald-500/10',
      href: '/tasks',
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Follow-ups Needed',
      value: clientsNeedingFollowUp.length,
      color: clientsNeedingFollowUp.length > 0 ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10',
      href: '/client-performance',
    },
  ];

  // Get today's agenda
  const todayStr = today.toISOString().split('T')[0];
  const todayMeetings = events.filter(
    (e) => e.date === todayStr && e.type === 'meeting'
  ).sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const todayTasks = todos.filter((todo) => {
    if (todo.completed) return false;
    return todo.dueDate === todayStr;
  });

  return (
    <GlassCard size="lg">
      <GlassCardHeader>
        <GlassCardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          This Week
        </GlassCardTitle>
        <span className="text-xs text-muted-foreground">
          {startOfWeek.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {endOfWeek.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </span>
      </GlassCardHeader>
      <GlassCardContent>
        {/* Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {summaryItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center p-3 rounded-lg glass-inner hover:bg-muted/30 transition-colors group"
            >
              <div className={cn('p-2 rounded-lg mb-2', item.color)}>
                {item.icon}
              </div>
              <span className="text-2xl font-bold">{item.value}</span>
              <span className="text-[10px] text-muted-foreground text-center">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Completion Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Week Progress</span>
            <span className="font-medium">{completionRate}% complete</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                completionRate >= 70
                  ? 'bg-emerald-500'
                  : completionRate >= 40
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              )}
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Today's Focus */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Today's Focus
          </h4>

          {todayMeetings.length === 0 && todayTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No meetings or tasks due today
            </p>
          ) : (
            <div className="space-y-2">
              {/* Today's Meetings */}
              {todayMeetings.slice(0, 3).map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center gap-3 p-2 rounded-lg glass-inner"
                >
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                    <Clock className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{meeting.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {meeting.startTime} - {meeting.endTime || 'TBD'}
                    </p>
                  </div>
                </div>
              ))}

              {/* Today's Tasks */}
              {todayTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded-lg glass-inner"
                >
                  <div className={cn(
                    'p-1.5 rounded-md',
                    task.priority === 'high'
                      ? 'bg-red-500/10 text-red-500'
                      : task.priority === 'medium'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-emerald-500/10 text-emerald-500'
                  )}>
                    <CheckSquare className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {task.priority} priority
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Clients Needing Follow-up */}
          {clientsNeedingFollowUp.length > 0 && (
            <>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                Clients Needing Attention
              </h4>
              <div className="space-y-2">
                {clientsNeedingFollowUp.map((client) => (
                  <Link
                    key={client.id}
                    href={`/client-performance/${client.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg glass-inner hover:bg-muted/30 transition-colors group"
                  >
                    <div className={cn(
                      'p-1.5 rounded-md',
                      client.health === 'at-risk'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-amber-500/10 text-amber-500'
                    )}>
                      <Users className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{client.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {client.health === 'at-risk'
                          ? 'At risk - needs immediate attention'
                          : `Last contact: ${client.lastContact} days ago`
                        }
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
