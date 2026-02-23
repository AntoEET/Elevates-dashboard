'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { useCrisisStore } from '@/store/crisis.store';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/presentation/components/notifications/NotificationBell';
import { GlobalSearch } from '@/presentation/components/search/GlobalSearch';

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  const { isActive: isCrisisMode, activeAlerts, dismissAlert } = useCrisisStore();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className={cn('flex-1 flex flex-col', className)}>
        {/* Top Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-end gap-3 px-4 md:px-6 lg:px-8 py-3 bg-background/80 backdrop-blur-md border-b border-glass-border">
          <GlobalSearch />
          <NotificationBell />
        </div>

        {/* Crisis Banner */}
        {isCrisisMode && activeAlerts.length > 0 && (
          <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-3">
            <div className="flex items-center gap-3 max-w-7xl mx-auto">
              <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-500">
                  Crisis Mode Active: {activeAlerts.length} alert(s) require attention
                </p>
                <p className="text-xs text-red-400/80 mt-0.5">
                  {activeAlerts[0]?.title}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                onClick={() => activeAlerts[0] && dismissAlert(activeAlerts[0].id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8', className)}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn('animate-fade-in', className)}>
      {children}
    </div>
  );
}
