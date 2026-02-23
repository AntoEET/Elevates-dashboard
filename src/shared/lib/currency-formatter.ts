import type { Currency } from '@/shared/schemas/finance';

/**
 * Format currency with proper symbol and locale
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'GBP',
  options: {
    locale?: string;
    decimals?: number;
    showSymbol?: boolean;
  } = {}
): string {
  const {
    locale = currency === 'GBP' ? 'en-GB' : currency === 'USD' ? 'en-US' : 'en-GB',
    decimals = 2,
    showSymbol = true,
  } = options;

  if (!showSymbol) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
  };
  return symbols[currency] || currency;
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and commas
  const cleaned = value.replace(/[£$€,]/g, '').trim();
  return parseFloat(cleaned) || 0;
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number,
  options: {
    decimals?: number;
    showSign?: boolean;
  } = {}
): string {
  const { decimals = 1, showSign = false } = options;

  const formatted = value.toFixed(decimals);
  const sign = showSign && value > 0 ? '+' : '';

  return `${sign}${formatted}%`;
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(
  value: number,
  currency?: Currency
): string {
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    return `${getCurrencySymbol(currency || 'GBP')}${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (abs >= 1_000_000) {
    return `${getCurrencySymbol(currency || 'GBP')}${(value / 1_000_000).toFixed(1)}M`;
  }

  if (abs >= 1_000) {
    return `${getCurrencySymbol(currency || 'GBP')}${(value / 1_000).toFixed(1)}K`;
  }

  return formatCurrency(value, currency);
}

/**
 * Convert currency using exchange rates
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRates: Array<{ from: Currency; to: Currency; rate: number }>
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rate = exchangeRates.find(
    (r) => r.from === fromCurrency && r.to === toCurrency
  );

  if (!rate) {
    throw new Error(`Exchange rate not found: ${fromCurrency} → ${toCurrency}`);
  }

  return amount * rate.rate;
}
