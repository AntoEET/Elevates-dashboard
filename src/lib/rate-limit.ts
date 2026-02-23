interface RateLimitEntry {
  count: number;
  firstAttempt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  // Clean up expired entries periodically
  if (rateLimitStore.size > 100) {
    cleanupExpiredEntries();
  }

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    rateLimitStore.set(identifier, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetIn: WINDOW_MS };
  }

  const windowExpired = now - entry.firstAttempt > WINDOW_MS;
  if (windowExpired) {
    rateLimitStore.set(identifier, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetIn: WINDOW_MS };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const resetIn = WINDOW_MS - (now - entry.firstAttempt);
    return { allowed: false, remaining: 0, resetIn };
  }

  entry.count += 1;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - entry.count,
    resetIn: WINDOW_MS - (now - entry.firstAttempt),
  };
}

export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

// Clean up expired entries on each check instead of using setInterval
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.firstAttempt > WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  }
}
