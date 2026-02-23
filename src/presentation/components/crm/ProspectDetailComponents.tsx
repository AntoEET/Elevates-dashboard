'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useProspectStore, type Prospect, type ProspectStage, type FollowUpType, type FollowUp } from '@/store/prospect.store';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react';

const STAGE_LABELS: Record<ProspectStage, string> = {
  'new-lead': 'New Lead',
  'invited': 'Invited',
  'connected': 'Connected',
  'first-message': 'First Message',
  'follow-up': 'Follow-up',
  'meeting-scheduled': 'Meeting Scheduled',
  'proposal-sent': 'Proposal Sent',
  'closed-won': 'Closed Won',
  'closed-lost': 'Closed Lost',
};

interface StageSelectorProps {
  prospectId: string;
  currentStage: ProspectStage;
}

export function StageSelector({ prospectId, currentStage }: StageSelectorProps) {
  const { moveToStage } = useProspectStore();

  return (
    <select
      value={currentStage}
      onChange={(e) => moveToStage(prospectId, e.target.value as ProspectStage)}
      className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      {Object.entries(STAGE_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

interface PrioritySelectorProps {
  prospectId: string;
  currentPriority: 'low' | 'medium' | 'high';
}

export function PrioritySelector({ prospectId, currentPriority }: PrioritySelectorProps) {
  const { updateProspect } = useProspectStore();

  return (
    <select
      value={currentPriority}
      onChange={(e) => updateProspect(prospectId, { priority: e.target.value as 'low' | 'medium' | 'high' })}
      className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
  );
}

interface FollowUpListProps {
  prospectId: string;
  followUps: FollowUp[];
  onComplete: (prospectId: string, followUpId: string) => void;
  onDelete: (prospectId: string, followUpId: string) => void;
}

export function FollowUpList({ prospectId, followUps, onComplete, onDelete }: FollowUpListProps) {
  if (followUps.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No follow-ups scheduled</p>
        <p className="text-sm mt-1">Click "Add Follow-up" to create one</p>
      </div>
    );
  }

  // Sort by date
  const sortedFollowUps = [...followUps].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedFollowUps.map((followUp) => (
        <div
          key={followUp.id}
          className={cn(
            'p-4 rounded-lg border',
            followUp.completed
              ? 'bg-muted/30 border-glass-border opacity-60'
              : 'bg-muted/50 border-glass-border'
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <button
                onClick={() => !followUp.completed && onComplete(prospectId, followUp.id)}
                className="mt-0.5"
                disabled={followUp.completed}
              >
                {followUp.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                    {followUp.type}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(followUp.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{followUp.notes}</p>
                {followUp.completed && followUp.completedDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Completed on {new Date(followUp.completedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => onDelete(prospectId, followUp.id)}
              className="text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

interface AddFollowUpFormProps {
  prospectId: string;
  onAdd: (followUp: Omit<FollowUp, 'id'>) => void;
  onCancel: () => void;
}

export function AddFollowUpForm({ prospectId, onAdd, onCancel }: AddFollowUpFormProps) {
  const [type, setType] = React.useState<FollowUpType>('email');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    onAdd({
      type,
      date,
      notes: notes.trim(),
      completed: false,
    });

    // Reset form
    setType('email');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass border-glass-border rounded-lg p-6 max-w-md w-full m-4">
        <h3 className="font-semibold text-lg mb-4">Add Follow-up</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as FollowUpType)}
              className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="email">Email</option>
              <option value="phone">Phone Call</option>
              <option value="linkedin">LinkedIn Message</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What do you need to follow up on?"
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Follow-up</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface NotesEditorProps {
  prospectId: string;
  notes: string;
}

export function NotesEditor({ prospectId, notes }: NotesEditorProps) {
  const { updateProspect } = useProspectStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedNotes, setEditedNotes] = React.useState(notes);

  const handleSave = () => {
    updateProspect(prospectId, { notes: editedNotes });
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {isEditing ? (
        <>
          <textarea
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            placeholder="Add notes about this prospect..."
            rows={15}
            className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              Save Notes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditedNotes(notes);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          {notes ? (
            <div className="whitespace-pre-wrap text-sm p-4 bg-muted/30 rounded-lg">
              {notes}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No notes yet</p>
            </div>
          )}
          <Button size="sm" onClick={() => setIsEditing(true)}>
            Edit Notes
          </Button>
        </>
      )}
    </div>
  );
}

interface EditProspectFormProps {
  prospect: Prospect;
  onSave: (updates: Partial<Prospect>) => void;
  onCancel: () => void;
}

export function EditProspectForm({ prospect, onSave, onCancel }: EditProspectFormProps) {
  const [formData, setFormData] = React.useState({
    name: prospect.name,
    company: prospect.company || '',
    email: prospect.email || '',
    phone: prospect.phone || '',
    linkedinProfile: prospect.linkedinProfile || '',
    twitterProfile: prospect.twitterProfile || '',
    instagramProfile: prospect.instagramProfile || '',
    otherProfile: prospect.otherProfile || '',
    source: prospect.source || '',
    tags: prospect.tags.join(', '),
    dateAdded: prospect.dateAdded ? new Date(prospect.dateAdded).toISOString().split('T')[0] : '',
    accepted: prospect.accepted,
    firstEmailDate: prospect.firstEmailDate || '',
    followUp1Date: prospect.followUp1Date || '',
    followUp2Date: prospect.followUp2Date || '',
    followUp3Date: prospect.followUp3Date || '',
    followUp4Date: prospect.followUp4Date || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      name: formData.name,
      company: formData.company || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      linkedinProfile: formData.linkedinProfile || undefined,
      twitterProfile: formData.twitterProfile || undefined,
      instagramProfile: formData.instagramProfile || undefined,
      otherProfile: formData.otherProfile || undefined,
      source: formData.source || undefined,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      dateAdded: formData.dateAdded ? new Date(formData.dateAdded).toISOString() : undefined,
      accepted: formData.accepted,
      firstEmailDate: formData.firstEmailDate || undefined,
      followUp1Date: formData.followUp1Date || undefined,
      followUp2Date: formData.followUp2Date || undefined,
      followUp3Date: formData.followUp3Date || undefined,
      followUp4Date: formData.followUp4Date || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="glass border-glass-border rounded-lg p-6 max-w-2xl w-full my-8">
        <h3 className="font-semibold text-lg mb-4">Edit Prospect</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">LinkedIn Profile</label>
              <input
                type="url"
                value={formData.linkedinProfile}
                onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Twitter Profile</label>
              <input
                type="url"
                value={formData.twitterProfile}
                onChange={(e) => setFormData({ ...formData, twitterProfile: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Instagram Profile</label>
              <input
                type="url"
                value={formData.instagramProfile}
                onChange={(e) => setFormData({ ...formData, instagramProfile: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Other Profile/Website</label>
              <input
                type="url"
                value={formData.otherProfile}
                onChange={(e) => setFormData({ ...formData, otherProfile: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Other website or profile URL"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Source</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., LinkedIn, Referral"
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., tech, enterprise, warm-lead"
              className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Quick Tracking Fields */}
          <div className="border-t border-glass-border pt-4">
            <h4 className="text-sm font-semibold mb-3">Quick Tracking</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Date of Adding</label>
                <input
                  type="date"
                  value={formData.dateAdded}
                  onChange={(e) => setFormData({ ...formData, dateAdded: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Accepted?</label>
                <select
                  value={formData.accepted === undefined ? '' : formData.accepted ? 'yes' : 'no'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accepted: e.target.value === '' ? undefined : e.target.value === 'yes',
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">1st Email Date</label>
                <input
                  type="date"
                  value={formData.firstEmailDate}
                  onChange={(e) => setFormData({ ...formData, firstEmailDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Follow up 1 Date</label>
                <input
                  type="date"
                  value={formData.followUp1Date}
                  onChange={(e) => setFormData({ ...formData, followUp1Date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Follow up 2 Date</label>
                <input
                  type="date"
                  value={formData.followUp2Date}
                  onChange={(e) => setFormData({ ...formData, followUp2Date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Follow up 3 Date</label>
                <input
                  type="date"
                  value={formData.followUp3Date}
                  onChange={(e) => setFormData({ ...formData, followUp3Date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Follow up 4 Date</label>
                <input
                  type="date"
                  value={formData.followUp4Date}
                  onChange={(e) => setFormData({ ...formData, followUp4Date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
