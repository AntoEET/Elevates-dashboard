'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import {
  Bot,
  User,
  Send,
  Plus,
  MessageSquare,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

const STORAGE_KEY = 'elevates-chat-v2';

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function getResponse(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('hello') || t.includes('hi')) {
    return "Hello! I'm the Elevates AI Assistant. How can I help you today?";
  }
  if (t.includes('client')) {
    return "Your client portfolio shows healthy engagement. Check the Client Performance dashboard for detailed metrics.";
  }
  return `I understand you're asking about: "${text}". Once connected to RAG, I'll provide detailed insights.`;
}

export function ChatBot() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  // Load saved conversations once on mount
  React.useEffect(() => {
    let data: Conversation[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          data = parsed;
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setConversations(data);
    if (data.length > 0) {
      setActiveId(data[0].id);
    }
    setReady(true);
  }, []);

  const active = conversations.find(c => c.id === activeId);

  const save = (list: Conversation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  };

  const handleNew = () => {
    const conv: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
    };
    const list = [conv, ...conversations];
    setConversations(list);
    setActiveId(conv.id);
    save(list);
  };

  const handleDelete = (id: string) => {
    const list = conversations.filter(c => c.id !== id);
    setConversations(list);
    save(list);
    if (activeId === id) {
      setActiveId(list[0]?.id || null);
    }
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;

    const text = input.trim();
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    let targetId = activeId;
    let list: Conversation[];

    if (!targetId) {
      const conv: Conversation = {
        id: generateId(),
        title: text.slice(0, 25) + (text.length > 25 ? '...' : ''),
        messages: [userMsg],
      };
      list = [conv, ...conversations];
      targetId = conv.id;
      setActiveId(targetId);
    } else {
      list = conversations.map(c =>
        c.id === targetId
          ? { ...c, messages: [...c.messages, userMsg], title: c.messages.length === 0 ? text.slice(0, 25) : c.title }
          : c
      );
    }

    setConversations(list);
    save(list);
    setInput('');
    setLoading(true);

    const finalId = targetId;
    setTimeout(() => {
      const botMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: getResponse(text),
        timestamp: new Date().toISOString(),
      };
      setConversations(prev => {
        const updated = prev.map(c =>
          c.id === finalId
            ? { ...c, messages: [...c.messages, botMsg] }
            : c
        );
        save(updated);
        return updated;
      });
      setLoading(false);
    }, 800);
  };

  if (!ready) {
    return <div className="h-[600px] rounded-xl border border-glass-border bg-glass-bg animate-pulse" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Sidebar */}
      <GlassCard className="lg:col-span-1 flex flex-col overflow-hidden">
        <GlassCardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <GlassCardTitle className="text-sm">Chats</GlassCardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNew}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </GlassCardHeader>
        <GlassCardContent className="flex-1 overflow-y-auto pt-0">
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No chats yet</p>
          ) : (
            <div className="space-y-1">
              {conversations.map(c => (
                <div
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    'group flex items-center gap-2 p-2 rounded-lg cursor-pointer',
                    activeId === c.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                  )}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-sm truncate">{c.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCardContent>
      </GlassCard>

      {/* Chat */}
      <GlassCard className="lg:col-span-3 flex flex-col overflow-hidden">
        <GlassCardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <GlassCardTitle className="text-sm">Elevates AI</GlassCardTitle>
              <p className="text-[10px] text-muted-foreground">Powered by RAG</p>
            </div>
          </div>
        </GlassCardHeader>

        <GlassCardContent className="flex-1 flex flex-col pt-0 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4 py-4">
              {!active || active.messages.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="font-medium">How can I help?</h3>
                  <p className="text-sm text-muted-foreground">Ask me anything about Elevates.</p>
                </div>
              ) : (
                active.messages.map(m => (
                  <div key={m.id} className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : '')}>
                    {m.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className={cn(
                      'max-w-[75%] rounded-lg p-3',
                      m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                      <p className="text-sm">{m.content}</p>
                    </div>
                    {m.role === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 flex gap-1">
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2 pt-4 border-t flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              disabled={loading}
              className="flex-1 h-10 px-3 rounded-md border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
            <Button onClick={handleSend} disabled={!input.trim() || loading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </GlassCardContent>
      </GlassCard>
    </div>
  );
}
