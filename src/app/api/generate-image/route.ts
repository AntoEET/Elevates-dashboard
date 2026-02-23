import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI API key not configured. Add GOOGLE_AI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

    // Use Gemini 2.0 Flash with image generation capability
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp-image-generation',
      generationConfig: {
        responseModalities: ['Text', 'Image'],
      } as any,
    });

    // Enhanced prompt for better image generation
    const enhancedPrompt = `Create a professional, high-quality image for social media marketing.
Style: Clean, modern, visually striking.
Purpose: Business/professional content for LinkedIn or Instagram.

User request: ${prompt}

Generate an image that would work well for a professional AI automation company called Elevates.`;

    const response = await model.generateContent(enhancedPrompt);
    const result = response.response;

    // Extract image and text from response
    let imageData: string | null = null;
    let textResponse: string = '';

    if (result.candidates && result.candidates[0]?.content?.parts) {
      for (const part of result.candidates[0].content.parts) {
        if ('inlineData' in part && part.inlineData) {
          imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        if ('text' in part && part.text) {
          textResponse = part.text;
        }
      }
    }

    if (!imageData) {
      return NextResponse.json(
        { error: 'Failed to generate image. Try a different prompt.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: imageData,
      description: textResponse || 'Image generated successfully',
    });
  } catch (error) {
    console.error('Image generation error:', error);

    // Handle specific error types
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';

    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid Google AI API key. Please check your configuration.' },
        { status: 401 }
      );
    }

    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
