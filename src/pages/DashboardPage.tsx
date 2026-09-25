// ========================================
// Dashboard Page
// ========================================

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi } from '@/api';
import { Card, StatSkeleton, PageHeader } from '@/components/ui';
import { CurrencyDisplay } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import {
  Wallet,
  Coffee,
  Sun,
  Users,
  Send,
  Bell,
  ArrowRight,
  Lock,
  TrendingUp,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Alert, Button } from '@/components/ui';
import { clsx } from 'clsx';

export function DashboardPage() {
  const {
    data: dashboard,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboard,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Dashboard" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatSkeleton />
          <StatSkeleton />
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <Alert variant="error">
          Failed to load dashboard data. Please try refreshing the page.
        </Alert>
      </div>
    );
  }

  const { wallet, dailyIncome, packageSummary, referralSummary, pendingWithdrawalAmount, unreadNotifications } = dashboard;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Dashboard" description="Welcome back! Here's your overview." />

      {/* Wallet Overview */}
      <Card variant="glass" padding="lg" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 text-surface-400 mb-2">
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-medium">Available Balance</span>
          </div>
          <CurrencyDisplay amount={wallet.availableBalance} size="xl" />
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-surface-500" />
              <span className="text-surface-400">Locked Bonus:</span>
              <span className="text-surface-300">{formatCurrency(wallet.lockedBonus)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-success-500" />
              <span className="text-surface-400">Total Earned:</span>
              <span className="text-success-500">{formatCurrency(wallet.totalEarned)}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <Link to="/packages/buy">
              <Button size="sm" leftIcon={<Coffee className="h-4 w-4" />}>
                Buy Coffee
              </Button>
            </Link>
            <Link to="/withdraw">
              <Button variant="outline" size="sm" leftIcon={<Send className="h-4 w-4" />}>
                Withdraw
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Daily Income */}
        <Link to="/daily-income">
          <Card hoverable className="h-full">
            <div className="flex items-center gap-2 text-surface-400 mb-2">
              <Sun className="h-4 w-4 text-warning-500" />
              <span className="text-xs font-medium">Daily Income</span>
            </div>
            <p className="text-lg font-bold text-surface-100">
              {formatCurrency(dailyIncome.totalClaimableToday)}
            </p>
            <div className="mt-1.5">
              {dailyIncome.todayClaimed ? (
                <span className="inline-flex items-center gap-1 text-xs text-success-500">
                  <CheckCircle2 className="h-3 w-3" /> Claimed
                </span>
              ) : dailyIncome.canClaim ? (
                <span className="inline-flex items-center gap-1 text-xs text-warning-500 animate-pulse">
                  <Clock className="h-3 w-3" /> Available
                </span>
              ) : (
                <span className="text-xs text-surface-500">No claims</span>
              )}
            </div>
          </Card>
        </Link>

        {/* Active Packages */}
        <Link to="/packages">
          <Card hoverable className="h-full">
            <div className="flex items-center gap-2 text-surface-400 mb-2">
              <Coffee className="h-4 w-4 text-brand-500" />
              <span className="text-xs font-medium">Packages</span>
            </div>
            <p className="text-lg font-bold text-surface-100">
              {packageSummary.activeCount}
            </p>
            <p className="text-xs text-surface-500 mt-1">
              {formatCurrency(packageSummary.totalActiveInvestment)} invested
            </p>
          </Card>
        </Link>

        {/* Referrals */}
        <Link to="/referrals">
          <Card hoverable className="h-full">
            <div className="flex items-center gap-2 text-surface-400 mb-2">
              <Users className="h-4 w-4 text-info-500" />
              <span className="text-xs font-medium">Referrals</span>
            </div>
            <p className="text-lg font-bold text-surface-100">
              {referralSummary.referralCount}
            </p>
            <p className="text-xs text-success-500 mt-1">
              {formatCurrency(referralSummary.totalEarnings)} earned
            </p>
          </Card>
        </Link>

        {/* Withdrawals */}
        <Link to="/withdraw">
          <Card hoverable className="h-full">
            <div className="flex items-center gap-2 text-surface-400 mb-2">
              <Send className="h-4 w-4 text-surface-400" />
              <span className="text-xs font-medium">Pending</span>
            </div>
            <p className="text-lg font-bold text-surface-100">
              {formatCurrency(pendingWithdrawalAmount)}
            </p>
            <p className="text-xs text-surface-500 mt-1">withdrawal amount</p>
          </Card>
        </Link>
      </div>

      {/* Quick actions row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Claim Card */}
        {dailyIncome.canClaim && !dailyIncome.todayClaimed && (
          <Link to="/daily-income">
            <Card
              variant="bordered"
              hoverable
              className={clsx(
                'border-warning-500/30 bg-gradient-to-r from-warning-500/5 to-transparent'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-warning-500/15 flex items-center justify-center animate-pulse-glow">
                    <Sun className="h-5 w-5 text-warning-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-100">
                      Claim Today's Income
                    </p>
                    <p className="text-xs text-surface-400">
                      {formatCurrency(dailyIncome.totalClaimableToday)} available
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-surface-500" />
              </div>
            </Card>
          </Link>
        )}

        {/* Notifications */}
        {unreadNotifications > 0 && (
          <Link to="/notifications">
            <Card variant="bordered" hoverable>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-info-500/15 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-info-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-100">
                      {unreadNotifications} Unread Notification{unreadNotifications > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-surface-400">Tap to view</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-surface-500" />
              </div>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
