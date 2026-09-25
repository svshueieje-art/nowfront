// ========================================
// Card Component
// ========================================

import type { ReactNode, HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl',
        variant === 'default' && 'bg-surface-900 border border-surface-800',
        variant === 'glass' && 'glass-card',
        variant === 'bordered' && 'bg-surface-900/50 border border-surface-700',
        paddingClasses[padding],
        hoverable &&
          'hover:border-surface-600 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
