import { z } from 'zod';

const envSchema = z.object({
  AUTH_USER_ID: z.string().min(1, 'AUTH_USER_ID is required'),
  AUTH_PASSWORD_HASH: z.string().min(64, 'AUTH_PASSWORD_HASH must be a valid SHA-256 hash'),
  SESSION_SECRET: z.string().min(16, 'SESSION_SECRET must be at least 16 characters'),
  SESSION_MAX_AGE: z.coerce.number().positive().default(86400),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = validateEnv();
