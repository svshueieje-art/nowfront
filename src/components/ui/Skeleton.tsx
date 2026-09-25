// ========================================
// Skeleton / Loading Components
// ========================================

import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={clsx('skeleton', className)} />
      ))}
    </>
  );
}

// Page loading spinner
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        <p className="text-sm text-surface-400">Loading...</p>
      </div>
    </div>
  );
}

// Card skeleton
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface-900 rounded-xl border border-surface-800 p-5 space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </>
  );
}

// Stat card skeleton
export function StatSkeleton() {
  return (
    <div className="bg-surface-900 rounded-xl border border-surface-800 p-4 space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-28" />
    </div>
  );
}

// List skeleton
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-surface-900 rounded-lg border border-surface-800"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}
