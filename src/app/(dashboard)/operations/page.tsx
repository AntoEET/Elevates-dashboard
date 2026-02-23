'use client';

import * as React from 'react';
import { PageHeader, PageContent } from '@/presentation/components/layout/DashboardShell';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Zap,
  Bot,
  FileText,
  Cog,
  ExternalLink,
  Plus,
  ChevronDown,
  ChevronRight,
  Clock,
  Trash2,
  Briefcase,
  Wrench,
  Send,
  Database,
  Link2,
  Folder,
  FileCode,
  Users,
  Target,
  BarChart3,
  CircleDot,
  Activity,
  Linkedin,
  Instagram,
  Minus,
  Edit3,
  Check,
  X,
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/shared/lib/utils';

// ============================================
// Types
// ============================================

type SystemStatus = 'green' | 'yellow' | 'red';

interface SystemHealth {
  id: string;
  name: string;
  status: SystemStatus;
  description: string;
  link: string;
  lastChecked: string;
}

interface ContentPipeline {
  platform: 'linkedin' | 'instagram';
  scheduled: number;
  pending: number;
  link: string;
}

interface FrictionLog {
  id: string;
  task: string;
  timestamp: string;
}

interface LogicSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  links: { name: string; url: string; type: 'make' | 'sop' | 'doc' }[];
}

// ============================================
// Mock Data / State (Replace with API later)
// ============================================

const INITIAL_SYSTEMS: SystemHealth[] = [
  {
    id: 'lead-gen',
    name: 'Lead Gen Engine',
    status: 'green',
    description: 'Instantly.ai campaigns running smoothly',
    link: 'https://app.instantly.ai/',
    lastChecked: new Date().toISOString(),
  },
  {
    id: 'scraper',
    name: 'Scraper Status',
    status: 'green',
    description: 'Apify actors running - 1,247 records today',
    link: 'https://console.apify.com/',
    lastChecked: new Date().toISOString(),
  },
];

const INITIAL_CONTENT_PIPELINE: ContentPipeline[] = [
  {
    platform: 'linkedin',
    scheduled: 0,
    pending: 0,
    link: 'https://www.linkedin.com/feed/',
  },
  {
    platform: 'instagram',
    scheduled: 0,
    pending: 0,
    link: 'https://www.instagram.com/',
  },
];

const LOGIC_SECTIONS: LogicSection[] = [
  {
    id: 'onboarding',
    title: 'Onboarding Blueprint',
    icon: <Users className="h-4 w-4" />,
    links: [
      { name: 'Client Welcome Sequence', url: 'https://www.make.com/en/scenarios', type: 'make' },
      { name: 'Account Setup Checklist', url: '#', type: 'sop' },
      { name: 'Data Migration Process', url: '#', type: 'doc' },
    ],
  },
  {
    id: 'reporting',
    title: 'Reporting Automation',
    icon: <BarChart3 className="h-4 w-4" />,
    links: [
      { name: 'Weekly Report Generator', url: 'https://www.make.com/en/scenarios', type: 'make' },
      { name: 'Client Dashboard Sync', url: 'https://www.make.com/en/scenarios', type: 'make' },
      { name: 'KPI Alert System', url: '#', type: 'sop' },
    ],
  },
  {
    id: 'lead-qualification',
    title: 'Lead Qualification Logic',
    icon: <Target className="h-4 w-4" />,
    links: [
      { name: 'Lead Scoring Automation', url: 'https://www.make.com/en/scenarios', type: 'make' },
      { name: 'ICP Matching Rules', url: '#', type: 'sop' },
      { name: 'Qualification Criteria Doc', url: '#', type: 'doc' },
    ],
  },
];

// ============================================
// Main Component
// ============================================

