// ========================================
// Dashboard Page — built from /auth/me + /claims/eligible
// ========================================

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { claimsApi, notificationsApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, StatSkeleton, PageHeader, Alert, Button, CurrencyDisplay } from '@/components/ui';
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
  Clock,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();

  const { data: eligibleClaims, isLoading: claimsLoading } = useQuery({
    queryKey: ['claims', 'eligible'],
    queryFn: claimsApi.getEligibleClaims,
    staleTime: 30000,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    staleTime: 30000,
  });

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <Alert variant="error">Failed to load dashboard data. Please try refreshing the page.</Alert>
      </div>
    );
  }

  const availableBalance = user.wallet?.availableBalance || '0.00';
  const lockedBalance = user.wallet?.lockedBalance || '0.00';
  const totalReferrals = user.stats?.totalReferrals || 0;
  const totalPurchases = user.stats?.totalPurchases || 0;
  const hasEligibleClaims = eligibleClaims && eligibleClaims.length > 0;

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
          <CurrencyDisplay amount={parseFloat(availableBalance)} size="xl" />
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-surface-500" />
              <span className="text-surface-400">Locked:</span>
              <span className="text-surface-300">{formatCurrency(parseFloat(lockedBalance))}</span>
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
            {claimsLoading ? (
              <StatSkeleton />
            ) : (
              <>
                <p className="text-lg font-bold text-surface-100">
                  {eligibleClaims?.length || 0} packages
                </p>
                <div className="mt-1.5">
                  {hasEligibleClaims ? (
                    <span className="inline-flex items-center gap-1 text-xs text-warning-500 animate-pulse">
                      <Clock className="h-3 w-3" /> Claims available
                    </span>
                  ) : (
                    <span className="text-xs text-surface-500">No claims</span>
                  )}
                </div>
              </>
            )}
          </Card>
        </Link>

        {/* Packages */}
        <Link to="/packages">
          <Card hoverable className="h-full">
            <div className="flex items-center gap-2 text-surface-400 mb-2">
              <Coffee className="h-4 w-4 text-brand-500" />
              <span className="text-xs font-medium">Purchases</span>
            </div>
            <p className="text-lg font-bold text-surface-100">
              {totalPurchases}
            </p>
            <p className="text-xs text-surface-500 mt-1">total packages</p>
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
              {totalReferrals}
            </p>
            <p className="text-xs text-surface-500 mt-1">people referred</p>
          </Card>
        </Link>

        {/* Bonus Status */}
        <Link to="/profile">
          <Card hoverable className="h-full">
            <div className="flex items-center gap-2 text-surface-400 mb-2">
              <TrendingUp className="h-4 w-4 text-success-500" />
              <span className="text-xs font-medium">Bonus</span>
            </div>
            <p className="text-lg font-bold text-surface-100 capitalize">
              {user.bonusStatus}
            </p>
            <p className="text-xs text-surface-500 mt-1">100 ETB bonus</p>
          </Card>
        </Link>
      </div>

      {/* Quick actions row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Claim Card */}
        {hasEligibleClaims && (
          <Link to="/daily-income">
            <Card
              variant="bordered"
              hoverable
              className="border-warning-500/30 bg-gradient-to-r from-warning-500/5 to-transparent"
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
                      {eligibleClaims.length} package{eligibleClaims.length > 1 ? 's' : ''} ready
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-surface-500" />
              </div>
            </Card>
          </Link>
        )}

        {/* Notifications */}
        {(unreadCount ?? 0) > 0 && (
          <Link to="/notifications">
            <Card variant="bordered" hoverable>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-info-500/15 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-info-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-100">
                      {unreadCount} Unread Notification{(unreadCount ?? 0) > 1 ? 's' : ''}
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
