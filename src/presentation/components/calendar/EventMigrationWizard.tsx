'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useCalendarStore, type CalendarEvent } from '@/store/calendar.store';

interface EventMigrationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function EventMigrationWizard({ isOpen, onClose, onComplete }: EventMigrationWizardProps) {
  const { events, updateEvent } = useCalendarStore();
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [uploadedCount, setUploadedCount] = React.useState(0);
  const [failedCount, setFailedCount] = React.useState(0);
  const [completed, setCompleted] = React.useState(false);

  // Get only local events that need to be uploaded
  const localEvents = events.filter((event) => !event.source || event.source === 'local');

  const handleUpload = async () => {
    setIsUploading(true);
    setProgress(0);
    setUploadedCount(0);
    setFailedCount(0);

    const total = localEvents.length;

    for (let i = 0; i < localEvents.length; i++) {
      const event = localEvents[i];

      try {
        const response = await fetch('/api/calendar/google/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });

        const data = await response.json();

        if (data.success) {
          // Update event with Google data
          updateEvent(event.id, {
            googleEventId: data.event.googleEventId,
            googleCalendarId: data.event.googleCalendarId,
            syncStatus: 'synced',
            source: 'google',
            etag: data.event.etag,
          });
          setUploadedCount((prev) => prev + 1);
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      } catch (error) {
        console.error(`Failed to upload event ${event.id}:`, error);
        setFailedCount((prev) => prev + 1);
      }

      // Update progress
      setProgress(((i + 1) / total) * 100);
    }

    setCompleted(true);
    setIsUploading(false);
  };

  const handleClose = () => {
    if (completed) {
      onComplete();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="glass border-glass-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Events to Google Calendar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isUploading && !completed ? (
            // Initial state
            <>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm">
                  You have <strong>{localEvents.length}</strong> local event
                  {localEvents.length !== 1 ? 's' : ''} that can be uploaded to Google Calendar.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  This will sync your existing events to Google Calendar so they're accessible
                  everywhere.
                </p>
              </div>

              {localEvents.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <p className="text-xs font-semibold text-muted-foreground">Events to upload:</p>
                  {localEvents.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="p-2 rounded bg-muted/30 text-xs"
                      style={{ borderLeft: `3px solid ${event.color}` }}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-muted-foreground">{event.date}</div>
                    </div>
                  ))}
                  {localEvents.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center">
                      ... and {localEvents.length - 5} more
                    </div>
                  )}
                </div>
              )}
            </>
          ) : isUploading ? (
            // Uploading state
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading events...</span>
                  <span className="font-semibold">
                    {uploadedCount + failedCount} / {localEvents.length}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Please wait while we upload your events to Google Calendar
              </div>
            </>
          ) : (
            // Completed state
            <>
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                {failedCount === 0 ? (
                  <>
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                    <div className="text-center">
                      <p className="font-semibold">Upload Complete!</p>
                      <p className="text-sm text-muted-foreground">
                        Successfully uploaded {uploadedCount} event{uploadedCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 text-amber-500" />
                    <div className="text-center">
                      <p className="font-semibold">Upload Completed with Errors</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded: {uploadedCount} | Failed: {failedCount}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                Your events are now synced with Google Calendar. Future changes will sync
                automatically.
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!isUploading && !completed ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Skip for Now
              </Button>
              <Button onClick={handleUpload} disabled={localEvents.length === 0}>
                Upload {localEvents.length} Event{localEvents.length !== 1 ? 's' : ''}
              </Button>
            </>
          ) : completed ? (
            <Button onClick={handleClose}>Done</Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
