// ========================================
// Daily Income Page
// ========================================

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { claimsApi, packagesApi } from '@/api';
import { ApiError } from '@/api';
import { useToast } from '@/hooks/useToast';
import {
  Card,
  PageHeader,
  Button,
  Alert,
  EmptyState,
  CardSkeleton,
} from '@/components/ui';
import { CurrencyDisplay } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Sun, Coffee, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DailyIncomePage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [isClaiming, setIsClaiming] = useState(false);

  const {
    data: myPackages,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['packages', 'my'],
    queryFn: packagesApi.getMyPackages,
    staleTime: 15000,
  });

  const activePackages = myPackages?.filter((p) => p.status === 'active') ?? [];
  const canClaim = activePackages.some((p) => p.canClaimToday && !p.todayClaimed);
  const allClaimed = activePackages.length > 0 && activePackages.every((p) => p.todayClaimed);
  const totalClaimable = activePackages
    .filter((p) => p.canClaimToday && !p.todayClaimed)
    .reduce((sum, p) => sum + p.dailyIncome, 0);

  const handleClaimAll = async () => {
    setIsClaiming(true);
    try {
      const result = await claimsApi.claimDailyIncome();
      addToast({
        type: 'success',
        title: 'Income Claimed!',
        message: `${formatCurrency(result.totalClaimed)} has been added to your wallet.`,
      });
      await queryClient.invalidateQueries({ queryKey: ['packages'] });
      await queryClient.invalidateQueries({ queryKey: ['wallet'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (err) {
      if (err instanceof ApiError) {
        addToast({ type: 'error', title: 'Claim Failed', message: err.message });
      } else {
        addToast({ type: 'error', title: 'Claim Failed', message: 'An unexpected error occurred.' });
      }
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Daily Income" />
        <CardSkeleton count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Daily Income" />
        <Alert variant="error">Failed to load daily income data.</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Daily Income" description="Claim your daily earnings from active packages." />

      {/* Claim Summary */}
      {activePackages.length > 0 && (
        <Card variant="glass" padding="lg" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-warning-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-surface-400 mb-1">
                <Sun className="h-4 w-4 text-warning-500" />
                <span className="text-sm font-medium">Today's Income</span>
              </div>
              <CurrencyDisplay amount={totalClaimable} size="xl" />
              <p className="text-xs text-surface-400 mt-1">
                From {activePackages.filter((p) => p.canClaimToday && !p.todayClaimed).length} active package(s)
              </p>
            </div>
            <div className="flex-shrink-0">
              {allClaimed ? (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-success-500/10 border border-success-500/20">
                  <CheckCircle2 className="h-5 w-5 text-success-500" />
                  <span className="text-sm font-medium text-success-500">
                    Today&apos;s income claimed
                  </span>
                </div>
              ) : canClaim ? (
                <Button
                  size="lg"
                  onClick={handleClaimAll}
                  isLoading={isClaiming}
                  leftIcon={<Sun className="h-5 w-5" />}
                  className="animate-pulse-glow"
                >
                  Claim Today&apos;s Income
                </Button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-800 border border-surface-700">
                  <Clock className="h-5 w-5 text-surface-500" />
                  <span className="text-sm font-medium text-surface-400">No claims available</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Package Income Details */}
      {activePackages.length === 0 ? (
        <EmptyState
          icon={<Coffee className="h-12 w-12" />}
          title="No active packages"
          description="Purchase a Coffee package to start earning daily income."
          action={
            <Link to="/packages/buy">
              <Button leftIcon={<Coffee className="h-4 w-4" />}>Buy Coffee</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-surface-100">Active Packages</h2>
          {activePackages.map((pkg) => (
            <Card key={pkg.id} variant="bordered">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                    <Coffee className="h-5 w-5 text-brand-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-surface-100">
                      {pkg.packageName}
                    </h3>
                    <p className="text-xs text-surface-500">
                      {formatCurrency(pkg.dailyIncome)}/day • {pkg.remainingDays} days left
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pl-13 sm:pl-0">
                  {pkg.todayClaimed ? (
                    <div className="flex items-center gap-1.5 text-success-500">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Claimed</span>
                    </div>
                  ) : pkg.canClaimToday ? (
                    <div className="flex items-center gap-1.5 text-warning-500">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Available</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-surface-500">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Not available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="mt-3 pt-3 border-t border-surface-800">
                <div className="grid grid-cols-3 gap-4 text-center text-xs mb-2">
                  <div>
                    <p className="text-surface-500">Claimed</p>
                    <p className="text-sm font-semibold text-success-500">{pkg.claimedDays} days</p>
                  </div>
                  <div>
                    <p className="text-surface-500">Missed</p>
                    <p className="text-sm font-semibold text-danger-500">{pkg.missedDays} days</p>
                  </div>
                  <div>
                    <p className="text-surface-500">Remaining</p>
                    <p className="text-sm font-semibold text-surface-300">{pkg.remainingDays} days</p>
                  </div>
                </div>
                <div className="h-2 bg-surface-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-success-500 h-full transition-all"
                    style={{
                      width: `${(pkg.claimedDays / (pkg.claimedDays + pkg.missedDays + pkg.remainingDays)) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-danger-500/60 h-full transition-all"
                    style={{
                      width: `${(pkg.missedDays / (pkg.claimedDays + pkg.missedDays + pkg.remainingDays)) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-surface-500 mt-1">
                  <span>Total Claimed: {formatCurrency(pkg.totalClaimedIncome)}</span>
                  {pkg.maturityDate && <span>Matures: {formatDate(pkg.maturityDate)}</span>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
