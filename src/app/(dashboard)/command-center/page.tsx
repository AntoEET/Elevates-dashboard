'use client';

import * as React from 'react';
import { PageHeader, PageContent } from '@/presentation/components/layout/DashboardShell';
import { Calendar } from '@/presentation/components/calendar/Calendar';
import { TodayTasks } from '@/presentation/components/todo/TodayTasks';
import { ActivityGraph } from '@/presentation/components/activity/ActivityGraph';
import { WeeklySummary } from '@/presentation/components/summary/WeeklySummary';
import { MiniChatBot } from '@/presentation/components/chat/MiniChatBot';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function CommandCenterPage() {
  return (
    <>
      <PageHeader
        title="Command Center"
        description="Your personal dashboard for tasks, events, and activity"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="glass">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <PageContent>
        {/* Top Row - Weekly Summary and Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Summary */}
          <WeeklySummary />

          {/* Calendar */}
          <Calendar compact />
        </div>

        {/* Middle Row - Activity Graph and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Graph - Compact */}
          <ActivityGraph compact />

          {/* Today's Tasks */}
          <TodayTasks />
        </div>
      </PageContent>

      {/* Mini Chat Bot - Floating */}
      <MiniChatBot />
    </>
  );
}
