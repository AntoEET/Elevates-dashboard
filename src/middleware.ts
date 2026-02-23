import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'elevates-session';

const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/session',
];

const STATIC_PATHS = [
  '/_next',
  '/favicon.ico',
  '/images',
  '/fonts',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));
}

function isStaticPath(pathname: string): boolean {
  return STATIC_PATHS.some(path => pathname.startsWith(path));
}

// Convert ArrayBuffer to base64url string
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function verifySession(signedData: string, secret: string): Promise<boolean> {
  const parts = signedData.split('.');
  if (parts.length !== 2) return false;

  const [data, signature] = parts;

  try {
    // Create HMAC key using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Sign the data
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(data)
    );

    const expectedSignature = arrayBufferToBase64Url(signatureBuffer);

    // Constant-time comparison
    if (signature.length !== expectedSignature.length) return false;
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    if (result !== 0) return false;

    // Check expiration
    const sessionData = JSON.parse(atob(data.replace(/-/g, '+').replace(/_/g, '/')));

    if (sessionData.exp < Date.now()) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  // TEMPORARILY DISABLED FOR DEVELOPMENT - allow all requests
  return NextResponse.next();

  /* ORIGINAL AUTH CODE - uncomment to re-enable
  const { pathname } = request.nextUrl;

  // Allow static files
  if (isStaticPath(pathname)) {
    return NextResponse.next();
  }

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const sessionSecret = process.env.SESSION_SECRET;

  if (!sessionCookie?.value || !sessionSecret) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For page routes, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify session
  const isValid = await verifySession(sessionCookie.value, sessionSecret);

  if (!isValid) {
    // Clear invalid cookie
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Session expired' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
  */
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
