'use client';

import * as React from 'react';
import { PageHeader, PageContent } from '@/presentation/components/layout/DashboardShell';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  Linkedin,
  Instagram,
  Copy,
  Check,
  Loader2,
  Sparkles,
  User,
  RotateCcw,
  Trash2,
  Image as ImageIcon,
  Download,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// ============================================
// Types
// ============================================

type Platform = 'linkedin' | 'instagram' | 'picture';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  platform?: Platform;
  timestamp: string;
  image?: string; // Base64 image data for picture generation
}

// ============================================
// Platform-Specific Prompts
// ============================================

const LINKEDIN_PROMPT = `You are a LinkedIn content strategist and ghostwriter for Anthony, founder of Elevates (www.elevates-ai.com), a French AI automation company that helps service businesses reclaim 8-12 hours per week through custom, hands-off automation systems.

BRAND VOICE & PHILOSOPHY:

Core Positioning:
- Elevates doesn't sell software subscriptions—it builds systems that remove work entirely
- Target audience: "tool rich, time poor" service businesses (agencies, consultancies, professional services)
- Value proposition: Reclaim capacity for 2-3 additional clients without payroll increases
- Unique promise: 10-day full implementation, hands-off, zero learning curve
- ROI focus: Investment recouped within 30 days through time savings

Tone:
- Human, not sales-y or overly corporate
- Direct and pragmatic—no fluff or hype
- Conversational but authoritative
- French market sensibility (subtle, sophisticated, value-focused)
- Mix of: tactical insights (70%), personal stories (15%), industry commentary (15%)

What Elevates Deletes:
- Manual reporting → Real-time self-building dashboards
- Client onboarding friction → Autopilot from deposit to kickoff
- CRM hygiene tasks → Automated operations
- Research/data synthesis → AI-powered intelligence

CONTENT CALENDAR FRAMEWORK (Monday–Friday):

Monday "Industry Insight": Commentary on AI/automation trends, market observations. Short, punchy (150-200 words) with provocative hook.

Tuesday "Tactical Tuesday": Specific automation workflows, "Before/After" breakdowns, mini-tutorials. Listicle or step-by-step (200-250 words).

Wednesday "Case Study / Results": Client transformation stories, specific metrics (hours saved, ROI achieved), "The Delete List" in action. Story-driven with numbers (200-300 words).

Thursday "Myth-Busting / Contrarian Take": Debunk common beliefs, counter-intuitive insights. Contrarian hook + explanation (150-250 words).

Friday "Personal / Behind-the-Scenes": Anthony's entrepreneurial journey, lessons learned, reflections, vulnerable moments. Personal narrative (200-300 words).

CONTENT GUIDELINES:

DO:
- Lead with a hook that stops the scroll (question, bold statement, surprising stat)
- Use white space generously—short paragraphs, line breaks
- Include one clear takeaway or action item
- End with engagement prompts when appropriate (not every post)
- Reference "The Delete List" concept regularly
- Mention the 10-day implementation and 30-day ROI when relevant
- Use concrete numbers and specifics over vague claims
- Write in first person from Anthony's perspective

DON'T:
- Sound like a sales pitch or ad copy
- Use excessive emojis (1-2 max, strategically placed)
- Write walls of text—keep it scannable
- Over-promise or use hype language
- Make it about the tool/tech—make it about the outcome
- Be overly formal or corporate

CTA STRATEGY:
- Soft CTAs 80%: "What's on your Delete List?" / "Thoughts?" / "DM me if this resonates"
- Direct CTAs 20%: Partner program, free assessment, "DM me SYSTEMS"
- Website link in comments, not body

HOOK FORMATS:
- "Most agencies are drowning in tools they don't need."
- "Here's what I learned after building 47 automation systems:"
- "Your CRM isn't saving you time. It's creating work."
- "The AI tools everyone's talking about? Most of them miss the point."

Always provide ONLY the post content, ready to copy and paste. No explanations or meta-commentary. Use British English spelling.`;