export default function OperationsPage() {
  // System Health State
  const [systems, setSystems] = React.useState<SystemHealth[]>(INITIAL_SYSTEMS);

  // Content Pipeline State - with localStorage persistence
  const [contentPipeline, setContentPipeline] = React.useState<ContentPipeline[]>(INITIAL_CONTENT_PIPELINE);
  const [isContentPipelineLoaded, setIsContentPipelineLoaded] = React.useState(false);

  // Load content pipeline from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('elevates-content-pipeline');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setContentPipeline(parsed);
      } catch (e) {
        console.error('Failed to parse content pipeline from localStorage');
      }
    }
    setIsContentPipelineLoaded(true);
  }, []);

  // Save content pipeline to localStorage when it changes
  React.useEffect(() => {
    if (isContentPipelineLoaded) {
      localStorage.setItem('elevates-content-pipeline', JSON.stringify(contentPipeline));
    }
  }, [contentPipeline, isContentPipelineLoaded]);

  // Friction Logger State - with localStorage persistence
  const [frictionLogs, setFrictionLogs] = React.useState<FrictionLog[]>([]);
  const [newFriction, setNewFriction] = React.useState('');
  const [isFrictionLoaded, setIsFrictionLoaded] = React.useState(false);

  // Load friction logs from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('elevates-friction-logs');
    if (saved) {
      try {
        setFrictionLogs(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse friction logs from localStorage');
      }
    }
    setIsFrictionLoaded(true);
  }, []);

  // Save friction logs to localStorage when they change
  React.useEffect(() => {
    if (isFrictionLoaded) {
      localStorage.setItem('elevates-friction-logs', JSON.stringify(frictionLogs));
    }
  }, [frictionLogs, isFrictionLoaded]);

  // Logic Library State
  const [expandedSections, setExpandedSections] = React.useState<string[]>(['onboarding']);

  // Architect vs CEO Balance State - with localStorage persistence
  const [ceoHours, setCeoHours] = React.useState(0);
  const [architectHours, setArchitectHours] = React.useState(0);
  const [isHoursLoaded, setIsHoursLoaded] = React.useState(false);

  // Load hours from localStorage on mount (resets daily)
  React.useEffect(() => {
    const saved = localStorage.getItem('elevates-work-hours');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const today = new Date().toDateString();
        // Only restore if it's from today
        if (parsed.date === today) {
          setCeoHours(parsed.ceoHours || 0);
          setArchitectHours(parsed.architectHours || 0);
        }
      } catch (e) {
        console.error('Failed to parse work hours from localStorage');
      }
    }
    setIsHoursLoaded(true);
  }, []);

  // Save hours to localStorage when they change
  React.useEffect(() => {
    if (isHoursLoaded) {
      localStorage.setItem('elevates-work-hours', JSON.stringify({
        date: new Date().toDateString(),
        ceoHours,
        architectHours,
      }));
    }
  }, [ceoHours, architectHours, isHoursLoaded]);

  // Content Pipeline Handlers
  const updateContentCount = (
    platform: 'linkedin' | 'instagram',
    field: 'scheduled' | 'pending',
    delta: number
  ) => {
    setContentPipeline((prev) =>
      prev.map((p) =>
        p.platform === platform
          ? { ...p, [field]: Math.max(0, p[field] + delta) }
          : p
      )
    );
  };

  // Handlers
  const handleAddFriction = () => {
    if (!newFriction.trim()) return;
    const newLog: FrictionLog = {
      id: `friction-${Date.now()}`,
      task: newFriction.trim(),
      timestamp: new Date().toISOString(),
    };
    setFrictionLogs((prev) => [newLog, ...prev]);
    setNewFriction('');
  };

  const handleDeleteFriction = (id: string) => {
    setFrictionLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleAddTime = (type: 'ceo' | 'architect', hours: number) => {
    if (type === 'ceo') {
      setCeoHours((prev) => Math.max(0, prev + hours));
    } else {
      setArchitectHours((prev) => Math.max(0, prev + hours));
    }
  };

  const totalHours = ceoHours + architectHours;
  const ceoPercentage = totalHours > 0 ? (ceoHours / totalHours) * 100 : 50;

  // Calculate content pipeline status
  const getContentStatus = (pipeline: ContentPipeline): SystemStatus => {
    const total = pipeline.scheduled + pipeline.pending;
    if (total === 0) return 'red'; // Nothing scheduled
    if (pipeline.pending > pipeline.scheduled) return 'yellow'; // More pending than scheduled
    return 'green'; // Good to go
  };

  return (
    <>
      <PageHeader
        title="Operations Cockpit"
        description="System health, automation workflows, and operational efficiency at a glance"
      />

      <PageContent>
        {/* Top Row: System Health + Friction Logger */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 1. SYSTEM HEALTH MONITOR */}
          <GlassCard size="lg">
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                System Health Monitor
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3">
                {/* Core Systems */}
                {systems.map((system) => (
                  <SystemHealthRow key={system.id} system={system} />
                ))}

                {/* Content Pipeline Section */}
                <div className="pt-3 mt-3 border-t border-glass-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Content Pipeline
                  </p>
                  {contentPipeline.map((pipeline) => (
                    <ContentPipelineRow
                      key={pipeline.platform}
                      pipeline={pipeline}
                      status={getContentStatus(pipeline)}
                      onUpdate={(field, delta) =>
                        updateContentCount(pipeline.platform, field, delta)
                      }
                    />
                  ))}
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* 2. FRICTION LOGGER */}
          <GlassCard size="lg">
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center gap-2">
                <Cog className="h-4 w-4 text-primary" />
                Friction Logger
              </GlassCardTitle>
              <Badge variant="outline" className="text-xs">
                {frictionLogs.length} logged
              </Badge>
            </GlassCardHeader>
            <GlassCardContent>
              {/* Quick Entry */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newFriction}
                  onChange={(e) => setNewFriction(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFriction()}
                  placeholder="Log manual drag..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                />
                <Button size="sm" onClick={handleAddFriction} disabled={!newFriction.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Logged Items */}
              <ScrollArea className="h-[180px]">
                {frictionLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                    <Cog className="h-8 w-8 mb-2 opacity-30" />
                    <p>No friction logged yet</p>
                    <p className="text-xs">Track manual tasks to automate later</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {frictionLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-2 rounded-lg glass-inner group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CircleDot className="h-3 w-3 text-amber-500 flex-shrink-0" />
                          <span className="text-sm truncate">{log.task}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(log.timestamp)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteFriction(log.id)}
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Bottom Row: Logic Library + Architect vs CEO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 3. LOGIC LIBRARY */}
          <GlassCard size="lg">
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Logic Library
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-2">
                {LOGIC_SECTIONS.map((section) => (
                  <LogicSectionAccordion
                    key={section.id}
                    section={section}
                    isExpanded={expandedSections.includes(section.id)}
                    onToggle={() => toggleSection(section.id)}
                  />
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* 4. ARCHITECT VS CEO TOGGLE */}
          <GlassCard size="lg">
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Architect vs CEO Balance
              </GlassCardTitle>
              <span className="text-xs text-muted-foreground">
                {totalHours.toFixed(1)}h total today
              </span>
            </GlassCardHeader>
            <GlassCardContent>
              {/* Balance Meter */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-emerald-500" />
                    <span>Growth (CEO)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Infrastructure (Architect)</span>
                    <Wrench className="h-4 w-4 text-blue-500" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-8 rounded-full bg-muted overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${ceoPercentage}%` }}
                  />
                  <div
                    className="absolute right-0 top-0 h-full bg-gradient-to-l from-blue-500 to-blue-400 transition-all duration-500"
                    style={{ width: `${100 - ceoPercentage}%` }}
                  />
                  {/* Center Marker */}
                  <div className="absolute left-1/2 top-0 h-full w-0.5 bg-white/50 -translate-x-1/2" />
                  {/* Percentage Labels */}
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <span className="text-xs font-bold text-white drop-shadow">
                      {ceoPercentage.toFixed(0)}%
                    </span>
                    <span className="text-xs font-bold text-white drop-shadow">
                      {(100 - ceoPercentage).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Hour Trackers */}
              <div className="grid grid-cols-2 gap-4">
                {/* CEO Hours */}
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="h-5 w-5 text-emerald-500" />
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">CEO Mode</span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-3">
                    {ceoHours.toFixed(1)}h
                  </p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs border-emerald-500/30 hover:bg-emerald-500/10"
                      onClick={() => handleAddTime('ceo', 0.5)}
                    >
                      +30m
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs border-emerald-500/30 hover:bg-emerald-500/10"
                      onClick={() => handleAddTime('ceo', 1)}
                    >
                      +1h
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-emerald-500/30 hover:bg-emerald-500/10"
                      onClick={() => handleAddTime('ceo', -0.5)}
                    >
                      -
                    </Button>
                  </div>
                </div>

                {/* Architect Hours */}
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Wrench className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-blue-600 dark:text-blue-400">Architect Mode</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                    {architectHours.toFixed(1)}h
                  </p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs border-blue-500/30 hover:bg-blue-500/10"
                      onClick={() => handleAddTime('architect', 0.5)}
                    >
                      +30m
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs border-blue-500/30 hover:bg-blue-500/10"
                      onClick={() => handleAddTime('architect', 1)}
                    >
                      +1h
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-blue-500/30 hover:bg-blue-500/10"
                      onClick={() => handleAddTime('architect', -0.5)}
                    >
                      -
                    </Button>
                  </div>
                </div>
              </div>

              {/* Balance Recommendation */}
              <div className="mt-4 p-3 rounded-lg glass-inner">
                <p className="text-xs text-muted-foreground">
                  {ceoPercentage > 60 ? (
                    <span className="text-emerald-500">Growth-focused day - building the business</span>
                  ) : ceoPercentage < 40 ? (
                    <span className="text-blue-500">Infrastructure day - building systems</span>
                  ) : (
                    <span className="text-primary">Balanced day - healthy mix of growth and systems</span>
                  )}
                </p>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </PageContent>
    </>
  );
}

// ============================================
// Sub-Components
// ============================================

function SystemHealthRow({ system }: { system: SystemHealth }) {
  const statusConfig = {
    green: {
      color: 'bg-emerald-500',
      glow: 'shadow-emerald-500/50',
      text: 'text-emerald-500',
      label: 'Operational',
    },
    yellow: {
      color: 'bg-amber-500',
      glow: 'shadow-amber-500/50',
      text: 'text-amber-500',
      label: 'Attention',
    },
    red: {
      color: 'bg-red-500',
      glow: 'shadow-red-500/50',
      text: 'text-red-500',
      label: 'Critical',
    },
  };

  const config = statusConfig[system.status];

  return (
    <a
      href={system.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 rounded-lg glass-inner hover:bg-muted/30 transition-colors group"
    >
      <div className="flex items-center gap-3">
        {/* Traffic Light */}
        <div className="relative">
          <div
            className={cn(
              'w-4 h-4 rounded-full shadow-lg animate-pulse',
              config.color,
              config.glow
            )}
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{system.name}</span>
            <Badge variant="outline" className={cn('text-[10px]', config.text)}>
              {config.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{system.description}</p>
        </div>
      </div>

      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

function ContentPipelineRow({
  pipeline,
  status,
  onUpdate,
}: {
  pipeline: ContentPipeline;
  status: SystemStatus;
  onUpdate: (field: 'scheduled' | 'pending', delta: number) => void;
}) {
  const platformConfig = {
    linkedin: {
      icon: <Linkedin className="h-4 w-4" />,
      name: 'LinkedIn',
      color: 'text-[#0A66C2]',
    },
    instagram: {
      icon: <Instagram className="h-4 w-4" />,
      name: 'Instagram',
      color: 'text-[#E4405F]',
    },
  };

  const statusConfig = {
    green: { color: 'bg-emerald-500', glow: 'shadow-emerald-500/50' },
    yellow: { color: 'bg-amber-500', glow: 'shadow-amber-500/50' },
    red: { color: 'bg-red-500', glow: 'shadow-red-500/50' },
  };

  const config = platformConfig[pipeline.platform];
  const statusStyle = statusConfig[status];

  return (
    <div className="p-3 rounded-lg glass-inner mb-2">
      {/* Top Row: Platform + Status */}
      <div className="flex items-center justify-between mb-3">
        <a
          href={pipeline.link}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('flex items-center gap-2 hover:opacity-80 transition-opacity', config.color)}
        >
          {config.icon}
          <span className="font-medium text-sm">{config.name}</span>
          <ExternalLink className="h-3 w-3 opacity-50" />
        </a>
        <div
          className={cn(
            'w-3 h-3 rounded-full shadow-lg',
            statusStyle.color,
            statusStyle.glow,
            status !== 'green' && 'animate-pulse'
          )}
        />
      </div>

      {/* Bottom Row: Counters */}
      <div className="grid grid-cols-2 gap-2">
        {/* Scheduled */}
        <div className="flex items-center justify-between p-2 rounded-md bg-emerald-500/10">
          <span className="text-xs text-emerald-600 dark:text-emerald-400">Scheduled</span>
          <div className="flex items-center gap-1">
            <button
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
              onClick={() => onUpdate('scheduled', -1)}
            >
              <Minus className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            </button>
            <span className="w-5 text-center font-bold text-sm text-emerald-600 dark:text-emerald-400">
              {pipeline.scheduled}
            </span>
            <button
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
              onClick={() => onUpdate('scheduled', 1)}
            >
              <Plus className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Pending */}
        <div className="flex items-center justify-between p-2 rounded-md bg-amber-500/10">
          <span className="text-xs text-amber-600 dark:text-amber-400">Pending</span>
          <div className="flex items-center gap-1">
            <button
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-amber-500/20 transition-colors"
              onClick={() => onUpdate('pending', -1)}
            >
              <Minus className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            </button>
            <span className="w-5 text-center font-bold text-sm text-amber-600 dark:text-amber-400">
              {pipeline.pending}
            </span>
            <button
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-amber-500/20 transition-colors"
              onClick={() => onUpdate('pending', 1)}
            >
              <Plus className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogicSectionAccordion({
  section,
  isExpanded,
  onToggle,
}: {
  section: LogicSection;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const typeConfig = {
    make: { icon: <Zap className="h-3 w-3" />, color: 'text-purple-500', label: 'Make.com' },
    sop: { icon: <FileText className="h-3 w-3" />, color: 'text-blue-500', label: 'SOP' },
    doc: { icon: <FileCode className="h-3 w-3" />, color: 'text-emerald-500', label: 'Doc' },
  };

  return (
    <div className="rounded-lg glass-inner overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Folder className={cn('h-4 w-4', isExpanded ? 'text-primary' : 'text-muted-foreground')} />
          <span className="font-medium text-sm">{section.title}</span>
          <Badge variant="secondary" className="text-[10px]">
            {section.links.length}
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-1">
          {section.links.map((link, index) => {
            const config = typeConfig[link.type];
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Link2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{link.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('text-[10px]', config.color)}>
                    {config.icon}
                    <span className="ml-1">{config.label}</span>
                  </Badge>
                  <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
