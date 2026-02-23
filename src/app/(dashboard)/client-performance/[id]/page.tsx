'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader, PageContent } from '@/presentation/components/layout/DashboardShell';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import { StatusBadge } from '@/presentation/components/data-display/StatusBadge';
import { ActivityTimeline } from '@/presentation/components/clients/ActivityTimeline';
import { ClientFormModal } from '@/presentation/components/clients/ClientFormModal';
import { TaskFormModal } from '@/presentation/components/clients/TaskFormModal';
import { NoteFormModal } from '@/presentation/components/clients/NoteFormModal';
import { DocumentFormModal } from '@/presentation/components/clients/DocumentFormModal';
import { useClientPortfolioStore } from '@/store/client-portfolio.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  Mail,
  Phone,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  FileText,
  CheckSquare,
  StickyNote,
  Plus,
  Clock,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime, cn } from '@/shared/lib/utils';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type {
  ClientTask,
  ClientNote,
  ClientDocument,
  TaskStatus,
  TaskPriority,
  NoteCategory,
} from '@/shared/schemas/client-portfolio';

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  high: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const statusColors: Record<TaskStatus, string> = {
  pending: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  'in-progress': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const categoryColors: Record<NoteCategory, string> = {
  general: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  issue: 'bg-red-500/10 text-red-500 border-red-500/20',
  opportunity: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  feedback: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

const documentTypeColors: Record<string, string> = {
  contract: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  proposal: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  report: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  presentation: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  other: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const {
    selectedClient,
    isLoadingClient,
    clientError,
    tasks,
    isLoadingTasks,
    notes,
    isLoadingNotes,
    documents,
    isLoadingDocuments,
    activities,
    isLoadingActivities,
    isFormModalOpen,
    formModalMode,
    isTaskModalOpen,
    taskModalMode,
    selectedTask,
    isNoteModalOpen,
    selectedNote,
    fetchClientById,
    fetchTasks,
    fetchNotes,
    fetchDocuments,
    fetchActivities,
    deleteClient,
    deleteTask,
    openClientFormModal,
    closeClientFormModal,
    openTaskModal,
    closeTaskModal,
    openNoteModal,
    closeNoteModal,
    getFilteredTasks,
    setTaskFilters,
    taskFilters,
  } = useClientPortfolioStore();

  const [isDocumentModalOpen, setIsDocumentModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('overview');

  // Fetch client data on mount
  React.useEffect(() => {
    if (clientId) {
      fetchClientById(clientId);
    }
  }, [clientId, fetchClientById]);

  // Fetch sub-resources when client is loaded
  React.useEffect(() => {
    if (selectedClient && clientId) {
      fetchTasks(clientId);
      fetchNotes(clientId);
      fetchDocuments(clientId);
      fetchActivities(clientId);
    }
  }, [selectedClient, clientId, fetchTasks, fetchNotes, fetchDocuments, fetchActivities]);

  const handleDeleteClient = async () => {
    if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      const success = await deleteClient(clientId);
      if (success) {
        router.push('/client-performance');
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(clientId, taskId);
    }
  };

  const filteredTasks = getFilteredTasks();

  // Generate mock performance data for charts
  const performanceData = React.useMemo(() => {
    if (!selectedClient) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, i) => ({
      month,
      roi: (selectedClient.financials.roi || 0) - 20 + Math.random() * 40,
      healthScore: (selectedClient.financials.healthScore || 0) - 10 + Math.random() * 20,
    }));
  }, [selectedClient]);

  if (isLoadingClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (clientError || !selectedClient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-semibold mb-2">Client Not Found</h2>
        <p className="text-muted-foreground mb-4">
          {clientError || 'The requested client could not be found.'}
        </p>
        <Button onClick={() => router.push('/client-performance')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={selectedClient.name}
        description={`${selectedClient.tier.charAt(0).toUpperCase() + selectedClient.tier.slice(1)} - ${selectedClient.industry}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/client-performance')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" size="sm" onClick={() => openClientFormModal('edit')}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={handleDeleteClient}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />

      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client Info */}
                  <GlassCard size="md">
                    <GlassCardHeader>
                      <GlassCardTitle className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Client Info
                      </GlassCardTitle>
                    </GlassCardHeader>
                    <GlassCardContent>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <span className="text-xl font-bold text-primary">
                            {selectedClient.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{selectedClient.name}</h3>
                          <p className="text-sm text-muted-foreground">{selectedClient.industry}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{selectedClient.tier}</Badge>
                            <StatusBadge status={selectedClient.contractHealth} size="sm" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedClient.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </GlassCardContent>
                  </GlassCard>

                  {/* Contact Info */}
                  <GlassCard size="md">
                    <GlassCardHeader>
                      <GlassCardTitle className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Contact
                      </GlassCardTitle>
                    </GlassCardHeader>
                    <GlassCardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{selectedClient.contact.name}</p>
                            {selectedClient.contact.role && (
                              <p className="text-xs text-muted-foreground">{selectedClient.contact.role}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${selectedClient.contact.email}`} className="text-sm hover:text-primary">
                            {selectedClient.contact.email}
                          </a>
                        </div>
                        {selectedClient.contact.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${selectedClient.contact.phone}`} className="text-sm hover:text-primary">
                              {selectedClient.contact.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </GlassCardContent>
                  </GlassCard>

                  {/* Contract Info */}
                  <GlassCard size="md">
                    <GlassCardHeader>
                      <GlassCardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Contract
                      </GlassCardTitle>
                    </GlassCardHeader>
                    <GlassCardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Value</span>
                          <span className="font-semibold">{formatCurrency(selectedClient.contract.value)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Start Date</span>
                          <span className="text-sm">{formatDate(selectedClient.contract.startDate)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">End Date</span>
                          <span className="text-sm">{formatDate(selectedClient.contract.endDate)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge variant={selectedClient.contract.status === 'active' ? 'default' : 'secondary'}>
                            {selectedClient.contract.status}
                          </Badge>
                        </div>
                      </div>
                    </GlassCardContent>
                  </GlassCard>

                  {/* Metrics Summary */}
                  <GlassCard size="md">
                    <GlassCardHeader>
                      <GlassCardTitle className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Metrics
                      </GlassCardTitle>
                    </GlassCardHeader>
                    <GlassCardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">ARR</p>
                          <p className="text-lg font-bold">{formatCurrency(selectedClient.financials.arr, { compact: true })}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">ROI</p>
                          <p className={cn('text-lg font-bold', (selectedClient.financials.roi || 0) >= 200 ? 'text-emerald-500' : '')}>
                            {selectedClient.financials.roi?.toFixed(1) || 0}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">NRR</p>
                          <p className="text-lg font-bold">{selectedClient.financials.nrr}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Health Score</p>
                          <p className={cn(
                            'text-lg font-bold',
                            selectedClient.financials.healthScore >= 80 ? 'text-emerald-500' :
                            selectedClient.financials.healthScore >= 60 ? 'text-amber-500' : 'text-red-500'
                          )}>
                            {selectedClient.financials.healthScore}%
                          </p>
                        </div>
                      </div>
                    </GlassCardContent>
                  </GlassCard>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance">
                <div className="space-y-6">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <GlassCard size="md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <DollarSign className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">ARR</p>
                          <p className="text-xl font-bold">{formatCurrency(selectedClient.financials.arr, { compact: true })}</p>
                        </div>
                      </div>
                    </GlassCard>
                    <GlassCard size="md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <TrendingUp className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">ROI</p>
                          <p className="text-xl font-bold">{selectedClient.financials.roi?.toFixed(1) || 0}%</p>
                        </div>
                      </div>
                    </GlassCard>
                    <GlassCard size="md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Activity className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">NRR</p>
                          <p className="text-xl font-bold">{selectedClient.financials.nrr}%</p>
                        </div>
                      </div>
                    </GlassCard>
                    <GlassCard size="md">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'p-2 rounded-lg',
                          selectedClient.financials.healthScore >= 80 ? 'bg-emerald-500/10' :
                          selectedClient.financials.healthScore >= 60 ? 'bg-amber-500/10' : 'bg-red-500/10'
                        )}>
                          <Activity className={cn(
                            'h-5 w-5',
                            selectedClient.financials.healthScore >= 80 ? 'text-emerald-500' :
                            selectedClient.financials.healthScore >= 60 ? 'text-amber-500' : 'text-red-500'
                          )} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Health</p>
                          <p className="text-xl font-bold">{selectedClient.financials.healthScore}%</p>
                        </div>
                      </div>
                    </GlassCard>
                  </div>

                  {/* ROI Breakdown Card */}
                  <GlassCard size="md">
                    <GlassCardHeader>
                      <GlassCardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        ROI Calculation Breakdown
                      </GlassCardTitle>
                    </GlassCardHeader>
                    <GlassCardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Revenue Generated</p>
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(selectedClient.financials.revenueGenerated || 0)}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-xs text-red-600 dark:text-red-400 mb-1">Total Investment</p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-400">
                              {formatCurrency(selectedClient.financials.totalInvestment || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/50 border border-glass-border">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">Net Profit</p>
                            <p className="font-semibold">
                              {formatCurrency((selectedClient.financials.revenueGenerated || 0) - (selectedClient.financials.totalInvestment || 0))}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-glass-border">
                            <p className="text-sm font-medium">ROI</p>
                            <p className={cn(
                              'text-2xl font-bold',
                              (selectedClient.financials.roi || 0) >= 200 ? 'text-emerald-500' :
                              (selectedClient.financials.roi || 0) >= 100 ? 'text-blue-500' :
                              (selectedClient.financials.roi || 0) >= 0 ? 'text-amber-500' : 'text-red-500'
                            )}>
                              {selectedClient.financials.roi?.toFixed(1) || 0}%
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground text-center">
                          Formula: ((Revenue - Investment) / Investment) × 100
                        </p>
                      </div>
                    </GlassCardContent>
                  </GlassCard>

                  {/* Performance Chart */}
                  <GlassCard size="lg">
                    <GlassCardHeader>
                      <GlassCardTitle>Performance Trends</GlassCardTitle>
                    </GlassCardHeader>
                    <GlassCardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                            <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                background: 'var(--glass-bg)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="roi"
                              stroke="#10B981"
                              strokeWidth={2}
                              dot={{ fill: '#10B981' }}
                              name="ROI %"
                            />
                            <Line
                              type="monotone"
                              dataKey="healthScore"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              dot={{ fill: '#3B82F6' }}
                              name="Health Score"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </GlassCardContent>
                  </GlassCard>
                </div>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks">
                <GlassCard size="lg">
                  <GlassCardHeader>
                    <GlassCardTitle className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      Tasks ({filteredTasks.length})
                    </GlassCardTitle>
                    <div className="flex items-center gap-2">
                      <select
                        className="text-xs px-2 py-1 rounded-md bg-muted/50 border border-glass-border"
                        value={taskFilters.status}
                        onChange={(e) => setTaskFilters({ status: e.target.value as TaskStatus | 'all' })}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <select
                        className="text-xs px-2 py-1 rounded-md bg-muted/50 border border-glass-border"
                        value={taskFilters.priority}
                        onChange={(e) => setTaskFilters({ priority: e.target.value as TaskPriority | 'all' })}
                      >
                        <option value="all">All Priority</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <Button size="sm" onClick={() => openTaskModal('create')}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Task
                      </Button>
                    </div>
                  </GlassCardHeader>
                  <GlassCardContent>
                    {isLoadingTasks ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : filteredTasks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No tasks found</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2">
                          {filteredTasks.map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onEdit={() => openTaskModal('edit', task)}
                              onDelete={() => handleDeleteTask(task.id)}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </GlassCardContent>
                </GlassCard>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes">
                <GlassCard size="lg">
                  <GlassCardHeader>
                    <GlassCardTitle className="flex items-center gap-2">
                      <StickyNote className="h-4 w-4" />
                      Notes ({notes.length})
                    </GlassCardTitle>
                    <Button size="sm" onClick={() => openNoteModal()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Note
                    </Button>
                  </GlassCardHeader>
                  <GlassCardContent>
                    {isLoadingNotes ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : notes.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No notes yet</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-3">
                          {notes.map((note) => (
                            <NoteItem
                              key={note.id}
                              note={note}
                              onClick={() => openNoteModal(note)}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </GlassCardContent>
                </GlassCard>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents">
                <GlassCard size="lg">
                  <GlassCardHeader>
                    <GlassCardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documents ({documents.length})
                    </GlassCardTitle>
                    <Button size="sm" onClick={() => setIsDocumentModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Document
                    </Button>
                  </GlassCardHeader>
                  <GlassCardContent>
                    {isLoadingDocuments ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : documents.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No documents yet</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2">
                          {documents.map((doc) => (
                            <DocumentItem key={doc.id} document={doc} />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </GlassCardContent>
                </GlassCard>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Activity Timeline */}
          <div className="lg:col-span-1">
            <GlassCard size="md" className="sticky top-6">
              <GlassCardHeader>
                <GlassCardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Activity
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                {isLoadingActivities ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No activity recorded
                  </div>
                ) : (
                  <ActivityTimeline activities={activities.slice(0, 10)} />
                )}
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </PageContent>

      {/* Modals */}
      <ClientFormModal
        open={isFormModalOpen}
        mode={formModalMode}
        client={formModalMode === 'edit' ? selectedClient : undefined}
        onClose={closeClientFormModal}
      />

      <TaskFormModal
        open={isTaskModalOpen}
        mode={taskModalMode}
        clientId={clientId}
        task={selectedTask || undefined}
        onClose={closeTaskModal}
      />

      <NoteFormModal
        open={isNoteModalOpen}
        clientId={clientId}
        note={selectedNote || undefined}
        onClose={closeNoteModal}
      />

      <DocumentFormModal
        open={isDocumentModalOpen}
        clientId={clientId}
        onClose={() => setIsDocumentModalOpen(false)}
      />
    </>
  );
}

function TaskItem({
  task,
  onEdit,
  onDelete,
}: {
  task: ClientTask;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between p-3 rounded-lg glass-inner hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm truncate">{task.title}</h4>
          <Badge className={cn('text-[10px]', priorityColors[task.priority])}>
            {task.priority}
          </Badge>
          <Badge className={cn('text-[10px]', statusColors[task.status])}>
            {task.status}
          </Badge>
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.assignee && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.assignee}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEdit}>
          <Edit className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function NoteItem({ note, onClick }: { note: ClientNote; onClick: () => void }) {
  return (
    <div
      className="p-3 rounded-lg glass-inner hover:bg-muted/30 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">{note.title}</h4>
        <Badge className={cn('text-[10px]', categoryColors[note.category])}>
          {note.category}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-3">{note.content}</p>
      <p className="text-[10px] text-muted-foreground/70 mt-2">
        {formatRelativeTime(note.createdAt)}
      </p>
    </div>
  );
}

function DocumentItem({ document }: { document: ClientDocument }) {
  const handleOpen = () => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg glass-inner transition-colors',
        document.url && 'hover:bg-muted/30 cursor-pointer'
      )}
      onClick={handleOpen}
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', documentTypeColors[document.type])}>
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-medium text-sm">{document.name}</h4>
          <p className="text-xs text-muted-foreground">
            {document.type.charAt(0).toUpperCase() + document.type.slice(1)} - {formatRelativeTime(document.uploadedAt)}
          </p>
        </div>
      </div>
      {document.url && <ExternalLink className="h-4 w-4 text-muted-foreground" />}
    </div>
  );
}
