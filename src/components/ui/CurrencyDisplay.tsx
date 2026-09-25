// ========================================
// CurrencyDisplay Component
// ========================================

import { clsx } from 'clsx';
import { formatCurrency } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  positive?: boolean;
  negative?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl font-semibold',
  xl: 'text-2xl sm:text-3xl font-bold',
};

export function CurrencyDisplay({
  amount,
  size = 'md',
  positive,
  negative,
  className,
}: CurrencyDisplayProps) {
  const isPositive = positive ?? amount > 0;
  const isNegative = negative ?? amount < 0;

  return (
    <span
      className={clsx(
        sizeClasses[size],
        isPositive && 'text-success-500',
        isNegative && 'text-danger-500',
        !isPositive && !isNegative && 'text-surface-100',
        className
      )}
    >
      {isPositive && '+'}
      {formatCurrency(Math.abs(amount))}
    </span>
  );
}
