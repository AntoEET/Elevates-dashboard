'use client';

import * as React from 'react';
import { formatCurrency, formatCompact, formatPercent, formatNumber } from '@/shared/lib/utils';
import { ANIMATION } from '@/shared/constants';

interface AnimatedCounterProps {
  value: number;
  format?: 'number' | 'currency' | 'percent' | 'compact';
  duration?: number;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  format = 'number',
  duration = 1000,
  decimals,
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const previousValue = React.useRef(0);

  React.useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        return formatCurrency(val, { decimals: decimals ?? 0 });
      case 'compact':
        return formatCompact(val, decimals ?? 1);
      case 'percent':
        return formatPercent(val, decimals ?? 1);
      case 'number':
      default:
        return formatNumber(val, decimals ?? 0);
    }
  };

  return <span className={className}>{formatValue(displayValue)}</span>;
}

interface LiveCounterProps {
  baseValue: number;
  incrementPerSecond: number;
  format?: 'number' | 'currency' | 'compact';
  className?: string;
}

export function LiveCounter({
  baseValue,
  incrementPerSecond,
  format = 'number',
  className,
}: LiveCounterProps) {
  const [value, setValue] = React.useState(baseValue);
  const startTime = React.useRef(Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTime.current) / 1000;
      setValue(baseValue + incrementPerSecond * elapsedSeconds);
    }, ANIMATION.COUNTER_TICK);

    return () => clearInterval(interval);
  }, [baseValue, incrementPerSecond]);

  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        return formatCurrency(val, { decimals: 0 });
      case 'compact':
        return formatCompact(val);
      case 'number':
      default:
        return formatNumber(val, 0);
    }
  };

  return <span className={className}>{formatValue(value)}</span>;
}
