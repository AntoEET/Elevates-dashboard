import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { MetricTrend, MetricStatus } from '@/shared/schemas';

// Re-export cn from lib/utils for convenience
export { cn } from '@/lib/utils';

/**
 * Merge Tailwind CSS classes with proper precedence (alias)
 */
export function classNames(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with proper notation
 */
export function formatCurrency(
  value: number,
  options: { compact?: boolean; decimals?: number } = {}
): string {
  const { compact = false, decimals = 0 } = options;

  if (compact) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage with optional decimal places
 */
export function formatPercent(value: number, decimals = 1): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Format large numbers with compact notation
 */
export function formatCompact(value: number, decimals = 1): string {
  return new Intl.NumberFormat('en-GB', {
    notation: 'compact',
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return target.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  return target.toLocaleDateString('en-GB', options);
}

/**
 * Get trend indicator (+/-/=) from value change
 */
export function getTrend(current: number, previous: number): MetricTrend {
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'stable';
}

/**
 * Calculate percentage change between two values
 */
export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get status based on value and thresholds
 */
export function getStatus(
  value: number,
  thresholds: { healthy: number; warning: number },
  inverse = false
): MetricStatus {
  if (inverse) {
    if (value <= thresholds.healthy) return 'healthy';
    if (value <= thresholds.warning) return 'warning';
    return 'critical';
  }

  if (value >= thresholds.healthy) return 'healthy';
  if (value >= thresholds.warning) return 'warning';
  return 'critical';
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Generate a random number between min and max
 */
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate array of numbers from start to end
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Group array items by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Check if value is within acceptable range
 */
export function isWithinRange(
  value: number,
  target: number,
  tolerance: number
): boolean {
  return Math.abs(value - target) <= tolerance;
}
