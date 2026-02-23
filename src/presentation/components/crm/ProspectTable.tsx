'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useProspectStore, type Prospect, type ProspectStage } from '@/store/prospect.store';
import { GlassCard } from '@/presentation/components/glass/GlassCard';
import { Button } from '@/components/ui/button';
import {
  ArrowUpDown,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Instagram,
  ExternalLink,
  Filter,
} from 'lucide-react';

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

interface ProspectTableProps {
  onProspectClick: (prospect: Prospect) => void;
}

export function ProspectTable({ onProspectClick }: ProspectTableProps) {
  const { getFilteredProspects, setSearchQuery, setFilterStage, setFilterPriority, filterStage, filterPriority } = useProspectStore();
  const [sortBy, setSortBy] = React.useState<keyof Prospect>('dateAdded');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  const prospects = getFilteredProspects();

  // Sort prospects
  const sortedProspects = React.useMemo(() => {
    return [...prospects].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }, [prospects, sortBy, sortOrder]);

  const handleSort = (column: keyof Prospect) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    const config = {
      low: 'bg-slate-500/10 text-slate-500',
      medium: 'bg-amber-500/10 text-amber-500',
      high: 'bg-red-500/10 text-red-500',
    };

    return (
      <span className={cn('px-2 py-1 rounded text-xs font-medium', config[priority])}>
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <GlassCard size="sm">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />

          {/* Stage Filter */}
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value as ProspectStage | 'all')}
            className="px-3 py-1.5 rounded-lg bg-muted/50 border border-glass-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Stages</option>
            {Object.entries(STAGE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as 'all' | 'low' | 'medium' | 'high')}
            className="px-3 py-1.5 rounded-lg bg-muted/50 border border-glass-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Search prospects..."
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg bg-muted/50 border border-glass-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          <span className="ml-auto text-sm text-muted-foreground">
            {sortedProspects.length} prospect{sortedProspects.length !== 1 ? 's' : ''}
          </span>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard size="md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-glass-border">
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-sm font-semibold hover:text-primary"
                  >
                    Name
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Company</th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('stage')}
                    className="flex items-center gap-1 text-sm font-semibold hover:text-primary"
                  >
                    Stage
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Contact</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Follow-ups</th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('priority')}
                    className="flex items-center gap-1 text-sm font-semibold hover:text-primary"
                  >
                    Priority
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('dateAdded')}
                    className="flex items-center gap-1 text-sm font-semibold hover:text-primary"
                  >
                    Date Added
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedProspects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    No prospects found
                  </td>
                </tr>
              ) : (
                sortedProspects.map((prospect) => {
                  const pendingFollowUps = prospect.followUps.filter((fu) => !fu.completed).length;

                  return (
                    <tr
                      key={prospect.id}
                      onClick={() => onProspectClick(prospect)}
                      className="border-b border-glass-border hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-sm">{prospect.name}</div>
                        {prospect.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {prospect.tags.slice(0, 2).map((tag, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {prospect.company || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-muted/50 rounded text-xs">
                          {STAGE_LABELS[prospect.stage]}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {prospect.email && (
                            <a
                              href={`mailto:${prospect.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          )}
                          {prospect.phone && (
                            <a
                              href={`tel:${prospect.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Phone className="h-4 w-4" />
                            </a>
                          )}
                          {prospect.linkedinProfile && (
                            <a
                              href={prospect.linkedinProfile}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {pendingFollowUps > 0 ? (
                          <span className="text-sm text-amber-500">
                            {pendingFollowUps} pending
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getPriorityBadge(prospect.priority)}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(prospect.dateAdded).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
