// ========================================
// Packages Page — Available & My Packages
// ========================================

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { packagesApi } from '@/api';
import {
  Card,
  PageHeader,
  StatusBadge,
  EmptyState,
  Button,
  CardSkeleton,
  Alert,
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Coffee, ShoppingCart, ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

type TabType = 'available' | 'my-packages';

export function PackagesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('available');

  const {
    data: availablePackages,
    isLoading: loadingAvailable,
    error: errorAvailable,
  } = useQuery({
    queryKey: ['packages', 'available'],
    queryFn: packagesApi.getAvailablePackages,
    staleTime: 60000,
  });

  const {
    data: myPackages,
    isLoading: loadingMy,
    error: errorMy,
  } = useQuery({
    queryKey: ['packages', 'my'],
    queryFn: packagesApi.getMyPackages,
    staleTime: 30000,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Coffee Packages"
        description="Invest in premium coffee packages and earn daily returns."
        action={
          <Link to="/packages/buy">
            <Button leftIcon={<ShoppingCart className="h-4 w-4" />}>Buy Coffee</Button>
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-900 rounded-lg border border-surface-800 w-fit">
        {(['available', 'my-packages'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus-ring',
              activeTab === tab
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-surface-400 hover:text-surface-200'
            )}
          >
            {tab === 'available' ? 'Available' : 'My Packages'}
          </button>
        ))}
      </div>

      {/* Available Packages */}
      {activeTab === 'available' && (
        <div>
          {loadingAvailable ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CardSkeleton count={6} />
            </div>
          ) : errorAvailable ? (
            <Alert variant="error">Failed to load available packages.</Alert>
          ) : !availablePackages?.length ? (
            <EmptyState
              icon={<Coffee className="h-12 w-12" />}
              title="No packages available"
              description="Check back later for new coffee packages."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availablePackages
                .filter((p) => p.status === 'available')
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((pkg) => (
                  <Card key={pkg.id} hoverable variant="bordered">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 flex items-center justify-center border border-brand-500/20">
                          <Coffee className="h-5 w-5 text-brand-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-surface-100">
                            {pkg.name}
                          </h3>
                          <p className="text-xs text-surface-500">
                            VIP {pkg.vipLevel}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={pkg.status} />
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-400">Price</span>
                        <span className="font-semibold text-surface-100">
                          {formatCurrency(pkg.price)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-400">Daily Income</span>
                        <span className="text-success-500 font-medium">
                          {formatCurrency(pkg.dailyIncome)}/day
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-400">Duration</span>
                        <span className="text-surface-300">{pkg.duration} days</span>
                      </div>
                      {pkg.description && (
                        <p className="text-xs text-surface-500 pt-1">{pkg.description}</p>
                      )}
                    </div>
                    <Link to={`/packages/buy?package=${pkg.id}`}>
                      <Button
                        variant="primary"
                        fullWidth
                        size="sm"
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                      >
                        Buy Now
                      </Button>
                    </Link>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      {/* My Packages */}
      {activeTab === 'my-packages' && (
        <div>
          {loadingMy ? (
            <div className="space-y-3">
              <CardSkeleton count={3} />
            </div>
          ) : errorMy ? (
            <Alert variant="error">Failed to load your packages.</Alert>
          ) : !myPackages?.length ? (
            <EmptyState
              icon={<Coffee className="h-12 w-12" />}
              title="You don't have any Coffee packages yet"
              description="Purchase your first package to start earning daily income."
              action={
                <Link to="/packages/buy">
                  <Button leftIcon={<ShoppingCart className="h-4 w-4" />}>
                    Buy Your First Coffee
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {myPackages.map((pkg) => (
                <Card key={pkg.id} variant="bordered" hoverable>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/10 flex items-center justify-center border border-brand-500/20 flex-shrink-0">
                        <Coffee className="h-5 w-5 text-brand-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-surface-100">
                            {pkg.packageName}
                          </h3>
                          <StatusBadge status={pkg.status} />
                        </div>
                        <p className="text-xs text-surface-500 mt-0.5">
                          {formatCurrency(pkg.price)} • VIP {pkg.vipLevel}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm pl-14 sm:pl-0">
                      {pkg.status === 'active' && (
                        <>
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="h-3.5 w-3.5 text-success-500" />
                            <span className="text-surface-400">Earned:</span>
                            <span className="text-success-500 font-medium">
                              {formatCurrency(pkg.totalClaimedIncome)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-surface-500" />
                            <span className="text-surface-400">{pkg.remainingDays}d left</span>
                          </div>
                        </>
                      )}
                      {pkg.activationDate && (
                        <span className="text-xs text-surface-500">
                          Started {formatDate(pkg.activationDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Progress bar for active packages */}
                  {pkg.status === 'active' && (
                    <div className="mt-3 pt-3 border-t border-surface-800">
                      <div className="flex items-center justify-between text-xs text-surface-400 mb-1.5">
                        <span>
                          {pkg.claimedDays} claimed • {pkg.missedDays} missed
                        </span>
                        <span>{pkg.remainingDays} remaining</span>
                      </div>
                      <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500"
                          style={{
                            width: `${((pkg.claimedDays + pkg.missedDays) / (pkg.claimedDays + pkg.missedDays + pkg.remainingDays)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {pkg.rejectionReason && (
                    <Alert variant="error" className="mt-3">
                      {pkg.rejectionReason}
                    </Alert>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
