import { google } from 'googleapis';
import { createHmac } from 'crypto';
import { generateStateToken } from './crypto';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
];

/**
 * Creates an OAuth2 client instance
 */
export function createOAuth2Client() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Google OAuth configuration in environment variables');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Generates a signed state parameter for CSRF protection
 * Format: base64url(userId:timestamp:nonce:signature)
 */
export function generateStateParameter(userId: string): string {
  const stateSecret = process.env.OAUTH_STATE_SECRET;
  if (!stateSecret) {
    throw new Error('OAUTH_STATE_SECRET not configured');
  }

  const timestamp = Date.now().toString();
  const nonce = generateStateToken();
  const payload = `${userId}:${timestamp}:${nonce}`;

  // Sign the payload
  const signature = createHmac('sha256', stateSecret)
    .update(payload)
    .digest('base64url');

  const stateData = `${payload}:${signature}`;
  return Buffer.from(stateData).toString('base64url');
}

/**
 * Verifies and decodes a state parameter
 * Returns userId if valid, throws error if invalid
 */
export function verifyStateParameter(state: string): string {
  const stateSecret = process.env.OAUTH_STATE_SECRET;
  if (!stateSecret) {
    throw new Error('OAUTH_STATE_SECRET not configured');
  }

  let stateData: string;
  try {
    stateData = Buffer.from(state, 'base64url').toString('utf8');
  } catch (error) {
    throw new Error('Invalid state parameter format');
  }

  const parts = stateData.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid state parameter structure');
  }

  const [userId, timestamp, nonce, signature] = parts;
  const payload = `${userId}:${timestamp}:${nonce}`;

  // Verify signature
  const expectedSignature = createHmac('sha256', stateSecret)
    .update(payload)
    .digest('base64url');

  if (signature !== expectedSignature) {
    throw new Error('Invalid state parameter signature');
  }

  // Check expiry (10 minutes)
  const stateAge = Date.now() - parseInt(timestamp);
  if (stateAge > 10 * 60 * 1000) {
    throw new Error('State parameter expired');
  }

  return userId;
}

/**
 * Generates the OAuth authorization URL
 */
export function generateAuthUrl(userId: string): string {
  const oauth2Client = createOAuth2Client();
  const state = generateStateParameter(userId);

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state,
    prompt: 'consent', // Force consent to ensure refresh token
  });
}