const INSTAGRAM_PROMPT = `You are an Instagram content creator for Anthony, founder of Elevates (www.elevates-ai.com), a French AI automation company that helps service businesses reclaim 8-12 hours per week through custom automation systems.

BRAND VOICE:
- Human, relatable, and inspiring
- Behind-the-scenes entrepreneur vibe
- Visual storytelling focus
- More casual than LinkedIn but still professional
- French sophistication meets modern tech

CONTENT THEMES:
- Day-in-the-life of building an AI automation company
- Quick automation tips and "aha moments"
- Workspace/lifestyle content with subtle branding
- Client wins and celebrations (anonymised)
- AI news made simple and visual
- Personal entrepreneurial journey moments

TONE:
- Conversational and warm
- Inspiring without being preachy
- Authentic and unpolished feel
- First person from Anthony's perspective

FORMAT GUIDELINES:
- Strong opening hook (first line is crucial)
- Short, punchy sentences
- Strategic emoji use (3-5 per post, not excessive)
- Story-driven content
- 100-200 words ideal
- 5-10 relevant hashtags at the end (mix of niche and broader)
- Line breaks for readability

HASHTAG STRATEGY:
Include mix of:
- #AIAutomation #BusinessAutomation #WorkSmarter
- #AgencyLife #ConsultantLife #ServiceBusiness
- #Entrepreneur #StartupLife #FounderJourney
- #ProductivityHacks #TimeManagement
- #FrenchTech #TechEntrepreneur

CTA STYLE:
- "Save this for later"
- "Double tap if you relate"
- "Drop a 🔥 if this hits home"
- "Link in bio for more"
- "What would YOU automate first?"

DO:
- Make it visual-friendly (think: what image goes with this?)
- Keep it snackable and shareable
- Show personality and authenticity
- Use emojis to break up text and add tone
- End with engagement hook

DON'T:
- Sound corporate or salesy
- Write long paragraphs
- Overload with hashtags in the caption body
- Be too technical—keep it accessible
- Forget the human element

Always provide ONLY the post content with hashtags, ready to copy and paste. No explanations or meta-commentary. Use British English spelling.`;

// ============================================
// Main Component
// ============================================

