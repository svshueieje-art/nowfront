// ========================================
// Referrals Page — /referrals/info + /referrals
// ========================================

import { useQuery } from '@tanstack/react-query';
import { referralsApi } from '@/api';
import {
  Card,
  PageHeader,
  Button,
  Alert,
  EmptyState,
  ListSkeleton,
  StatSkeleton,
} from '@/components/ui';
import { CurrencyDisplay } from '@/components/ui';
import { formatDate, copyToClipboard, generateReferralLink } from '@/lib/utils';
import { Users, Copy, CheckCircle2, Link2, Share2 } from 'lucide-react';
import { useState } from 'react';

export function ReferralsPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: referralInfo, isLoading: loadingInfo, error: errorInfo } = useQuery({
    queryKey: ['referrals', 'info'],
    queryFn: referralsApi.getReferralInfo,
    staleTime: 30000,
  });

  const { data: referrals, isLoading: loadingReferrals } = useQuery({
    queryKey: ['referrals', 'list'],
    queryFn: () => referralsApi.getReferrals(1, 50),
    staleTime: 30000,
  });

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  if (loadingInfo) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Referrals" />
        <StatSkeleton />
        <ListSkeleton rows={5} />
      </div>
    );
  }

  if (errorInfo || !referralInfo) {
    return (
      <div className="space-y-6">
        <PageHeader title="Referrals" />
        <Alert variant="error">Failed to load referral information.</Alert>
      </div>
    );
  }

  const referralLink = generateReferralLink(referralInfo.referralCode);
  const totalEarnings = parseFloat(referralInfo.totalCommissionsEarned);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Referrals"
        description="Invite friends and earn 20% commission on their Coffee purchases."
      />

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card variant="glass">
          <div className="flex items-center gap-2 text-surface-400 mb-1">
            <Users className="h-4 w-4 text-info-500" />
            <span className="text-xs font-medium">Total Referrals</span>
          </div>
          <p className="text-2xl font-bold text-surface-100">{referralInfo.totalReferrals}</p>
        </Card>
        <Card variant="glass">
          <div className="flex items-center gap-2 text-surface-400 mb-1">
            <span className="text-xs font-medium">Total Earnings</span>
          </div>
          <CurrencyDisplay amount={totalEarnings} size="lg" positive={totalEarnings > 0} />
        </Card>
      </div>

      {/* Referral Code & Link */}
      <Card variant="bordered" padding="lg">
        <h3 className="text-sm font-semibold text-surface-100 mb-4 flex items-center gap-2">
          <Share2 className="h-4 w-4 text-brand-400" />
          Your Referral Info
        </h3>

        <div className="space-y-3">
          {/* Referral Code */}
          <div>
            <label className="text-xs text-surface-400 mb-1 block">Referral Code</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 bg-surface-800 rounded-lg border border-surface-700 text-sm font-mono text-surface-200">
                {referralInfo.referralCode}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(referralInfo.referralCode, 'code')}
                leftIcon={
                  copiedField === 'code' ? (
                    <CheckCircle2 className="h-4 w-4 text-success-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )
                }
              >
                {copiedField === 'code' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Referral Link */}
          <div>
            <label className="text-xs text-surface-400 mb-1 block">Referral Link</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 bg-surface-800 rounded-lg border border-surface-700 text-sm text-surface-300 truncate">
                {referralLink}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(referralLink, 'link')}
                leftIcon={
                  copiedField === 'link' ? (
                    <CheckCircle2 className="h-4 w-4 text-success-500" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )
                }
              >
                {copiedField === 'link' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>

        {/* Commission info */}
        <div className="mt-4 p-3 rounded-lg bg-brand-500/5 border border-brand-500/10">
          <p className="text-xs text-brand-400">
            <strong>20% Commission</strong> — You earn 20% of every Coffee package purchased by
            your referrals. Commissions are credited instantly to your wallet.
          </p>
        </div>
      </Card>

      {/* Referral History */}
      <div>
        <h2 className="text-base font-semibold text-surface-100 mb-3">Referral History</h2>
        {loadingReferrals ? (
          <ListSkeleton rows={5} />
        ) : !referrals?.data?.length ? (
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="No referrals yet"
            description="Share your referral code with friends to start earning commissions."
          />
        ) : (
          <div className="space-y-2">
            {referrals.data.map((ref) => (
              <Card key={ref.id} variant="bordered" padding="sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-surface-200">
                      {ref.fullName || ref.phone}
                    </p>
                    <p className="text-xs text-surface-500">
                      {ref.totalPurchases} purchases • Joined {formatDate(ref.joinedAt)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
