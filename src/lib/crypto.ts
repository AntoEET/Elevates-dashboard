import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;

/**
 * Derives an encryption key from the master key using PBKDF2
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return pbkdf2Sync(masterKey, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypts data using AES-256-GCM with authenticated encryption
 * Format: salt:iv:authTag:encrypted
 */
export function encrypt(data: string, masterKey: string): string {
  // Generate random salt and IV
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);

  // Derive key from master key and salt
  const key = deriveKey(masterKey, salt);

  // Create cipher and encrypt
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Get authentication tag
  const authTag = cipher.getAuthTag();

  // Combine: salt:iv:authTag:encrypted
  return [
    salt.toString('base64'),
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted,
  ].join(':');
}

/**
 * Decrypts data encrypted with the encrypt function
 */
export function decrypt(encryptedData: string, masterKey: string): string {
  // Split the encrypted string
  const parts = encryptedData.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted data format');
  }

  const [saltB64, ivB64, authTagB64, encrypted] = parts;

  // Convert from base64
  const salt = Buffer.from(saltB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');

  // Derive key from master key and salt
  const key = deriveKey(masterKey, salt);

  // Create decipher and decrypt
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generates a random secret key (32 bytes in hex format)
 */
export function generateSecret(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generates a cryptographically secure random string for state parameters
 */
export function generateStateToken(): string {
  return randomBytes(32).toString('base64url');
}
