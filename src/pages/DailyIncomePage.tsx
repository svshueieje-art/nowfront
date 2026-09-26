// ========================================
// Daily Income Page — /claims/eligible + /claims
// ========================================

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { claimsApi } from '@/api';
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
import { formatCurrency } from '@/lib/utils';
import { Sun, Coffee, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DailyIncomePage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());

  const {
    data: eligibleClaims,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['claims', 'eligible'],
    queryFn: claimsApi.getEligibleClaims,
    staleTime: 15000,
  });

  const handleClaim = async (purchaseId: string) => {
    setIsClaiming(true);
    try {
      const result = await claimsApi.claimDailyIncome(purchaseId);
      addToast({
        type: 'success',
        title: 'Income Claimed!',
        message: `${formatCurrency(parseFloat(result.amount))} has been added to your wallet.`,
      });
      setClaimedIds((prev) => new Set(prev).add(purchaseId));
      await queryClient.invalidateQueries({ queryKey: ['claims'] });
      await queryClient.invalidateQueries({ queryKey: ['wallet'] });
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

  const claims = eligibleClaims ?? [];
  const unclaimedCount = claims.filter((c) => !claimedIds.has(c.purchaseId)).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Daily Income" description="Claim your daily earnings from active packages." />

      {/* Claim Summary */}
      {claims.length > 0 && (
        <Card variant="glass" padding="lg" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-warning-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-surface-400 mb-1">
                <Sun className="h-4 w-4 text-warning-500" />
                <span className="text-sm font-medium">Eligible Claims</span>
              </div>
              <p className="text-2xl font-bold text-surface-100">
                {unclaimedCount} package{unclaimedCount !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-surface-400 mt-1">
                Ready to claim daily income
              </p>
            </div>
            <div className="flex-shrink-0">
              {unclaimedCount === 0 ? (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-success-500/10 border border-success-500/20">
                  <CheckCircle2 className="h-5 w-5 text-success-500" />
                  <span className="text-sm font-medium text-success-500">
                    All claimed!
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-warning-500/10 border border-warning-500/20">
                  <Clock className="h-5 w-5 text-warning-500" />
                  <span className="text-sm font-medium text-warning-500">
                    {unclaimedCount} available
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Package Income Details */}
      {claims.length === 0 ? (
        <EmptyState
          icon={<Coffee className="h-12 w-12" />}
          title="No eligible claims"
          description="Purchase a Coffee package to start earning daily income."
          action={
            <Link to="/packages/buy">
              <Button leftIcon={<Coffee className="h-4 w-4" />}>Buy Coffee</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-surface-100">Eligible Packages</h2>
          {claims.map((claim) => {
            const alreadyClaimed = claimedIds.has(claim.purchaseId);
            return (
              <Card key={claim.purchaseId || claim.id} variant="bordered">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                      <Coffee className="h-5 w-5 text-brand-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-surface-100">
                        {claim.packageName || 'Package'}
                      </h3>
                      <p className="text-xs text-surface-500">
                        {formatCurrency(parseFloat(claim.amount))} available
                      </p>
                    </div>
                  </div>
                  <div>
                    {alreadyClaimed ? (
                      <div className="flex items-center gap-1.5 text-success-500">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Claimed</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleClaim(claim.purchaseId)}
                        isLoading={isClaiming}
                        leftIcon={<Sun className="h-4 w-4" />}
                      >
                        Claim
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
