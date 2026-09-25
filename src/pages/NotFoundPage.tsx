// ========================================
// 404 Not Found Page
// ========================================

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Home, Coffee } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-dvh gradient-bg flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-surface-800 mb-6">
          <Coffee className="h-10 w-10 text-surface-500" />
        </div>
        <h1 className="text-6xl font-bold text-surface-300 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-surface-200 mb-2">Page Not Found</h2>
        <p className="text-sm text-surface-400 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button leftIcon={<Home className="h-4 w-4" />} size="lg">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
