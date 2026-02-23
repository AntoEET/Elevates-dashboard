'use client';

import * as React from 'react';
import { PageHeader, PageContent } from '@/presentation/components/layout/DashboardShell';
import { Calendar } from '@/presentation/components/calendar/Calendar';

export default function CalendarPage() {
  return (
    <>
      <PageHeader
        title="Calendar"
        description="Manage your events and schedule"
      />

      <PageContent>
        <Calendar />
      </PageContent>
    </>
  );
}
