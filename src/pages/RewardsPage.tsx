// ========================================
// Rewards Page — Redeem Reward Codes
// ========================================

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { rewardsApi } from '@/api';
import { ApiError } from '@/api';
import { useToast } from '@/hooks/useToast';
import { Card, PageHeader, Button, Input, Alert } from '@/components/ui';
import { CurrencyDisplay } from '@/components/ui';
import { Gift, CheckCircle2, Sparkles } from 'lucide-react';

export function RewardsPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ amount: string; message: string } | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!code.trim()) {
      setError('Please enter a reward code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await rewardsApi.redeemCode(code.trim().toUpperCase());
      setResult({ amount: res.amount, message: res.message });
      setCode('');
      addToast({
        type: 'success',
        title: 'Reward Redeemed!',
        message: `${res.amount} ETB has been added to your wallet.`,
      });
      await queryClient.invalidateQueries({ queryKey: ['wallet'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to redeem reward code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Rewards"
        description="Enter a reward code to claim your bonus."
      />

      <div className="max-w-md mx-auto">
        <Card variant="glass" padding="lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand-500/15 mb-3">
              <Gift className="h-7 w-7 text-brand-400" />
            </div>
            <h2 className="text-lg font-semibold text-surface-100">Redeem Reward Code</h2>
            <p className="text-sm text-surface-400 mt-1">
              Enter your promo or reward code below
            </p>
          </div>

          <form onSubmit={handleRedeem} className="space-y-4">
            {error && <Alert variant="error">{error}</Alert>}

            {result && (
              <div className="text-center p-4 rounded-xl bg-success-500/10 border border-success-500/20">
                <CheckCircle2 className="h-8 w-8 text-success-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-success-500 mb-1">{result.message}</p>
                <CurrencyDisplay amount={parseFloat(result.amount)} size="lg" positive />
              </div>
            )}

            <Input
              label="Reward Code"
              placeholder="e.g. COFFEE100"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              leftIcon={<Sparkles className="h-4 w-4" />}
              disabled={isSubmitting}
              autoComplete="off"
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              leftIcon={<Gift className="h-4 w-4" />}
              size="lg"
            >
              Redeem Code
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
