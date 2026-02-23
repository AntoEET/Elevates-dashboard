'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface GridLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
    '3xl'?: number;
    '4k'?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2 md:gap-3',
  md: 'gap-3 md:gap-4 lg:gap-5',
  lg: 'gap-4 md:gap-5 lg:gap-6',
  xl: 'gap-5 md:gap-6 lg:gap-8',
};

export function GridLayout({
  children,
  columns = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4, '2xl': 4, '3xl': 5, '4k': 6 },
  gap = 'md',
  className,
  ...props
}: GridLayoutProps) {
  const columnClasses = [
    columns.xs && `grid-cols-${columns.xs}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    columns['2xl'] && `2xl:grid-cols-${columns['2xl']}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cn('grid', columnClasses, gapClasses[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  colSpan?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  rowSpan?: number;
}

export function GridItem({
  children,
  colSpan,
  rowSpan,
  className,
  ...props
}: GridItemProps) {
  const spanClasses = [
    colSpan?.xs && `col-span-${colSpan.xs}`,
    colSpan?.sm && `sm:col-span-${colSpan.sm}`,
    colSpan?.md && `md:col-span-${colSpan.md}`,
    colSpan?.lg && `lg:col-span-${colSpan.lg}`,
    colSpan?.xl && `xl:col-span-${colSpan.xl}`,
    colSpan?.['2xl'] && `2xl:col-span-${colSpan['2xl']}`,
    rowSpan && `row-span-${rowSpan}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn(spanClasses, className)} {...props}>
      {children}
    </div>
  );
}
