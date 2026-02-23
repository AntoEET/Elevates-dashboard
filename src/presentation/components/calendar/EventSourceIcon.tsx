'use client';

import { cn } from '@/lib/utils';

interface EventSourceIconProps {
  source?: 'local' | 'google';
  syncStatus?: 'synced' | 'pending' | 'error';
  className?: string;
}

export function EventSourceIcon({ source, syncStatus, className }: EventSourceIconProps) {
  if (source !== 'google') {
    return null; // Only show icon for Google events
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        'w-4 h-4 text-white text-[8px] font-bold',
        syncStatus === 'error' && 'bg-red-500',
        syncStatus === 'pending' && 'bg-amber-500',
        syncStatus === 'synced' && 'bg-blue-500',
        !syncStatus && 'bg-blue-500',
        className
      )}
      title={
        syncStatus === 'error'
          ? 'Sync error'
          : syncStatus === 'pending'
          ? 'Pending sync'
          : 'Synced with Google Calendar'
      }
    >
      G
    </div>
  );
}
