// ========================================
// Wallet Page — uses /wallet/balance + /wallet/transactions
// ========================================

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { walletApi } from '@/api';
import {
  Card,
  PageHeader,
  Button,
  Alert,
  StatSkeleton,
  ListSkeleton,
  EmptyState,
} from '@/components/ui';
import { CurrencyDisplay } from '@/components/ui';
import { formatCurrency, formatRelativeTime, getTransactionTypeLabel, isPositiveTransaction } from '@/lib/utils';
import {
  Wallet as WalletIcon,
  Coffee,
  Send,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowDownUp,
} from 'lucide-react';

export function WalletPage() {
  const { data: wallet, isLoading: loadingWallet, error: walletError } = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: walletApi.getBalance,
    staleTime: 15000,
  });

  const { data: recentTx, isLoading: loadingTx } = useQuery({
    queryKey: ['wallet', 'transactions', { page: 1, limit: 10 }],
    queryFn: () => walletApi.getTransactions({ page: 1, limit: 10 }),
    staleTime: 15000,
  });

  if (loadingWallet) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Wallet" />
        <StatSkeleton />
        <ListSkeleton rows={5} />
      </div>
    );
  }

  if (walletError || !wallet) {
    return (
      <div className="space-y-6">
        <PageHeader title="Wallet" />
        <Alert variant="error">Failed to load wallet information.</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Wallet" />

      {/* Balance Card */}
      <Card variant="glass" padding="lg" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 text-surface-400 mb-1">
            <WalletIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Available Balance</span>
          </div>
          <CurrencyDisplay amount={parseFloat(wallet.availableBalance)} size="xl" />

          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-surface-800">
            <div>
              <div className="flex items-center gap-1.5 text-surface-500 mb-1">
                <Lock className="h-3.5 w-3.5" />
                <span className="text-xs">Locked Balance</span>
              </div>
              <p className="text-sm font-semibold text-surface-300">
                {formatCurrency(parseFloat(wallet.lockedBalance))}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <Link to="/packages/buy" className="flex-1">
              <Button fullWidth leftIcon={<Coffee className="h-4 w-4" />}>
                Buy Coffee
              </Button>
            </Link>
            <Link to="/withdraw" className="flex-1">
              <Button variant="outline" fullWidth leftIcon={<Send className="h-4 w-4" />}>
                Withdraw
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-surface-100">Recent Transactions</h2>
          <Link
            to="/transactions"
            className="text-sm text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            View All
          </Link>
        </div>

        {loadingTx ? (
          <ListSkeleton rows={5} />
        ) : !recentTx?.data.length ? (
          <EmptyState
            icon={<ArrowDownUp className="h-10 w-10" />}
            title="No transactions yet"
            description="Your transaction history will appear here."
          />
        ) : (
          <div className="space-y-2">
            {recentTx.data.map((tx) => {
              const positive = isPositiveTransaction(tx.type);
              return (
                <Card key={tx.id} variant="bordered" padding="sm">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        positive ? 'bg-success-500/10' : 'bg-danger-500/10'
                      }`}
                    >
                      {positive ? (
                        <ArrowDownLeft className="h-4 w-4 text-success-500" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-danger-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-200 truncate">
                        {getTransactionTypeLabel(tx.type)}
                      </p>
                      <p className="text-xs text-surface-500">
                        {formatRelativeTime(tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <CurrencyDisplay
                        amount={parseFloat(tx.amount)}
                        size="sm"
                        positive={positive}
                        negative={!positive}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
