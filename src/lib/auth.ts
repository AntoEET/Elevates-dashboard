import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'elevates-session';

interface SessionData {
  userId: string;
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('SESSION_SECRET must be at least 16 characters');
  }
  return secret;
}

function getSessionMaxAge(): number {
  return Number(process.env.SESSION_MAX_AGE) || 86400;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  const passwordHash = hashPassword(password);
  return crypto.timingSafeEqual(
    Buffer.from(passwordHash, 'hex'),
    Buffer.from(hash, 'hex')
  );
}

function signData(data: string): string {
  const secret = getSessionSecret();
  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

function verifySignature(signedData: string): string | null {
  const parts = signedData.split('.');
  if (parts.length !== 2) return null;

  const [data, signature] = parts;
  const secret = getSessionSecret();
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');

  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'base64url'),
      Buffer.from(expectedSignature, 'base64url')
    );
    return isValid ? data : null;
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<void> {
  const maxAge = getSessionMaxAge();
  const sessionData: SessionData = {
    userId,
    exp: Date.now() + maxAge * 1000,
  };

  const encoded = Buffer.from(JSON.stringify(sessionData)).toString('base64url');
  const signedSession = signData(encoded);

  console.log('=== Creating Session ===');
  console.log('User ID:', userId);
  console.log('Max Age:', maxAge);
  console.log('Cookie Name:', SESSION_COOKIE_NAME);
  console.log('Signed Session Length:', signedSession.length);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Secure:', process.env.NODE_ENV === 'production');

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, signedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });

  console.log('Session cookie set successfully');
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const data = verifySignature(sessionCookie.value);
  if (!data) {
    return null;
  }

  try {
    const sessionData: SessionData = JSON.parse(
      Buffer.from(data, 'base64url').toString('utf-8')
    );

    if (sessionData.exp < Date.now()) {
      return null;
    }

    return sessionData;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Verifies a session cookie value (synchronous version for API routes)
 */
export function verifySessionCookie(cookieValue: string): SessionData | null {
  const data = verifySignature(cookieValue);
  if (!data) {
    return null;
  }

  try {
    const sessionData: SessionData = JSON.parse(
      Buffer.from(data, 'base64url').toString('utf-8')
    );

    if (sessionData.exp < Date.now()) {
      return null;
    }

    return sessionData;
  } catch {
    return null;
  }
}
