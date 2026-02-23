'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageCircle,
  Send,
  Loader2,
  X,
  Sparkles,
  User,
  Minimize2,
  Maximize2,
  Calendar,
  CheckSquare,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useCalendarStore } from '@/store/calendar.store';
import { useTodoStore } from '@/store/todo.store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: ActionResult[];
}

interface ActionResult {
  type: 'calendar' | 'task';
  title: string;
  success: boolean;
}

interface ApiAction {
  name: string;
  input: Record<string, unknown>;
}

const SYSTEM_PROMPT = `You are a helpful AI assistant for Anthony Maroleau, founder of a consulting company called Elevates. You help with quick questions and actions related to business operations, client management, and daily tasks.

You can add events to the calendar and tasks to the todo list when asked.

Keep responses concise and actionable (2-3 sentences max unless more detail is requested).
Use British English spelling.
Be professional yet friendly.`;

export function MiniChatBot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Store hooks
  const addEvent = useCalendarStore((state) => state.addEvent);
  const addTodo = useTodoStore((state) => state.addTodo);

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Execute actions from Claude
  const executeActions = (actions: ApiAction[]): ActionResult[] => {
    const results: ActionResult[] = [];

    for (const action of actions) {
      try {
        if (action.name === 'add_calendar_event') {
          const { title, description, date, startTime, endTime, type } = action.input as {
            title: string;
            description?: string;
            date: string;
            startTime?: string;
            endTime?: string;
            type: 'meeting' | 'task' | 'reminder' | 'event';
          };

          addEvent({
            title,
            description,
            date,
            startTime,
            endTime,
            type,
            color: type === 'meeting' ? '#3B82F6' : type === 'task' ? '#059669' : '#8B5CF6',
          });

          results.push({ type: 'calendar', title, success: true });
        } else if (action.name === 'add_task') {
          const { title, description, priority, dueDate } = action.input as {
            title: string;
            description?: string;
            priority: 'low' | 'medium' | 'high';
            dueDate?: string;
          };

          addTodo({
            title,
            description,
            priority,
            dueDate,
          });

          results.push({ type: 'task', title, success: true });
        }
      } catch (error) {
        console.error('Failed to execute action:', action.name, error);
        results.push({
          type: action.name === 'add_calendar_event' ? 'calendar' : 'task',
          title: (action.input as { title?: string }).title || 'Unknown',
          success: false,
        });
      }
    }

    return results;
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          systemPrompt: SYSTEM_PROMPT,
          history: messages.slice(-10),
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Execute any actions
      let actionResults: ActionResult[] = [];
      if (data.actions && Array.isArray(data.actions)) {
        actionResults = executeActions(data.actions);
      }

      // Generate confirmation message if actions were executed
      let content = data.content || '';
      if (actionResults.length > 0 && !content) {
        const confirmations = actionResults.map((r) => {
          if (r.success) {
            return r.type === 'calendar'
              ? `Added "${r.title}" to your calendar.`
              : `Added "${r.title}" to your tasks.`;
          }
          return `Failed to add "${r.title}".`;
        });
        content = confirmations.join(' ');
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-response`,
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
        actions: actionResults.length > 0 ? actionResults : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Sorry, I couldn't process that. ${error instanceof Error ? error.message : 'Please try again.'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl border border-glass-border overflow-hidden transition-all duration-300',
        'bg-background/95 backdrop-blur-xl',
        isExpanded ? 'w-[450px] h-[600px]' : 'w-[380px] h-[500px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-glass-border bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Quick Assistant</h3>
            <p className="text-[10px] text-muted-foreground">Calendar & Tasks enabled</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium text-sm mb-1">How can I help?</h4>
            <p className="text-xs text-muted-foreground mb-4">
              I can add events to your calendar and tasks to your list.
            </p>
            <div className="space-y-2 w-full">
              {[
                'Add a meeting with John tomorrow at 2pm',
                'Create a task to review Q4 reports',
                'Schedule a client call for Friday 10am',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="w-full p-2 text-xs text-left rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-2',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                    message.role === 'user' ? 'bg-primary' : 'bg-primary/10'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="h-3 w-3 text-primary-foreground" />
                  ) : (
                    <Sparkles className="h-3 w-3 text-primary" />
                  )}
                </div>
                <div className={cn('max-w-[80%]', message.role === 'user' && 'flex flex-col items-end')}>
                  <div
                    className={cn(
                      'p-3 rounded-xl text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  {/* Action badges */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {message.actions.map((action, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]',
                            action.success
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-red-500/10 text-red-600'
                          )}
                        >
                          {action.type === 'calendar' ? (
                            <Calendar className="h-3 w-3" />
                          ) : (
                            <CheckSquare className="h-3 w-3" />
                          )}
                          {action.success ? 'Added' : 'Failed'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-glass-border">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask anything or add events/tasks..."
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
            disabled={isLoading}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-9 w-9"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
