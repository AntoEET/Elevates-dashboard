'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useCalendarStore } from '@/store/calendar.store';

interface CalendarSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarSettings({ isOpen, onClose }: CalendarSettingsProps) {
  const {
    googleConnected,
    googleSyncStatus,
    lastSyncTime,
    syncError,
    setGoogleConnected,
    setSyncStatus,
    mergeSyncedEvents,
    setLastSyncTime,
  } = useCalendarStore();

  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Check connection status on mount
  React.useEffect(() => {
    if (isOpen) {
      checkConnectionStatus();
    }
  }, [isOpen]);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/calendar/google/auth/status');
      const data = await response.json();
      setGoogleConnected(data.connected || false);
    } catch (error) {
      console.error('Failed to check connection status:', error);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Use fetch with credentials to ensure cookies are sent
      const response = await fetch('/api/calendar/google/auth/status', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      // Now redirect to OAuth init
      window.location.href = '/api/calendar/google/auth/init';
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnecting(false);
      alert('Please refresh the page and try again. Make sure you are logged in.');
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/calendar/google/auth/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        setGoogleConnected(false);
        setLastSyncTime(null);
        setSyncStatus('idle');
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      alert('Failed to disconnect Google Calendar');
    } finally {
      setIsDisconnecting(false);
    }
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

  const formatLastSyncTime = () => {
    if (!lastSyncTime) return 'Never';

    const syncDate = new Date(lastSyncTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass border-glass-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Calendar Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Connection Status */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Google Calendar</h3>
            <div
              className={`flex items-center gap-2 p-3 rounded-lg border ${
                googleConnected
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-muted/30 border-glass-border'
              }`}
            >
              {googleConnected ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-500">Connected</p>
                    <p className="text-xs text-muted-foreground">
                      Last synced: {formatLastSyncTime()}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Not Connected</p>
                    <p className="text-xs text-muted-foreground">
                      Connect to sync events
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sync Error */}
          {syncError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-500">{syncError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {googleConnected ? (
              <>
                <Button
                  onClick={handleSync}
                  disabled={isSyncing || googleSyncStatus === 'syncing'}
                  className="w-full"
                >
                  {isSyncing || googleSyncStatus === 'syncing' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    'Sync Now'
                  )}
                </Button>
                <Button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  variant="outline"
                  className="w-full"
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    'Disconnect'
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Google Calendar'
                )}
              </Button>
            )}
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-glass-border">
            <p>• Events sync automatically every 30 minutes</p>
            <p>• Changes sync when you create, edit, or delete events</p>
            <p>• Conflicts are resolved automatically (newest wins)</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
