'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const glassCardVariants = cva(
  'glass rounded-xl transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'glass-hover',
        static: '',
        glow: 'glass-glow',
        crisis: 'glass-crisis',
        inner: 'glass-inner',
      },
      size: {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      hover: {
        true: 'hover:scale-[1.01] cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      hover: false,
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  as?: React.ElementType;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, hover, as: Component = 'div', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(glassCardVariants({ variant, size, hover }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
GlassCard.displayName = 'GlassCard';

export interface GlassCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GlassCardHeader = React.forwardRef<HTMLDivElement, GlassCardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between mb-4', className)}
      {...props}
    />
  )
);
GlassCardHeader.displayName = 'GlassCardHeader';

export interface GlassCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const GlassCardTitle = React.forwardRef<HTMLHeadingElement, GlassCardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-sm font-medium text-muted-foreground uppercase tracking-wider', className)}
      {...props}
    />
  )
);
GlassCardTitle.displayName = 'GlassCardTitle';

export interface GlassCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GlassCardContent = React.forwardRef<HTMLDivElement, GlassCardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);
GlassCardContent.displayName = 'GlassCardContent';

export interface GlassCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GlassCardFooter = React.forwardRef<HTMLDivElement, GlassCardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-4 pt-4 border-t border-glass-border', className)}
      {...props}
    />
  )
);
GlassCardFooter.displayName = 'GlassCardFooter';
