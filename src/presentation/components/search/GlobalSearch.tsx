'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Search,
  X,
  Users,
  CheckSquare,
  Calendar,
  FileText,
  ArrowRight,
  Command,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useTodoStore } from '@/store/todo.store';
import { useCalendarStore } from '@/store/calendar.store';

interface SearchResult {
  id: string;
  type: 'client' | 'task' | 'event' | 'page';
  title: string;
  subtitle?: string;
  url: string;
  icon: React.ReactNode;
}

// Mock clients for search
const MOCK_CLIENTS = [
  { id: 'acme-corp', name: 'Acme Corporation', industry: 'Technology' },
  { id: 'techstart-io', name: 'TechStart.io', industry: 'SaaS' },
  { id: 'global-foods', name: 'Global Foods Ltd', industry: 'Food & Beverage' },
];

// Quick navigation pages
const PAGES = [
  { id: 'command-center', name: 'Command Center', url: '/command-center', keywords: ['home', 'dashboard'] },
  { id: 'client-performance', name: 'Client Performance', url: '/client-performance', keywords: ['clients', 'portfolio', 'roi'] },
  { id: 'operations', name: 'Operations Cockpit', url: '/operations', keywords: ['systems', 'health', 'automation'] },
  { id: 'intelligence', name: 'Intelligence', url: '/intelligence', keywords: ['ai', 'predictions', 'churn'] },
  { id: 'governance', name: 'Governance', url: '/governance', keywords: ['compliance', 'security', 'audit'] },
  { id: 'calendar', name: 'Calendar', url: '/calendar', keywords: ['events', 'schedule', 'meetings'] },
  { id: 'tasks', name: 'Task List', url: '/tasks', keywords: ['todos', 'tasks', 'checklist'] },
  { id: 'marketing', name: 'Post Generator', url: '/marketing', keywords: ['linkedin', 'instagram', 'content', 'posts'] },
];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  const todos = useTodoStore((state) => state.todos);
  const events = useCalendarStore((state) => state.events);

  // Keyboard shortcut to open
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Generate search results
  const results = React.useMemo(() => {
    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
      // Show recent/suggested items when no query
      PAGES.slice(0, 5).forEach((page) => {
        searchResults.push({
          id: `page-${page.id}`,
          type: 'page',
          title: page.name,
          subtitle: 'Quick navigation',
          url: page.url,
          icon: <ArrowRight className="h-4 w-4" />,
        });
      });
      return searchResults;
    }

    // Search clients
    MOCK_CLIENTS.forEach((client) => {
      if (
        client.name.toLowerCase().includes(lowerQuery) ||
        client.industry.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: `client-${client.id}`,
          type: 'client',
          title: client.name,
          subtitle: client.industry,
          url: `/client-performance/${client.id}`,
          icon: <Users className="h-4 w-4" />,
        });
      }
    });

    // Search tasks
    todos.forEach((todo) => {
      if (
        todo.title.toLowerCase().includes(lowerQuery) ||
        todo.description?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: `task-${todo.id}`,
          type: 'task',
          title: todo.title,
          subtitle: todo.completed ? 'Completed' : `Priority: ${todo.priority}`,
          url: '/tasks',
          icon: <CheckSquare className="h-4 w-4" />,
        });
      }
    });

    // Search events
    events.forEach((event) => {
      if (
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description?.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: `event-${event.id}`,
          type: 'event',
          title: event.title,
          subtitle: `${event.date} ${event.startTime || ''}`,
          url: '/calendar',
          icon: <Calendar className="h-4 w-4" />,
        });
      }
    });

    // Search pages
    PAGES.forEach((page) => {
      if (
        page.name.toLowerCase().includes(lowerQuery) ||
        page.keywords.some((k) => k.includes(lowerQuery))
      ) {
        searchResults.push({
          id: `page-${page.id}`,
          type: 'page',
          title: page.name,
          subtitle: 'Navigate to page',
          url: page.url,
          icon: <ArrowRight className="h-4 w-4" />,
        });
      }
    });

    return searchResults.slice(0, 10);
  }, [query, todos, events]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].url);
      setIsOpen(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return 'text-blue-500 bg-blue-500/10';
      case 'task':
        return 'text-emerald-500 bg-emerald-500/10';
      case 'event':
        return 'text-purple-500 bg-purple-500/10';
      case 'page':
        return 'text-amber-500 bg-amber-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        className="hidden md:flex items-center gap-2 text-muted-foreground h-9 px-3"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">Search...</span>
        <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <Command className="h-3 w-3" />K
        </kbd>
      </Button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2">
        <div className="rounded-xl border border-glass-border bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-glass-border">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search clients, tasks, events, pages..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {results.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No results found</p>
                <p className="text-xs">Try a different search term</p>
              </div>
            ) : (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                      index === selectedIndex
                        ? 'bg-primary/10'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        getTypeColor(result.type)
                      )}
                    >
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {result.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t border-glass-border bg-muted/30 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-muted">↑</kbd>
                <kbd className="px-1 rounded bg-muted">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-muted">↵</kbd>
                select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1 rounded bg-muted">esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
