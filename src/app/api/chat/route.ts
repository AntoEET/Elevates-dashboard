import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Define tools for calendar and task management
const tools: Anthropic.Tool[] = [
  {
    name: 'add_calendar_event',
    description: 'Add an event to the calendar. Use this when the user asks to schedule a meeting, add an event, or put something on the calendar.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string',
          description: 'The title of the event',
        },
        description: {
          type: 'string',
          description: 'Optional description of the event',
        },
        date: {
          type: 'string',
          description: 'The date of the event in YYYY-MM-DD format',
        },
        startTime: {
          type: 'string',
          description: 'Start time in HH:mm format (24-hour)',
        },
        endTime: {
          type: 'string',
          description: 'End time in HH:mm format (24-hour)',
        },
        type: {
          type: 'string',
          enum: ['meeting', 'task', 'reminder', 'event'],
          description: 'The type of calendar entry',
        },
      },
      required: ['title', 'date', 'type'],
    },
  },
  {
    name: 'add_task',
    description: 'Add a task to the todo list. Use this when the user asks to add a task, create a to-do, or add something to their task list.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string',
          description: 'The title of the task',
        },
        description: {
          type: 'string',
          description: 'Optional description of the task',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Priority level of the task',
        },
        dueDate: {
          type: 'string',
          description: 'Optional due date in YYYY-MM-DD format',
        },
      },
      required: ['title', 'priority'],
    },
  },
];

export async function POST(request: NextRequest) {
  try {
    const { message, systemPrompt, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Get today's date for context
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayOfWeek = today.toLocaleDateString('en-GB', { weekday: 'long' });

    const enhancedSystemPrompt = `${systemPrompt || 'You are a helpful assistant.'}

CURRENT DATE CONTEXT:
- Today is ${dayOfWeek}, ${todayStr}
- Use this to correctly interpret relative dates like "today", "tomorrow", "next Monday", etc.
- When adding events or tasks, always use YYYY-MM-DD format for dates and HH:mm for times.

When the user asks to add an event or task, use the appropriate tool. After using a tool, confirm what was added in a friendly way.`;

    // Build messages array with history
    const messages: { role: 'user' | 'assistant'; content: string }[] = [];

    if (history && Array.isArray(history)) {
      history.forEach((msg: HistoryMessage) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: enhancedSystemPrompt,
      tools,
      messages,
    });

    // Check if Claude wants to use tools
    const toolUses: Array<{
      name: string;
      input: Record<string, unknown>;
    }> = [];
    let textContent = '';

    for (const block of response.content) {
      if (block.type === 'tool_use') {
        toolUses.push({
          name: block.name,
          input: block.input as Record<string, unknown>,
        });
      } else if (block.type === 'text') {
        textContent = block.text;
      }
    }

    // If there are tool uses, return them for the client to execute
    if (toolUses.length > 0) {
      return NextResponse.json({
        content: textContent,
        actions: toolUses,
      });
    }

    return NextResponse.json({ content: textContent });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate response' },
      { status: 500 }
    );
  }
}
