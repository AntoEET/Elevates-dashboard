import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: session.userId,
        expiresAt: session.exp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'An error occurred checking session' },
      { status: 500 }
    );
  }
}
