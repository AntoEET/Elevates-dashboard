'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useProspectStore, type Prospect, type ProspectStage } from '@/store/prospect.store';
import { GlassCard } from '@/presentation/components/glass/GlassCard';
import {
  UserPlus,
  Send,
  Handshake,
  MessageSquare,
  Phone,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const STAGE_CONFIG: Record<ProspectStage, { label: string; icon: React.ElementType; color: string }> = {
  'new-lead': { label: 'New Lead', icon: UserPlus, color: 'bg-slate-500' },
  'invited': { label: 'Invited', icon: Send, color: 'bg-blue-500' },
  'connected': { label: 'Connected', icon: Handshake, color: 'bg-cyan-500' },
  'first-message': { label: 'First Message', icon: MessageSquare, color: 'bg-indigo-500' },
  'follow-up': { label: 'Follow-up', icon: Phone, color: 'bg-purple-500' },
  'meeting-scheduled': { label: 'Meeting Scheduled', icon: Calendar, color: 'bg-amber-500' },
  'proposal-sent': { label: 'Proposal Sent', icon: FileText, color: 'bg-orange-500' },
  'closed-won': { label: 'Closed Won', icon: CheckCircle2, color: 'bg-emerald-500' },
  'closed-lost': { label: 'Closed Lost', icon: XCircle, color: 'bg-red-500' },
};

interface ProspectPipelineProps {
  onProspectClick: (prospect: Prospect) => void;
}

export function ProspectPipeline({ onProspectClick }: ProspectPipelineProps) {
  const { getProspectsByStage, moveToStage } = useProspectStore();
  const [draggedProspect, setDraggedProspect] = React.useState<Prospect | null>(null);

  const handleDragStart = (prospect: Prospect) => {
    setDraggedProspect(prospect);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stage: ProspectStage) => {
    if (draggedProspect) {
      moveToStage(draggedProspect.id, stage);
      setDraggedProspect(null);
    }
  };

  const stages: ProspectStage[] = [
    'new-lead',
    'invited',
    'connected',
    'first-message',
    'follow-up',
    'meeting-scheduled',
    'proposal-sent',
    'closed-won',
    'closed-lost',
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const config = STAGE_CONFIG[stage];
        const prospects = getProspectsByStage(stage);
        const Icon = config.icon;

        return (
          <div
            key={stage}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(stage)}
          >
            {/* Stage Header */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('w-2 h-2 rounded-full', config.color)} />
                <h3 className="font-semibold text-sm">{config.label}</h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  {prospects.length}
                </span>
              </div>
            </div>

            {/* Prospects in this stage */}
            <div className="space-y-2 min-h-[200px]">
              {prospects.length === 0 ? (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-glass-border rounded-lg text-muted-foreground text-xs">
                  Drop here
                </div>
              ) : (
                prospects.map((prospect) => (
                  <ProspectCard
                    key={prospect.id}
                    prospect={prospect}
                    onDragStart={handleDragStart}
                    onClick={() => onProspectClick(prospect)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ProspectCardProps {
  prospect: Prospect;
  onDragStart: (prospect: Prospect) => void;
  onClick: () => void;
}

function ProspectCard({ prospect, onDragStart, onClick }: ProspectCardProps) {
  const pendingFollowUps = prospect.followUps.filter((fu) => !fu.completed).length;

  const priorityColor = {
    low: 'border-l-slate-400',
    medium: 'border-l-amber-400',
    high: 'border-l-red-400',
  };

  return (
    <GlassCard
      size="sm"
      draggable
      onDragStart={() => onDragStart(prospect)}
      onClick={onClick}
      className={cn(
        'cursor-pointer hover:shadow-lg transition-all border-l-4',
        priorityColor[prospect.priority]
      )}
    >
      <div className="space-y-2">
        {/* Name and Company */}
        <div>
          <h4 className="font-semibold text-sm">{prospect.name}</h4>
          {prospect.company && (
            <p className="text-xs text-muted-foreground">{prospect.company}</p>
          )}
        </div>

        {/* Contact Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {prospect.email && (
            <span className="truncate">{prospect.email}</span>
          )}
        </div>

        {/* Tags */}
        {prospect.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {prospect.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {prospect.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{prospect.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Follow-ups indicator */}
        {pendingFollowUps > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <Phone className="h-3 w-3" />
            <span>{pendingFollowUps} pending follow-up{pendingFollowUps > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Date added */}
        <div className="text-xs text-muted-foreground pt-1 border-t border-glass-border">
          Added {new Date(prospect.dateAdded).toLocaleDateString()}
        </div>
      </div>
    </GlassCard>
  );
}
