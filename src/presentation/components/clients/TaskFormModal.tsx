'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClientPortfolioStore } from '@/store/client-portfolio.store';
import { Loader2 } from 'lucide-react';
import type { ClientTask, TaskStatus, TaskPriority } from '@/shared/schemas/client-portfolio';

interface TaskFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  clientId: string;
  task?: ClientTask;
  onClose: () => void;
}

const statuses: TaskStatus[] = ['pending', 'in-progress', 'completed', 'cancelled'];
const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

export function TaskFormModal({ open, mode, clientId, task, onClose }: TaskFormModalProps) {
  const { createTask, updateTask } = useClientPortfolioStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    status: 'pending' as TaskStatus,
    priority: 'medium' as TaskPriority,
    dueDate: '',
    assignee: '',
  });

  React.useEffect(() => {
    if (mode === 'edit' && task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assignee: task.assignee || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
        assignee: '',
      });
    }
  }, [mode, task, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const taskData = {
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      assignee: formData.assignee || undefined,
    };

    try {
      if (mode === 'edit' && task) {
        await updateTask(clientId, task.id, taskData);
      } else {
        await createTask(clientId, taskData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Task' : 'Edit Task'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new task for this client.'
              : 'Update the task details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title *
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Follow up on contract renewal"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add details about this task..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">
                  Priority *
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="dueDate" className="text-sm font-medium">
                  Due Date
                </label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="assignee" className="text-sm font-medium">
                  Assignee
                </label>
                <Input
                  id="assignee"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Task' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
