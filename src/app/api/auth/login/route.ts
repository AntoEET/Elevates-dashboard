import { NextRequest, NextResponse } from 'next/server';
import { createSession, hashPassword } from '@/lib/auth';
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ??
             request.headers.get('x-real-ip') ??
             'unknown';

  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Too many login attempts. Please try again later.',
        resetIn: Math.ceil(rateLimit.resetIn / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { userId, password } = body;

    if (!userId || !password) {
      return NextResponse.json(
        { error: 'User ID and password are required' },
        { status: 400 }
      );
    }

    const validUserId = process.env.AUTH_USER_ID;
    const validPasswordHash = process.env.AUTH_PASSWORD_HASH;

    if (!validUserId || !validPasswordHash) {
      console.error('Auth environment variables not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const passwordHash = hashPassword(password);
    const isValidUser = userId === validUserId;
    const isValidPassword = passwordHash === validPasswordHash;

    if (!isValidUser || !isValidPassword) {
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          remaining: rateLimit.remaining,
        },
        { status: 401 }
      );
    }

    // Reset rate limit on successful login
    resetRateLimit(ip);

    // Create session
    await createSession(userId);

    const response = NextResponse.json(
      { success: true, user: userId },
      { status: 200 }
    );

    console.log('Login response headers:', response.headers);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
