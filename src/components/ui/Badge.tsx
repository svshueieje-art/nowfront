// ========================================
// Badge / Status Badge Component
// ========================================

import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Lock,
  Loader2,
  Award,
} from 'lucide-react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-500/15 text-success-500 border-success-500/20',
  warning: 'bg-warning-500/15 text-warning-500 border-warning-500/20',
  danger: 'bg-danger-500/15 text-danger-500 border-danger-500/20',
  info: 'bg-info-500/15 text-info-500 border-info-500/20',
  neutral: 'bg-surface-500/15 text-surface-400 border-surface-500/20',
  brand: 'bg-brand-500/15 text-brand-400 border-brand-500/20',
};

export function Badge({ variant = 'neutral', children, className, size = 'sm' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 font-medium rounded-full border',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ---- Status Badge (with icon) ----
interface StatusBadgeProps {
  status: string;
  className?: string;
}

function getStatusConfig(status: string): {
  variant: BadgeVariant;
  icon: ReactNode;
  label: string;
} {
  switch (status) {
    case 'active':
      return { variant: 'success', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Active' };
    case 'approved':
      return { variant: 'success', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Approved' };
    case 'completed':
      return { variant: 'success', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Completed' };
    case 'unlocked':
      return { variant: 'success', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Unlocked' };
    case 'pending':
      return { variant: 'warning', icon: <Clock className="h-3 w-3" />, label: 'Pending' };
    case 'processing':
      return { variant: 'warning', icon: <Loader2 className="h-3 w-3 animate-spin" />, label: 'Processing' };
    case 'rejected':
      return { variant: 'danger', icon: <XCircle className="h-3 w-3" />, label: 'Rejected' };
    case 'failed':
      return { variant: 'danger', icon: <XCircle className="h-3 w-3" />, label: 'Failed' };
    case 'cancelled':
      return { variant: 'danger', icon: <AlertTriangle className="h-3 w-3" />, label: 'Cancelled' };
    case 'matured':
      return { variant: 'info', icon: <Award className="h-3 w-3" />, label: 'Matured' };
    case 'locked':
      return { variant: 'neutral', icon: <Lock className="h-3 w-3" />, label: 'Locked' };
    default:
      return {
        variant: 'neutral',
        icon: null,
        label: status.charAt(0).toUpperCase() + status.slice(1),
      };
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { variant, icon, label } = getStatusConfig(status);
  return (
    <Badge variant={variant} className={className}>
      {icon}
      {label}
    </Badge>
  );
}
