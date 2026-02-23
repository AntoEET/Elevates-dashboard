'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  X,
  AlertTriangle,
  Clock,
  Users,
  FileText,
  CheckCircle,
  Linkedin,
  Instagram,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useTodoStore } from '@/store/todo.store';
import { useCalendarStore } from '@/store/calendar.store';

interface Notification {
  id: string;
  type: 'warning' | 'danger' | 'info';
  category: 'task' | 'client' | 'content' | 'calendar';
  title: string;
  description: string;
  timestamp: string;
  actionUrl?: string;
}

// Mock client data for at-risk detection
const MOCK_CLIENTS = [
  { id: 'global-foods', name: 'Global Foods Ltd', health: 'at-risk' },
];

export function NotificationBell() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dismissed, setDismissed] = React.useState<string[]>([]);

  const todos = useTodoStore((state) => state.todos);
  const events = useCalendarStore((state) => state.events);

  // Get content pipeline from localStorage
  const [contentPipeline, setContentPipeline] = React.useState<{
    linkedin: { scheduled: number; pending: number };
    instagram: { scheduled: number; pending: number };
  } | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('elevates-content-pipeline');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const linkedin = parsed.find((p: { platform: string }) => p.platform === 'linkedin');
        const instagram = parsed.find((p: { platform: string }) => p.platform === 'instagram');
        setContentPipeline({
          linkedin: { scheduled: linkedin?.scheduled || 0, pending: linkedin?.pending || 0 },
          instagram: { scheduled: instagram?.scheduled || 0, pending: instagram?.pending || 0 },
        });
      } catch (e) {
        console.error('Failed to parse content pipeline');
      }
    }
  }, [isOpen]); // Refresh when opening

  // Generate notifications based on current state
  const notifications = React.useMemo(() => {
    const notifs: Notification[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Overdue tasks
    const overdueTasks = todos.filter((todo) => {
      if (todo.completed || !todo.dueDate) return false;
      const dueDate = new Date(todo.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });

    overdueTasks.forEach((task) => {
      notifs.push({
        id: `task-overdue-${task.id}`,
        type: 'danger',
        category: 'task',
        title: 'Overdue Task',
        description: task.title,
        timestamp: task.dueDate!,
        actionUrl: '/tasks',
      });
    });

    // 2. Tasks due today
    const tasksDueToday = todos.filter((todo) => {
      if (todo.completed || !todo.dueDate) return false;
      const dueDate = new Date(todo.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });

    if (tasksDueToday.length > 0) {
      notifs.push({
        id: 'tasks-due-today',
        type: 'warning',
        category: 'task',
        title: `${tasksDueToday.length} Task${tasksDueToday.length > 1 ? 's' : ''} Due Today`,
        description: tasksDueToday.map((t) => t.title).join(', '),
        timestamp: new Date().toISOString(),
        actionUrl: '/tasks',
      });
    }

    // 3. At-risk clients
    const atRiskClients = MOCK_CLIENTS.filter((c) => c.health === 'at-risk');
    atRiskClients.forEach((client) => {
      notifs.push({
        id: `client-risk-${client.id}`,
        type: 'warning',
        category: 'client',
        title: 'Client At Risk',
        description: `${client.name} needs attention`,
        timestamp: new Date().toISOString(),
        actionUrl: `/client-performance/${client.id}`,
      });
    });

    // 4. Empty content pipeline
    if (contentPipeline) {
      const linkedInTotal = contentPipeline.linkedin.scheduled + contentPipeline.linkedin.pending;
      const instagramTotal = contentPipeline.instagram.scheduled + contentPipeline.instagram.pending;

      if (linkedInTotal === 0) {
        notifs.push({
          id: 'content-linkedin-empty',
          type: 'warning',
          category: 'content',
          title: 'LinkedIn Pipeline Empty',
          description: 'No posts scheduled or pending',
          timestamp: new Date().toISOString(),
          actionUrl: '/marketing',
        });
      }

      if (instagramTotal === 0) {
        notifs.push({
          id: 'content-instagram-empty',
          type: 'warning',
          category: 'content',
          title: 'Instagram Pipeline Empty',
          description: 'No posts scheduled or pending',
          timestamp: new Date().toISOString(),
          actionUrl: '/marketing',
        });
      }
    }

    // 5. Upcoming meetings today
    const todayStr = today.toISOString().split('T')[0];
    const meetingsToday = events.filter(
      (e) => e.date === todayStr && e.type === 'meeting'
    );

    if (meetingsToday.length > 0) {
      notifs.push({
        id: 'meetings-today',
        type: 'info',
        category: 'calendar',
        title: `${meetingsToday.length} Meeting${meetingsToday.length > 1 ? 's' : ''} Today`,
        description: meetingsToday.map((m) => `${m.startTime || ''} ${m.title}`).join(', '),
        timestamp: new Date().toISOString(),
        actionUrl: '/calendar',
      });
    }

    // Filter out dismissed notifications
    return notifs.filter((n) => !dismissed.includes(n.id));
  }, [todos, events, contentPipeline, dismissed]);

  const handleDismiss = (id: string) => {
    setDismissed((prev) => [...prev, id]);
  };

  const handleDismissAll = () => {
    setDismissed(notifications.map((n) => n.id));
    setIsOpen(false);
  };

  const getIcon = (category: Notification['category']) => {
    switch (category) {
      case 'task':
        return <Clock className="h-4 w-4" />;
      case 'client':
        return <Users className="h-4 w-4" />;
      case 'content':
        return <FileText className="h-4 w-4" />;
      case 'calendar':
        return <Clock className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'danger':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'info':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:
        return 'bg-muted/50 text-muted-foreground';
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-xl border border-glass-border bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-glass-border">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleDismissAll}
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <ScrollArea className="max-h-[400px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-glass-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'p-2 rounded-lg border',
                            getTypeStyles(notification.type)
                          )}
                        >
                          {getIcon(notification.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDismiss(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {notification.description}
                          </p>
                          {notification.actionUrl && (
                            <a
                              href={notification.actionUrl}
                              className="text-xs text-primary hover:underline mt-1 inline-block"
                              onClick={() => setIsOpen(false)}
                            >
                              View details
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}
