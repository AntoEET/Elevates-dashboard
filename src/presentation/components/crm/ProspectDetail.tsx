'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useProspectStore, type Prospect, type ProspectStage, type FollowUpType } from '@/store/prospect.store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Building2,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  Calendar,
  Tag,
  Flag,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  X,
} from 'lucide-react';

interface ProspectDetailProps {
  prospect: Prospect | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProspectDetail({ prospect, isOpen, onClose }: ProspectDetailProps) {
  const { updateProspect, deleteProspect, addFollowUp, completeFollowUp, deleteFollowUp } = useProspectStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isAddingFollowUp, setIsAddingFollowUp] = React.useState(false);

  if (!prospect) return null;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${prospect.name}?`)) {
      deleteProspect(prospect.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass border-glass-border max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{prospect.name}</DialogTitle>
              {prospect.company && (
                <p className="text-muted-foreground mt-1">{prospect.company}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="followups">
              Follow-ups ({prospect.followUps.length}/5)
            </TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              {/* Contact Information */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </h3>
                <div className="space-y-2 pl-6">
                  {prospect.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${prospect.email}`} className="text-primary hover:underline">
                        {prospect.email}
                      </a>
                    </div>
                  )}
                  {prospect.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${prospect.phone}`} className="text-primary hover:underline">
                        {prospect.phone}
                      </a>
                    </div>
                  )}
                  {prospect.linkedinProfile && (
                    <div className="flex items-center gap-2 text-sm">
                      <Linkedin className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={prospect.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {prospect.twitterProfile && (
                    <div className="flex items-center gap-2 text-sm">
                      <Twitter className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={prospect.twitterProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Twitter Profile
                      </a>
                    </div>
                  )}
                  {prospect.instagramProfile && (
                    <div className="flex items-center gap-2 text-sm">
                      <Instagram className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={prospect.instagramProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Instagram Profile
                      </a>
                    </div>
                  )}
                  {prospect.otherProfile && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={prospect.otherProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Other Profile/Website
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Pipeline Stage */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Pipeline Stage
                </h3>
                <div className="pl-6">
                  <StageSelector prospectId={prospect.id} currentStage={prospect.stage} />
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-sm">Priority</h3>
                <div className="pl-6">
                  <PrioritySelector prospectId={prospect.id} currentPriority={prospect.priority} />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="pl-6 flex flex-wrap gap-2">
                  {prospect.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                  {prospect.tags.length === 0 && (
                    <p className="text-sm text-muted-foreground">No tags</p>
                  )}
                </div>
              </div>

              {/* Quick Tracking */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Quick Tracking
                </h3>
                <div className="pl-6 space-y-3">
                  {/* Accepted Status */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-sm">Accepted?</span>
                    <div className="flex items-center gap-2">
                      {prospect.accepted !== undefined ? (
                        prospect.accepted ? (
                          <span className="text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Circle className="h-4 w-4" />
                            No
                          </span>
                        )
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>

                  {/* First Email Date */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-sm">1st Email</span>
                    <span className="text-sm text-muted-foreground">
                      {prospect.firstEmailDate
                        ? new Date(prospect.firstEmailDate).toLocaleDateString()
                        : '-'}
                    </span>
                  </div>

                  {/* Follow-up Dates */}
                  {[1, 2, 3, 4].map((num) => {
                    const dateKey = `followUp${num}Date` as keyof Prospect;
                    const date = prospect[dateKey] as string | undefined;
                    return (
                      <div key={num} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="text-sm">Follow up {num}</span>
                        <span className="text-sm text-muted-foreground">
                          {date ? new Date(date).toLocaleDateString() : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </h3>
                <div className="pl-6 space-y-2 text-sm">
                  <div>Added: {new Date(prospect.dateAdded).toLocaleDateString()}</div>
                  {prospect.dateInvited && (
                    <div>Invited: {new Date(prospect.dateInvited).toLocaleDateString()}</div>
                  )}
                  {prospect.dateConnected && (
                    <div>Connected: {new Date(prospect.dateConnected).toLocaleDateString()}</div>
                  )}
                  {prospect.dateFirstMessage && (
                    <div>First Message: {new Date(prospect.dateFirstMessage).toLocaleDateString()}</div>
                  )}
                  {prospect.dateMeetingScheduled && (
                    <div>Meeting Scheduled: {new Date(prospect.dateMeetingScheduled).toLocaleDateString()}</div>
                  )}
                  {prospect.dateProposalSent && (
                    <div>Proposal Sent: {new Date(prospect.dateProposalSent).toLocaleDateString()}</div>
                  )}
                  {prospect.dateClosed && (
                    <div>Closed: {new Date(prospect.dateClosed).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Follow-ups Tab */}
          <TabsContent value="followups" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {prospect.followUps.length} of 5 follow-ups used
              </p>
              <Button
                size="sm"
                onClick={() => setIsAddingFollowUp(true)}
                disabled={prospect.followUps.length >= 5}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Follow-up
              </Button>
            </div>

            <ScrollArea className="h-[500px]">
              <FollowUpList
                prospectId={prospect.id}
                followUps={prospect.followUps}
                onComplete={completeFollowUp}
                onDelete={deleteFollowUp}
              />
            </ScrollArea>

            {isAddingFollowUp && (
              <AddFollowUpForm
                prospectId={prospect.id}
                onAdd={(followUp) => {
                  addFollowUp(prospect.id, followUp);
                  setIsAddingFollowUp(false);
                }}
                onCancel={() => setIsAddingFollowUp(false)}
              />
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <ScrollArea className="h-[500px]">
              <NotesEditor prospectId={prospect.id} notes={prospect.notes} />
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {isEditing && (
          <EditProspectForm
            prospect={prospect}
            onSave={(updates) => {
              updateProspect(prospect.id, updates);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

import {
  StageSelector,
  PrioritySelector,
  FollowUpList,
  AddFollowUpForm,
  NotesEditor,
  EditProspectForm,
} from './ProspectDetailComponents';
