'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import { useTodoStore, type TodoItem } from '@/store/todo.store';
import { useCalendarStore } from '@/store/calendar.store';
import {
  Check,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Flag,
} from 'lucide-react';

interface TodayTasksProps {
  className?: string;
}

export function TodayTasks({ className }: TodayTasksProps) {
  const { todos, toggleTodo } = useTodoStore();
  const { events } = useCalendarStore();

  const today = new Date().toISOString().split('T')[0];

  // Get today's events
  const todayEvents = events.filter((e) => e.date === today);

  // Get pending todos (tasks due today or without due date)
  const todayTodos = todos.filter((t) => {
    if (t.completed) return false;
    if (!t.dueDate) return true; // Show all pending tasks without due date
    return t.dueDate === today;
  });

  // Get completed todos for today
  const completedToday = todos.filter((t) => {
    if (!t.completed || !t.completedAt) return false;
    return t.completedAt.split('T')[0] === today;
  });

  const priorityColors = {
    high: 'text-red-500',
    medium: 'text-amber-500',
    low: 'text-blue-500',
  };

  const priorityBg = {
    high: 'bg-red-500/10',
    medium: 'bg-amber-500/10',
    low: 'bg-blue-500/10',
  };

  return (
    <GlassCard className={className}>
      <GlassCardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <GlassCardTitle>Today's Overview</GlassCardTitle>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </GlassCardHeader>

      <GlassCardContent className="space-y-4">
        {/* Today's Events */}
        {todayEvents.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Events ({todayEvents.length})
            </h4>
            <div className="space-y-1.5">
              {todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/20"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.color || 'var(--primary)' }}
                  />
                  <span className="text-sm flex-1 truncate">{event.title}</span>
                  {event.startTime && (
                    <span className="text-xs text-muted-foreground">{event.startTime}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Tasks */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Circle className="h-3 w-3" />
            Tasks ({todayTodos.length})
          </h4>
          {todayTodos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">
              No pending tasks
            </p>
          ) : (
            <div className="space-y-1.5">
              {todayTodos.slice(0, 5).map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/20 transition-colors group"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="w-4 h-4 rounded-full border-2 border-muted-foreground hover:border-primary flex-shrink-0 transition-colors"
                  />
                  <span className="text-sm flex-1 truncate">{todo.title}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded font-medium',
                      priorityColors[todo.priority],
                      priorityBg[todo.priority]
                    )}
                  >
                    {todo.priority}
                  </span>
                </div>
              ))}
              {todayTodos.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{todayTodos.length - 5} more tasks
                </p>
              )}
            </div>
          )}
        </div>

        {/* Completed Today */}
        {completedToday.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Completed ({completedToday.length})
            </h4>
            <div className="space-y-1.5">
              {completedToday.slice(0, 3).map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-2 p-2 rounded-lg opacity-60"
                >
                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="text-sm flex-1 truncate line-through">{todo.title}</span>
                </div>
              ))}
              {completedToday.length > 3 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{completedToday.length - 3} more completed
                </p>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {todayEvents.length === 0 && todayTodos.length === 0 && completedToday.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No events or tasks for today
          </p>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}
