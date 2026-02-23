'use client';

import * as React from 'react';
import { PageHeader, PageContent } from '@/presentation/components/layout/DashboardShell';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useTodoStore, type TodoItem } from '@/store/todo.store';
import { cn } from '@/lib/utils';
import {
  Plus,
  Check,
  Circle,
  Trash2,
  Edit2,
  Calendar,
  Flag,
  ListTodo,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const PRIORITY_COLORS = {
  low: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500' },
  high: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500' },
};

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<TodoItem | null>(null);
  const [filter, setFilter] = React.useState<'pending' | 'completed'>('pending');

  const { todos, addTodo, updateTodo, removeTodo, toggleTodo, getTodayCompletedTodos, cleanupOldCompletedTasks } = useTodoStore();

  // Cleanup old completed tasks on mount and at midnight
  React.useEffect(() => {
    // Run cleanup immediately on mount
    cleanupOldCompletedTasks();

    // Calculate time until midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    const timeUntilMidnight = midnight.getTime() - now.getTime();

    // Schedule cleanup at midnight
    const midnightTimeout = setTimeout(() => {
      cleanupOldCompletedTasks();
      // Then set up daily interval
      const dailyInterval = setInterval(cleanupOldCompletedTasks, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, [cleanupOldCompletedTasks]);

  // Get pending tasks and today's completed tasks
  const pendingTodos = React.useMemo(() => todos.filter((t) => !t.completed), [todos]);
  const todayCompletedTodos = React.useMemo(() => getTodayCompletedTodos(), [todos, getTodayCompletedTodos]);

  const filteredTodos = React.useMemo(() => {
    switch (filter) {
      case 'completed':
        return todayCompletedTodos;
      default:
        return pendingTodos;
    }
  }, [filter, pendingTodos, todayCompletedTodos]);

  const pendingCount = pendingTodos.length;
  const completedCount = todayCompletedTodos.length;

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: TodoItem) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSave = (data: Omit<TodoItem, 'id' | 'createdAt' | 'completed' | 'completedAt'>) => {
    if (editingTask) {
      updateTodo(editingTask.id, data);
    } else {
      addTodo(data);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <>
      <PageHeader
        title="Task List"
        description="Manage your tasks and stay organized"
        actions={
          <Button onClick={handleAddTask}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        }
      />

      <PageContent>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <GlassCard size="sm" className="cursor-pointer hover:ring-2 hover:ring-yellow-500/50 transition-all" onClick={() => setFilter('pending')}>
            <GlassCardContent className="flex items-center gap-4 py-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard size="sm" className="cursor-pointer hover:ring-2 hover:ring-green-500/50 transition-all" onClick={() => setFilter('completed')}>
            <GlassCardContent className="flex items-center gap-4 py-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('pending')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === 'pending'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground'
            )}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === 'completed'
                ? 'bg-green-500 text-white'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground'
            )}
          >
            Completed Today ({completedCount})
          </button>
        </div>

        {/* Task List */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>
              {filter === 'pending' ? 'Pending Tasks' : 'Completed Today'}
            </GlassCardTitle>
            {filter === 'completed' && (
              <span className="text-xs text-muted-foreground">
                Completed tasks are cleared at midnight
              </span>
            )}
          </GlassCardHeader>
          <GlassCardContent>
            {filteredTodos.length === 0 ? (
              <div className="text-center py-12">
                <ListTodo className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No tasks found</p>
                <Button variant="outline" className="mt-4" onClick={handleAddTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first task
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTodos.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-lg border transition-all group',
                      task.completed
                        ? 'bg-muted/30 border-transparent'
                        : 'bg-background/50 border-glass-border hover:border-primary/30'
                    )}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTodo(task.id)}
                      className={cn(
                        'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-muted-foreground/50 hover:border-primary'
                      )}
                    >
                      {task.completed && <Check className="h-3 w-3 text-white" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className={cn(
                            'font-medium',
                            task.completed && 'line-through text-muted-foreground'
                          )}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-1.5 hover:bg-muted rounded-md"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeTodo(task.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded-md text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={cn(
                          'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
                          PRIORITY_COLORS[task.priority].bg,
                          PRIORITY_COLORS[task.priority].text
                        )}>
                          <Flag className="h-3 w-3" />
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCardContent>
        </GlassCard>
      </PageContent>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={handleSave}
      />
    </>
  );
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TodoItem | null;
  onSave: (data: Omit<TodoItem, 'id' | 'createdAt' | 'completed' | 'completedAt'>) => void;
}

function TaskModal({ isOpen, onClose, task, onSave }: TaskModalProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState<TodoItem['priority']>('medium');
  const [dueDate, setDueDate] = React.useState('');

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass border-glass-border sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              placeholder="Task title"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm"
              placeholder="Add details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TodoItem['priority'])}
                className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full mt-1.5 px-3 py-2.5 rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {task ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
