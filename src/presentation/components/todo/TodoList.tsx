'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTodoStore, type TodoItem } from '@/store/todo.store';
import {
  Plus,
  Check,
  Trash2,
  Circle,
  CheckCircle2,
  Flag,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import { formatRelativeTime } from '@/shared/lib/utils';

interface TodoListProps {
  className?: string;
}

export function TodoList({ className }: TodoListProps) {
  const [newTodoTitle, setNewTodoTitle] = React.useState('');
  const [showCompleted, setShowCompleted] = React.useState(false);
  const [filter, setFilter] = React.useState<'all' | 'high' | 'medium' | 'low'>('all');

  const { todos, addTodo, toggleTodo, removeTodo, updateTodo } = useTodoStore();

  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  const filteredPending = filter === 'all'
    ? pendingTodos
    : pendingTodos.filter((t) => t.priority === filter);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    addTodo({
      title: newTodoTitle.trim(),
      priority: 'medium',
    });
    setNewTodoTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleAddTodo(e);
    }
  };

  return (
    <GlassCard size="lg" className={className}>
      <GlassCardHeader>
        <div className="flex items-center gap-3">
          <GlassCardTitle>To-Do List</GlassCardTitle>
          <span className="text-xs text-muted-foreground">
            {pendingTodos.length} pending
          </span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="text-xs px-2 py-1 rounded bg-muted/50 border border-glass-border focus:outline-none"
          >
            <option value="all">All</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </GlassCardHeader>

      <GlassCardContent>
        {/* Add Todo Input */}
        <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button type="submit" size="sm" disabled={!newTodoTitle.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>

        {/* Pending Todos */}
        <ScrollArea className="h-[280px]">
          <div className="space-y-2">
            {filteredPending.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} priority tasks`}
              </p>
            ) : (
              filteredPending.map((todo) => (
                <TodoItemRow
                  key={todo.id}
                  todo={todo}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => removeTodo(todo.id)}
                  onUpdatePriority={(priority) => updateTodo(todo.id, { priority })}
                />
              ))
            )}
          </div>

          {/* Completed Section */}
          {completedTodos.length > 0 && (
            <div className="mt-4 pt-4 border-t border-glass-border">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Completed ({completedTodos.length})</span>
              </button>

              {showCompleted && (
                <div className="mt-2 space-y-2">
                  {completedTodos.map((todo) => (
                    <TodoItemRow
                      key={todo.id}
                      todo={todo}
                      onToggle={() => toggleTodo(todo.id)}
                      onDelete={() => removeTodo(todo.id)}
                      onUpdatePriority={(priority) => updateTodo(todo.id, { priority })}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </GlassCardContent>
    </GlassCard>
  );
}

interface TodoItemRowProps {
  todo: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
  onUpdatePriority: (priority: TodoItem['priority']) => void;
}

function TodoItemRow({ todo, onToggle, onDelete, onUpdatePriority }: TodoItemRowProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  const priorityColors = {
    high: 'text-red-500',
    medium: 'text-amber-500',
    low: 'text-blue-500',
  };

  const priorityBg = {
    high: 'bg-red-500/10',
    medium: 'bg-amber-500/10',
    low: 'bg-blue-500/10',
  };

  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-3 rounded-lg transition-all',
        'hover:bg-muted/30',
        todo.completed && 'opacity-60'
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
          todo.completed
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-muted-foreground hover:border-primary'
        )}
      >
        {todo.completed && <Check className="h-3 w-3" />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium',
            todo.completed && 'line-through text-muted-foreground'
          )}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {todo.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1">
          <span
            className={cn(
              'text-[10px] px-1.5 py-0.5 rounded font-medium',
              priorityColors[todo.priority],
              priorityBg[todo.priority]
            )}
          >
            {todo.priority}
          </span>
          {todo.dueDate && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {todo.completedAt && (
            <span className="text-[10px] text-muted-foreground">
              Done {formatRelativeTime(todo.completedAt)}
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-8 z-20 w-36 py-1 rounded-lg glass border border-glass-border shadow-lg">
              <div className="px-2 py-1 text-xs text-muted-foreground">Priority</div>
              {(['high', 'medium', 'low'] as const).map((priority) => (
                <button
                  key={priority}
                  onClick={() => {
                    onUpdatePriority(priority);
                    setShowMenu(false);
                  }}
                  className={cn(
                    'w-full px-3 py-1.5 text-left text-sm hover:bg-muted/50 flex items-center gap-2',
                    todo.priority === priority && 'bg-muted/30'
                  )}
                >
                  <Flag className={cn('h-3 w-3', priorityColors[priority])} />
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
              <div className="border-t border-glass-border my-1" />
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
