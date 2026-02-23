'use client';

import * as React from 'react';
import { PageHeader, PageContent } from '@/presentation/components/layout/DashboardShell';
import { GlassCard } from '@/presentation/components/glass/GlassCard';
import { Button } from '@/components/ui/button';
import { useProspectStore, type Prospect } from '@/store/prospect.store';
import { ProspectPipeline } from '@/presentation/components/crm/ProspectPipeline';
import { ProspectTable } from '@/presentation/components/crm/ProspectTable';
import { ProspectDetail } from '@/presentation/components/crm/ProspectDetail';
import { CRMAnalytics } from '@/presentation/components/crm/CRMAnalytics';
import { ImportProspects } from '@/presentation/components/crm/ImportProspects';
import {
  LayoutGrid,
  Table,
  Plus,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  BarChart3,
  Upload,
} from 'lucide-react';

export default function CRMPage() {
  const {
    viewMode,
    setViewMode,
    setSelectedProspect,
    selectedProspectId,
    getProspectById,
    addProspect,
    prospects,
    getStageStats,
    getPendingFollowUps,
    getConversionRate,
  } = useProspectStore();

  const [isAddingProspect, setIsAddingProspect] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [selectedProspect, setSelectedProspectState] = React.useState<Prospect | null>(null);

  const stats = getStageStats();
  const pendingFollowUps = getPendingFollowUps();
  const conversionRate = getConversionRate();

  const handleProspectClick = (prospect: Prospect) => {
    setSelectedProspectState(prospect);
  };

  const handleAddProspect = () => {
    setIsAddingProspect(true);
  };

  return (
    <>
      <PageHeader
        title="Prospect CRM"
        description="Manage your sales pipeline from first contact to close"
      />

      <PageContent>
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <GlassCard size="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Prospects</p>
                  <p className="text-2xl font-bold">{prospects.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-50" />
              </div>
            </GlassCard>

            <GlassCard size="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Pipeline</p>
                  <p className="text-2xl font-bold">
                    {prospects.length - stats['closed-won'] - stats['closed-lost']}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </GlassCard>

            <GlassCard size="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Closed Won</p>
                  <p className="text-2xl font-bold">{stats['closed-won']}</p>
                  <p className="text-xs text-emerald-500">{conversionRate.toFixed(1)}% rate</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-50" />
              </div>
            </GlassCard>

            <GlassCard size="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Follow-ups</p>
                  <p className="text-2xl font-bold">{pendingFollowUps.length}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500 opacity-50" />
              </div>
            </GlassCard>
          </div>

          {/* Actions and View Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'pipeline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('pipeline')}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Pipeline
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <Table className="h-4 w-4 mr-2" />
                Table
              </Button>
              <Button
                variant={viewMode === 'analytics' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('analytics')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsImporting(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </Button>
              <Button onClick={handleAddProspect}>
                <Plus className="h-4 w-4 mr-2" />
                Add Prospect
              </Button>
            </div>
          </div>

          {/* Main View */}
          {viewMode === 'pipeline' ? (
            <ProspectPipeline onProspectClick={handleProspectClick} />
          ) : viewMode === 'table' ? (
            <ProspectTable onProspectClick={handleProspectClick} />
          ) : (
            <CRMAnalytics />
          )}
        </div>
      </PageContent>

      {/* Prospect Detail Modal */}
      <ProspectDetail
        prospect={selectedProspect}
        isOpen={selectedProspect !== null}
        onClose={() => setSelectedProspectState(null)}
      />

      {/* Add Prospect Modal */}
      {isAddingProspect && (
        <AddProspectModal
          onAdd={(prospect) => {
            addProspect(prospect);
            setIsAddingProspect(false);
          }}
          onCancel={() => setIsAddingProspect(false)}
        />
      )}

      {/* Import Prospects Modal */}
      <ImportProspects
        isOpen={isImporting}
        onClose={() => setIsImporting(false)}
      />
    </>
  );
}

interface AddProspectModalProps {
  onAdd: (prospect: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function AddProspectModal({ onAdd, onCancel }: AddProspectModalProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    linkedinProfile: '',
    twitterProfile: '',
    instagramProfile: '',
    otherProfile: '',
    source: '',
    tags: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
    dateAdded: new Date().toISOString().split('T')[0],
    accepted: undefined as boolean | undefined,
    firstEmailDate: '',
    followUp1Date: '',
    followUp2Date: '',
    followUp3Date: '',
    followUp4Date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAdd({
      name: formData.name.trim(),
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
      priority: formData.priority,
      notes: formData.notes.trim(),
      stage: 'new-lead',
      dateAdded: formData.dateAdded ? new Date(formData.dateAdded).toISOString() : new Date().toISOString(),
      followUps: [],
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
        <h3 className="font-semibold text-lg mb-4">Add New Prospect</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="John Doe"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Acme Inc"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="john@acme.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="+1 234 567 890"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">LinkedIn Profile</label>
              <input
                type="url"
                value={formData.linkedinProfile}
                onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Twitter Profile</label>
              <input
                type="url"
                value={formData.twitterProfile}
                onChange={(e) => setFormData({ ...formData, twitterProfile: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://twitter.com/johndoe"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Instagram Profile</label>
              <input
                type="url"
                value={formData.instagramProfile}
                onChange={(e) => setFormData({ ...formData, instagramProfile: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://instagram.com/johndoe"
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
              <label className="text-sm font-medium block mb-1.5">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Source</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., LinkedIn, Referral"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="tech, enterprise, warm-lead"
              />
            </div>
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

          <div>
            <label className="text-sm font-medium block mb-1.5">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Any additional information..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Prospect</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
