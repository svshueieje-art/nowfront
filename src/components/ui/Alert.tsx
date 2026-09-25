// ========================================
// Alert Component
// ========================================

import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const variants: Record<AlertVariant, { icon: ReactNode; classes: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-success-500 flex-shrink-0" />,
    classes: 'bg-success-500/10 border-success-500/20 text-success-500',
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 text-danger-500 flex-shrink-0" />,
    classes: 'bg-danger-500/10 border-danger-500/20 text-danger-500',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-warning-500 flex-shrink-0" />,
    classes: 'bg-warning-500/10 border-warning-500/20 text-warning-500',
  },
  info: {
    icon: <Info className="h-5 w-5 text-info-500 flex-shrink-0" />,
    classes: 'bg-info-500/10 border-info-500/20 text-info-500',
  },
};

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const v = variants[variant];
  return (
    <div
      className={clsx('rounded-lg border p-4 flex gap-3', v.classes, className)}
      role="alert"
    >
      <div className="mt-0.5" aria-hidden="true">{v.icon}</div>
      <div className="min-w-0">
        {title && <p className="font-medium text-sm mb-0.5">{title}</p>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}
