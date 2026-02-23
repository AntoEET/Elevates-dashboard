import { promises as fs } from 'fs';
import { join } from 'path';
import { encrypt, decrypt } from '@/lib/crypto';

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
  scope: string;
  tokenType: string;
}

const TOKENS_DIR = join(process.cwd(), 'src', 'data', 'oauth-tokens');

/**
 * Ensures the tokens directory exists
 */
async function ensureTokensDir(): Promise<void> {
  try {
    await fs.mkdir(TOKENS_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

/**
 * Gets the file path for a user's tokens
 */
function getTokenFilePath(userId: string): string {
  return join(TOKENS_DIR, `${userId}.json`);
}

/**
 * Saves encrypted OAuth tokens for a user
 */
export async function saveTokens(userId: string, tokens: OAuthTokens): Promise<void> {
  const encryptionKey = process.env.OAUTH_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('OAUTH_ENCRYPTION_KEY not configured');
  }

  await ensureTokensDir();

  const tokensJson = JSON.stringify(tokens);
  const encrypted = encrypt(tokensJson, encryptionKey);

  const filePath = getTokenFilePath(userId);
  await fs.writeFile(filePath, encrypted, 'utf8');
}

/**
 * Loads and decrypts OAuth tokens for a user
 */
export async function loadTokens(userId: string): Promise<OAuthTokens | null> {
  const encryptionKey = process.env.OAUTH_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('OAUTH_ENCRYPTION_KEY not configured');
  }

  const filePath = getTokenFilePath(userId);

  try {
    const encrypted = await fs.readFile(filePath, 'utf8');
    const decrypted = decrypt(encrypted, encryptionKey);
    return JSON.parse(decrypted);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null; // File doesn't exist
    }
    throw error;
  }
}

/**
 * Deletes OAuth tokens for a user (disconnect)
 */
export async function deleteTokens(userId: string): Promise<void> {
  const filePath = getTokenFilePath(userId);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return; // File doesn't exist, nothing to delete
    }
    throw error;
  }
}

/**
 * Checks if a user has tokens stored
 */
export async function hasTokens(userId: string): Promise<boolean> {
  const filePath = getTokenFilePath(userId);

  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
