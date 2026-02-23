import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured. Please add it to your .env.local file.' },
        { status: 500 }
      );
    }

    const { prompt, platform, tonePrompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const platformInstructions = platform === 'linkedin'
      ? 'Generate a LinkedIn post.'
      : 'Generate an Instagram post.';

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: tonePrompt,
      messages: [
        {
          role: 'user',
          content: `${platformInstructions}\n\nTopic/Request: ${prompt}`,
        },
      ],
    });

    // Extract text content from the response
    const content = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.type === 'text' ? block.text : '')
      .join('\n');

    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error('Error generating post:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `API Error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate post. Please try again.' },
      { status: 500 }
    );
  }
}
