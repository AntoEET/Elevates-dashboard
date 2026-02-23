'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCalendarStore, type CalendarEvent } from '@/store/calendar.store';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Trash2,
  Edit2,
  CalendarIcon,
  PanelRightClose,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { SyncStatusBadge } from './SyncStatusBadge';
import { EventSourceIcon } from './EventSourceIcon';
import { CalendarSettings } from './CalendarSettings';
import { EventMigrationWizard } from './EventMigrationWizard';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const EVENT_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Green', value: '#059669' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Pink', value: '#EC4899' },
];

interface CalendarProps {
  className?: string;
  compact?: boolean;
}

export function Calendar({ className, compact = false }: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isMigrationWizardOpen, setIsMigrationWizardOpen] = React.useState(false);

  const {
    events,
    addEvent,
    updateEvent,
    removeEvent,
    getEventsForDate,
    googleConnected,
    googleSyncStatus,
    lastSyncTime,
    setSyncStatus,
    mergeSyncedEvents,
    setLastSyncTime,
    setGoogleConnected,
  } = useCalendarStore();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date().toISOString().split('T')[0];

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setIsSidebarOpen(true);
  };

  const handleAddEvent = (date?: string) => {
    setEditingEvent(null);
    if (date) setSelectedDate(date);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = (id: string) => {
    removeEvent(id);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      const response = await fetch('/api/calendar/google/sync');

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const data = await response.json();

      if (data.success) {
        mergeSyncedEvents(data.events);
        setLastSyncTime(data.syncedAt);
        setSyncStatus('idle');
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error', error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  // Build calendar days - only current month
  const calendarDays = React.useMemo(() => {
    const days: Array<{ day: number | null; date: string | null; isCurrentMonth: boolean; isToday: boolean }> = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, date: null, isCurrentMonth: false, isToday: false });
    }

    // Current month only
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day).toISOString().split('T')[0];
      days.push({ day, date, isCurrentMonth: true, isToday: date === today });
    }

    return days;
  }, [year, month, firstDayOfMonth, daysInMonth, today]);

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Check for successful OAuth connection and trigger initial sync
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('google_calendar_connected');

    if (connected === 'true') {
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);

      // Trigger initial sync
      handleSync();

      // Show migration wizard if there are local events
      const localEvents = events.filter((e) => !e.source || e.source === 'local');
      if (localEvents.length > 0) {
        setIsMigrationWizardOpen(true);
      }
    }
  }, []);

  // Check connection status on mount
  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/calendar/google/auth/status');
        const data = await response.json();
        if (data.connected) {
          setGoogleConnected(true);
        }
      } catch (error) {
        console.error('Failed to check connection status:', error);
      }
    };

    checkStatus();
  }, []);

  // Automatic periodic sync (every 30 minutes)
  React.useEffect(() => {
    if (!googleConnected) return;

    const syncInterval = setInterval(() => {
      handleSync();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(syncInterval);
  }, [googleConnected]);

  // Offline mode support
  React.useEffect(() => {
    const handleOnline = () => {
      // When coming back online, trigger a sync if connected
      if (googleConnected) {
        console.log('Network restored, syncing...');
        handleSync();
      }
    };

    const handleOffline = () => {
      console.log('Network offline, changes will sync when online');
      setSyncStatus('idle', 'Offline - changes will sync when online');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [googleConnected]);

  return (
    <>
      <GlassCard size={compact ? 'md' : 'lg'} className={cn('relative', className)}>
        {/* Header */}
        <GlassCardHeader className={cn('border-b border-glass-border', compact ? 'pb-3' : 'pb-4')}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className={cn(
                'rounded-lg bg-primary/10 flex items-center justify-center',
                compact ? 'w-8 h-8' : 'w-10 h-10'
              )}>
                <CalendarIcon className={cn('text-primary', compact ? 'h-4 w-4' : 'h-5 w-5')} />
              </div>
              <div>
                <GlassCardTitle className={compact ? 'text-sm' : 'text-base'}>
                  {MONTHS[month]} {year}
                </GlassCardTitle>
                {!compact && (
                  <p className="text-xs text-muted-foreground">
                    {events.length} event{events.length !== 1 ? 's' : ''} total
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!compact && googleConnected && (
                <SyncStatusBadge
                  status={googleSyncStatus}
                  lastSyncTime={lastSyncTime}
                  className="mr-2"
                />
              )}
              {!compact && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="text-xs mr-2 h-8"
                >
                  Today
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={compact ? 'h-7 w-7' : 'h-8 w-8'}
                onClick={goToPrevMonth}
              >
                <ChevronLeft className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={compact ? 'h-7 w-7' : 'h-8 w-8'}
                onClick={goToNextMonth}
              >
                <ChevronRight className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
              </Button>
              {!compact && googleConnected && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-1"
                  onClick={handleSync}
                  disabled={isSyncing || googleSyncStatus === 'syncing'}
                  title="Sync with Google Calendar"
                >
                  <RefreshCw className={cn('h-4 w-4', (isSyncing || googleSyncStatus === 'syncing') && 'animate-spin')} />
                </Button>
              )}
              {!compact && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsSettingsOpen(true)}
                  title="Calendar Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              <Button
                size={compact ? 'icon' : 'sm'}
                className={cn('ml-2', compact ? 'h-7 w-7' : 'h-8')}
                onClick={() => handleAddEvent(today)}
              >
                <Plus className={compact ? 'h-4 w-4' : 'h-4 w-4 mr-1'} />
                {!compact && 'Add'}
              </Button>
            </div>
          </div>
        </GlassCardHeader>

        <GlassCardContent className={compact ? 'pt-3' : 'pt-4'}>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {(compact ? DAYS_SHORT : DAYS).map((day, i) => (
              <div
                key={i}
                className={cn(
                  'text-center font-semibold text-muted-foreground',
                  compact ? 'text-[10px] py-1' : 'text-xs py-2'
                )}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className={cn('grid grid-cols-7', compact ? 'gap-0.5' : 'gap-1')}>
            {calendarDays.map(({ day, date, isCurrentMonth, isToday }, idx) => {
              // Empty cell for days before first of month
              if (day === null || date === null) {
                return <div key={idx} className={compact ? 'aspect-square' : 'min-h-[90px]'} />;
              }

              const dayEvents = getEventsForDate(date);
              const isSelected = date === selectedDate && isSidebarOpen;

              if (compact) {
                return (
                  <button
                    key={idx}
                    onClick={() => handleDayClick(date)}
                    className={cn(
                      'aspect-square rounded-md flex flex-col items-center justify-center transition-all',
                      'hover:bg-primary/10',
                      isSelected && 'bg-primary/20 ring-1 ring-primary',
                      isToday && !isSelected && 'bg-primary/5'
                    )}
                  >
                    <span className={cn(
                      'text-sm font-medium',
                      isToday && 'text-primary font-bold'
                    )}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map((e, i) => (
                          <div
                            key={i}
                            className="w-1 h-1 rounded-full"
                            style={{ backgroundColor: e.color }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleDayClick(date)}
                  className={cn(
                    'min-h-[90px] p-2 rounded-lg text-left transition-all group relative',
                    'hover:bg-muted/50 hover:shadow-sm',
                    isSelected && 'bg-primary/10 ring-2 ring-primary shadow-md',
                    isToday && !isSelected && 'bg-primary/5 ring-1 ring-primary/30'
                  )}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      'w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold transition-colors',
                      isToday && 'bg-primary text-primary-foreground',
                      !isToday && 'group-hover:bg-muted'
                    )}>
                      {day}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddEvent(date);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/20 rounded-md transition-all"
                    >
                      <Plus className="h-3.5 w-3.5 text-primary" />
                    </button>
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="text-[11px] px-1.5 py-0.5 rounded truncate font-medium"
                        style={{
                          backgroundColor: `${event.color}15`,
                          color: event.color,
                          borderLeft: `2px solid ${event.color}`
                        }}
                      >
                        {event.startTime && (
                          <span className="opacity-70 mr-1">{event.startTime.slice(0, 5)}</span>
                        )}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-muted-foreground px-1.5 font-medium">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* Backdrop - closes sidebar when clicked */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 cursor-pointer"
          onClick={closeSidebar}
        />
      )}

      {/* Collapsible Sidebar */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-80 bg-background/95 backdrop-blur-xl border-l border-glass-border z-50 transition-transform duration-300 ease-in-out shadow-2xl',
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >

        <div className="h-full flex flex-col p-4">
          {/* Sidebar header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold">Events</span>
            </div>
            <Button variant="ghost" size="icon" onClick={closeSidebar} title="Close sidebar">
              <PanelRightClose className="h-5 w-5" />
            </Button>
          </div>

          {/* Selected date info */}
          {selectedDate && (
            <div className="mb-4 pb-3 border-b border-glass-border">
              <h3 className="font-semibold text-lg">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </h3>
              <p className="text-xs text-muted-foreground">
                {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Add event button */}
          <Button
            onClick={() => handleAddEvent(selectedDate || today)}
            className="w-full mb-4"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>

          {/* Events list */}
          <ScrollArea className="flex-1">
            <div className="space-y-3 pr-2">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No events scheduled</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Add Event" to create one</p>
                </div>
              ) : (
                selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                    style={{ borderLeft: `3px solid ${event.color}` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">{event.title}</h4>
                          <EventSourceIcon source={event.source} syncStatus={event.syncStatus} />
                        </div>
                        {event.startTime && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {event.startTime}
                            {event.endTime && ` - ${event.endTime}`}
                          </div>
                        )}
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-1.5 hover:bg-muted rounded-md"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1.5 hover:bg-red-500/20 rounded-md text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>


      {/* Calendar Settings Modal */}
      <CalendarSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Event Migration Wizard */}
      <EventMigrationWizard
        isOpen={isMigrationWizardOpen}
        onClose={() => setIsMigrationWizardOpen(false)}
        onComplete={() => {
          setIsMigrationWizardOpen(false);
          // Trigger a sync to get the latest state
          handleSync();
        }}
      />

      {/* Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        event={editingEvent}
        defaultDate={selectedDate || today}
        onSave={(eventData) => {
          if (editingEvent) {
            updateEvent(editingEvent.id, eventData);
          } else {
            addEvent(eventData);
          }
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
      />
    </>
  );
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  defaultDate: string;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
}

function EventModal({ isOpen, onClose, event, defaultDate, onSave }: EventModalProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [date, setDate] = React.useState(defaultDate);
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');
  const [color, setColor] = React.useState(EVENT_COLORS[0].value);

  React.useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setDate(event.date);
      setStartTime(event.startTime || '');
      setEndTime(event.endTime || '');
      setColor(event.color || EVENT_COLORS[0].value);
    } else {
      setTitle('');
      setDescription('');
      setDate(defaultDate);
      setStartTime('09:00');
      setEndTime('10:00');
      setColor(EVENT_COLORS[0].value);
    }
  }, [event, defaultDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      color,
      type: 'event',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass border-glass-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            {event ? 'Edit Event' : 'New Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              placeholder="Event title"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Start</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
              placeholder="Add notes..."
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2 mt-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    color === c.value
                      ? 'ring-2 ring-offset-2 ring-offset-background scale-110'
                      : 'hover:scale-105'
                  )}
                  style={{
                    backgroundColor: c.value,
                    boxShadow: color === c.value ? `0 0 12px ${c.value}50` : undefined
                  }}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {event ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