export default function MarketingPage() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [platform, setPlatform] = React.useState<Platform>('linkedin');
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      platform,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (platform === 'picture') {
        // Handle image generation
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: input.trim() }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const assistantMessage: Message = {
          id: `msg-${Date.now()}-response`,
          role: 'assistant',
          content: data.description || 'Image generated successfully',
          platform,
          timestamp: new Date().toISOString(),
          image: data.image,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Handle text post generation
        const tonePrompt = platform === 'linkedin' ? LINKEDIN_PROMPT : INSTAGRAM_PROMPT;

        const response = await fetch('/api/generate-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: input.trim(),
            platform,
            tonePrompt,
          }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const assistantMessage: Message = {
          id: `msg-${Date.now()}-response`,
          role: 'assistant',
          content: data.content,
          platform,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Sorry, I couldn't generate the post. ${error instanceof Error ? error.message : 'Please try again.'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleRegenerate = async (originalPrompt: string, originalPlatform: Platform) => {
    setInput(originalPrompt);
    setPlatform(originalPlatform);
  };

  return (
    <>
      <PageHeader
        title="Post Generator"
        description="Create engaging LinkedIn and Instagram posts with AI"
        actions={
          <Button variant="outline" size="sm" onClick={handleClear} disabled={messages.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        }
      />

      <PageContent>
        <div className="max-w-4xl mx-auto">
          <GlassCard size="lg" className="h-[calc(100vh-220px)] flex flex-col overflow-hidden">
            {/* Platform Selector */}
            <div className="flex-shrink-0 flex items-center gap-2 p-4 border-b border-glass-border">
              <span className="text-sm text-muted-foreground mr-2">Platform:</span>
              <Button
                variant={platform === 'linkedin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlatform('linkedin')}
                className={cn(
                  platform === 'linkedin' && 'bg-[#0A66C2] hover:bg-[#0A66C2]/90'
                )}
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant={platform === 'instagram' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlatform('instagram')}
                className={cn(
                  platform === 'instagram' && 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90'
                )}
              >
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Button>
              <Button
                variant={platform === 'picture' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlatform('picture')}
                className={cn(
                  platform === 'picture' && 'bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] hover:opacity-90'
                )}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Picture
              </Button>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 min-h-0 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Post Generator</h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    {platform === 'picture'
                      ? 'Describe the image you want to create and I\'ll generate it using Nano Banana (Gemini AI).'
                      : `Tell me what you want to post about and I'll create engaging content tailored for ${platform === 'linkedin' ? 'LinkedIn' : 'Instagram'} in your tone.`
                    }
                  </p>
                  <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                    <p className="font-medium">Try something like:</p>
                    <div className="space-y-1 text-left max-w-sm">
                      {platform === 'picture' ? (
                        <>
                          <p className="p-2 rounded bg-muted/30">"Professional headshot of a business consultant"</p>
                          <p className="p-2 rounded bg-muted/30">"Modern office workspace with AI automation visuals"</p>
                          <p className="p-2 rounded bg-muted/30">"Abstract illustration of time savings and efficiency"</p>
                          <p className="p-2 rounded bg-muted/30">"Futuristic dashboard showing business analytics"</p>
                        </>
                      ) : (
                        <>
                          <p className="p-2 rounded bg-muted/30">"Monday insight about agencies drowning in tools"</p>
                          <p className="p-2 rounded bg-muted/30">"Tactical post on automating client onboarding"</p>
                          <p className="p-2 rounded bg-muted/30">"Case study: agency saved 12 hours/week"</p>
                          <p className="p-2 rounded bg-muted/30">"Contrarian take: why most AI tools fail"</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onCopy={() => handleCopy(message.content, message.id)}
                      onRegenerate={() =>
                        message.role === 'user' &&
                        message.platform &&
                        handleRegenerate(message.content, message.platform)
                      }
                      isCopied={copiedId === message.id}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 p-4 rounded-lg glass-inner">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Generating your post...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="flex-shrink-0 p-4 border-t border-glass-border">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder={platform === 'picture'
                    ? 'Describe the image you want to generate...'
                    : `What would you like to post about on ${platform === 'linkedin' ? 'LinkedIn' : 'Instagram'}?`}
                  className="w-full px-4 py-3 pr-14 text-sm rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50 resize-none min-h-[80px]"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="absolute right-2 bottom-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </GlassCard>
        </div>
      </PageContent>
    </>
  );
}

// ============================================
// Sub-Components
// ============================================

function MessageBubble({
  message,
  onCopy,
  onRegenerate,
  isCopied,
}: {
  message: Message;
  onCopy: () => void;
  onRegenerate: () => void;
  isCopied: boolean;
}) {
  const isUser = message.role === 'user';

  const handleDownload = () => {
    if (!message.image) return;
    const link = document.createElement('a');
    link.href = message.image;
    link.download = `elevates-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-primary' : 'bg-primary/10'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Sparkles className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Message */}
      <div className={cn('min-w-0 max-w-[85%]', isUser && 'flex flex-col items-end')}>
        {/* Platform Badge for User Messages */}
        {isUser && message.platform && (
          <Badge
            variant="outline"
            className={cn(
              'mb-1 text-[10px]',
              message.platform === 'linkedin'
                ? 'text-[#0A66C2]'
                : message.platform === 'instagram'
                ? 'text-[#E4405F]'
                : 'text-[#4285F4]'
            )}
          >
            {message.platform === 'linkedin' ? (
              <Linkedin className="h-3 w-3 mr-1" />
            ) : message.platform === 'instagram' ? (
              <Instagram className="h-3 w-3 mr-1" />
            ) : (
              <ImageIcon className="h-3 w-3 mr-1" />
            )}
            {message.platform === 'picture' ? 'Picture' : message.platform}
          </Badge>
        )}

        <div
          className={cn(
            'p-4 rounded-lg overflow-hidden',
            isUser ? 'bg-primary text-primary-foreground' : 'glass-inner'
          )}
        >
          {/* Image Display */}
          {message.image && (
            <div className="mb-3">
              <img
                src={message.image}
                alt="Generated image"
                className="rounded-lg max-w-full h-auto"
                style={{ maxHeight: '400px' }}
              />
            </div>
          )}
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Actions for Assistant Messages */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-2">
            {message.image ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleDownload}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={onCopy}
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
