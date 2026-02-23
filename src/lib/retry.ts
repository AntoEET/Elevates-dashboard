/**
 * Retry configuration options
 */
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  shouldRetry: (error: any) => {
    // Retry on network errors and rate limits
    if (error?.code === 429 || error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') {
      return true;
    }
    // Don't retry on auth errors
    if (error?.code === 401 || error?.code === 403) {
      return false;
    }
    // Retry on other server errors
    return error?.code >= 500;
  },
};

/**
 * Executes a function with exponential backoff retry logic
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt === opts.maxRetries || !opts.shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelay
      );

      console.warn(
        `Attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
        error
      );

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Checks if an error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.code === 'ECONNRESET' ||
    error?.code === 'ETIMEDOUT' ||
    error?.code === 'ENOTFOUND' ||
    error?.message?.includes('fetch failed') ||
    error?.message?.includes('network')
  );
}

/**
 * Checks if an error is a rate limit error
 */
export function isRateLimitError(error: any): boolean {
  return error?.code === 429 || error?.message?.includes('rate limit');
}
