/**
 * Get current period in YYYY-MM format
 */
export function getCurrentPeriod(): string {
  const now = new Date();
  return formatPeriod(now);
}

/**
 * Format date as period (YYYY-MM)
 */
export function formatPeriod(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Parse period string to Date (first day of month)
 */
export function parsePeriod(period: string): Date {
  const [year, month] = period.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

/**
 * Get previous period
 */
export function getPreviousPeriod(period: string): string {
  const date = parsePeriod(period);
  date.setMonth(date.getMonth() - 1);
  return formatPeriod(date);
}

/**
 * Get next period
 */
export function getNextPeriod(period: string): string {
  const date = parsePeriod(period);
  date.setMonth(date.getMonth() + 1);
  return formatPeriod(date);
}

/**
 * Get period N months ago
 */
export function getPeriodMonthsAgo(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return formatPeriod(date);
}

/**
 * Get array of periods for last N months
 */
export function getLastNPeriods(n: number): string[] {
  const periods: string[] = [];
  const date = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const periodDate = new Date(date);
    periodDate.setMonth(date.getMonth() - i);
    periods.push(formatPeriod(periodDate));
  }

  return periods;
}

/**
 * Get period label (e.g., "Feb 2026")
 */
export function getPeriodLabel(period: string): string {
  const date = parsePeriod(period);
  return date.toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get fiscal quarter from period
 */
export function getFiscalQuarter(period: string): string {
  const [year, month] = period.split('-').map(Number);
  const quarter = Math.ceil(month / 3);
  return `Q${quarter} ${year}`;
}

/**
 * Get start and end dates for a period
 */
export function getPeriodRange(period: string): { start: Date; end: Date } {
  const start = parsePeriod(period);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setDate(0); // Last day of the month

  return { start, end };
}

/**
 * Check if a date falls within a period
 */
export function isDateInPeriod(date: Date, period: string): boolean {
  const { start, end } = getPeriodRange(period);
  return date >= start && date <= end;
}

/**
 * Format date for Xero API (YYYY-MM-DD)
 */
export function formatDateForXero(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get fiscal year from period
 */
export function getFiscalYear(period: string): number {
  const [year] = period.split('-').map(Number);
  return year;
}

/**
 * Calculate months between two periods
 */
export function getMonthsBetween(startPeriod: string, endPeriod: string): number {
  const start = parsePeriod(startPeriod);
  const end = parsePeriod(endPeriod);

  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();

  return yearDiff * 12 + monthDiff;
}

/**
 * Format date as "X days ago" or "X months ago"
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 30) {
    return `${diffDays} days ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) {
    return '1 month ago';
  }

  if (diffMonths < 12) {
    return `${diffMonths} months ago`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
}
