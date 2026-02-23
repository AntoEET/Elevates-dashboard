import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

interface TodoState {
  todos: TodoItem[];
}

interface TodoActions {
  addTodo: (todo: Omit<TodoItem, 'id' | 'createdAt' | 'completed' | 'completedAt'>) => void;
  updateTodo: (id: string, updates: Partial<Omit<TodoItem, 'id' | 'createdAt'>>) => void;
  removeTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  reorderTodos: (startIndex: number, endIndex: number) => void;
  getCompletedTodos: () => TodoItem[];
  getPendingTodos: () => TodoItem[];
  getTodayCompletedTodos: () => TodoItem[];
  cleanupOldCompletedTasks: () => void;
}

type TodoStore = TodoState & TodoActions;

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      todos: [
        // Sample todos
        {
          id: '1',
          title: 'Review Q4 financial reports',
          description: 'Analyze revenue trends and prepare summary',
          completed: false,
          priority: 'high',
          dueDate: new Date().toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '2',
          title: 'Prepare board presentation',
          completed: false,
          priority: 'high',
          dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: '3',
          title: 'Schedule team performance reviews',
          completed: true,
          priority: 'medium',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          completedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '4',
          title: 'Update project roadmap',
          completed: false,
          priority: 'medium',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '5',
          title: 'Send weekly status update',
          completed: true,
          priority: 'low',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          completedAt: new Date().toISOString(),
        },
      ],

      addTodo: (todo) => {
        const newTodo: TodoItem = {
          ...todo,
          id: crypto.randomUUID(),
          completed: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          todos: [newTodo, ...state.todos],
        }));
      },

      updateTodo: (id, updates) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, ...updates } : todo
          ),
        }));
      },

      removeTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }));
      },

      toggleTodo: (id) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  completed: !todo.completed,
                  completedAt: !todo.completed ? new Date().toISOString() : undefined,
                }
              : todo
          ),
        }));
      },

      reorderTodos: (startIndex, endIndex) => {
        set((state) => {
          const result = Array.from(state.todos);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return { todos: result };
        });
      },

      getCompletedTodos: () => {
        return get().todos.filter((todo) => todo.completed);
      },

      getPendingTodos: () => {
        return get().todos.filter((todo) => !todo.completed);
      },

      // Get only tasks completed today (for display in Completed section)
      getTodayCompletedTodos: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return get().todos.filter((todo) => {
          if (!todo.completed || !todo.completedAt) return false;
          const completedDate = new Date(todo.completedAt);
          completedDate.setHours(0, 0, 0, 0);
          return completedDate.getTime() === today.getTime();
        });
      },

      // Remove all completed tasks from previous days
      cleanupOldCompletedTasks: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        set((state) => ({
          todos: state.todos.filter((todo) => {
            // Keep all pending tasks
            if (!todo.completed) return true;

            // Keep completed tasks from today
            if (todo.completedAt) {
              const completedDate = new Date(todo.completedAt);
              completedDate.setHours(0, 0, 0, 0);
              return completedDate.getTime() === today.getTime();
            }

            // Remove completed tasks without completedAt timestamp
            return false;
          }),
        }));
      },
    }),
    {
      name: 'elevates-todos',
    }
  )
);
