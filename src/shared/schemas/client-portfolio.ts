import { z } from 'zod';

// ============================================
// Base Schemas
// ============================================

export const clientIdSchema = z.string().min(1);
export const timestampSchema = z.string().datetime().or(z.string());

// ============================================
// Client Profile Schemas
// ============================================

export const clientTierSchema = z.enum(['enterprise', 'growth', 'starter']);
export const contractStatusSchema = z.enum(['active', 'pending', 'expired', 'cancelled']);
export const contractHealthSchema = z.enum(['healthy', 'at-risk', 'churning', 'expanding']);

export const clientContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.string().optional(),
});

export const clientContractSchema = z.object({
  value: z.number().nonnegative(),
  startDate: z.string(),
  endDate: z.string(),
  status: contractStatusSchema,
});

export const clientFinancialsSchema = z.object({
  arr: z.number().nonnegative(), // Annual Recurring Revenue
  nrr: z.number().min(0).max(200), // Net Revenue Retention %
  revenueGenerated: z.number().nonnegative(), // Total revenue from this client
  totalInvestment: z.number().positive(), // Total cost/investment to serve this client
  roi: z.number().optional(), // Calculated: ((revenueGenerated - totalInvestment) / totalInvestment) * 100
  healthScore: z.number().min(0).max(100),
});

export const clientProfileSchema = z.object({
  id: clientIdSchema,
  name: z.string().min(1),
  logo: z.string().optional(),
  industry: z.string(),
  tier: clientTierSchema,
  contact: clientContactSchema,
  contract: clientContractSchema,
  financials: clientFinancialsSchema,
  contractHealth: contractHealthSchema,
  tags: z.array(z.string()),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const clientProfileListSchema = z.array(clientProfileSchema);

// ============================================
// Task Schemas
// ============================================

export const taskStatusSchema = z.enum(['pending', 'in-progress', 'completed', 'cancelled']);
export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

export const clientTaskSchema = z.object({
  id: z.string().min(1),
  clientId: clientIdSchema,
  title: z.string().min(1),
  description: z.string().optional(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
  completedAt: z.string().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const clientTaskListSchema = z.array(clientTaskSchema);

// ============================================
// Meeting Schemas
// ============================================

export const meetingTypeSchema = z.enum(['call', 'video', 'in-person', 'review']);

export const clientMeetingSchema = z.object({
  id: z.string().min(1),
  clientId: clientIdSchema,
  title: z.string().min(1),
  description: z.string().optional(),
  type: meetingTypeSchema,
  date: z.string(),
  duration: z.number().positive(), // in minutes
  attendees: z.array(z.string()),
  notes: z.string().optional(),
  outcome: z.string().optional(),
  createdAt: timestampSchema,
});

export const clientMeetingListSchema = z.array(clientMeetingSchema);

// ============================================
// Note Schemas
// ============================================

export const noteCategorySchema = z.enum(['general', 'issue', 'opportunity', 'feedback']);

export const clientNoteSchema = z.object({
  id: z.string().min(1),
  clientId: clientIdSchema,
  title: z.string().min(1),
  content: z.string(),
  category: noteCategorySchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const clientNoteListSchema = z.array(clientNoteSchema);

// ============================================
// Document Schemas
// ============================================

export const documentTypeSchema = z.enum(['contract', 'proposal', 'report', 'presentation', 'other']);

export const clientDocumentSchema = z.object({
  id: z.string().min(1),
  clientId: clientIdSchema,
  name: z.string().min(1),
  type: documentTypeSchema,
  path: z.string().optional(),
  url: z.string().url().optional(),
  uploadedAt: timestampSchema,
  size: z.number().optional(), // in bytes
});

export const clientDocumentListSchema = z.array(clientDocumentSchema);

// ============================================
// Activity Log Schemas
// ============================================

export const activityTypeSchema = z.enum([
  'client-created',
  'client-updated',
  'client-deleted',
  'task-created',
  'task-updated',
  'task-completed',
  'task-deleted',
  'meeting-scheduled',
  'meeting-completed',
  'meeting-cancelled',
  'note-created',
  'note-updated',
  'note-deleted',
  'document-uploaded',
  'document-deleted',
  'contact-updated',
  'contract-updated',
  'health-score-changed',
]);

export const activityEntrySchema = z.object({
  id: z.string().min(1),
  clientId: clientIdSchema,
  type: activityTypeSchema,
  description: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: timestampSchema,
});

export const activityLogSchema = z.array(activityEntrySchema);

// ============================================
// Client Registry Schema
// ============================================

export const clientRegistryEntrySchema = z.object({
  id: clientIdSchema,
  name: z.string(),
  tier: clientTierSchema,
  createdAt: timestampSchema,
});

export const clientRegistrySchema = z.object({
  clients: z.array(clientRegistryEntrySchema),
  lastUpdated: timestampSchema,
});

// ============================================
// Export Types (inferred from schemas)
// ============================================

export type ClientTier = z.infer<typeof clientTierSchema>;
export type ContractStatus = z.infer<typeof contractStatusSchema>;
export type ContractHealth = z.infer<typeof contractHealthSchema>;
export type ClientContact = z.infer<typeof clientContactSchema>;
export type ClientContract = z.infer<typeof clientContractSchema>;
export type ClientFinancials = z.infer<typeof clientFinancialsSchema>;
export type ClientProfile = z.infer<typeof clientProfileSchema>;
export type ClientProfileList = z.infer<typeof clientProfileListSchema>;

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type ClientTask = z.infer<typeof clientTaskSchema>;
export type ClientTaskList = z.infer<typeof clientTaskListSchema>;

export type MeetingType = z.infer<typeof meetingTypeSchema>;
export type ClientMeeting = z.infer<typeof clientMeetingSchema>;
export type ClientMeetingList = z.infer<typeof clientMeetingListSchema>;

export type NoteCategory = z.infer<typeof noteCategorySchema>;
export type ClientNote = z.infer<typeof clientNoteSchema>;
export type ClientNoteList = z.infer<typeof clientNoteListSchema>;

export type DocumentType = z.infer<typeof documentTypeSchema>;
export type ClientDocument = z.infer<typeof clientDocumentSchema>;
export type ClientDocumentList = z.infer<typeof clientDocumentListSchema>;

export type ActivityType = z.infer<typeof activityTypeSchema>;
export type ActivityEntry = z.infer<typeof activityEntrySchema>;
export type ActivityLog = z.infer<typeof activityLogSchema>;

export type ClientRegistryEntry = z.infer<typeof clientRegistryEntrySchema>;
export type ClientRegistry = z.infer<typeof clientRegistrySchema>;
