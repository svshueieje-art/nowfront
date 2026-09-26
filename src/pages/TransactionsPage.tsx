// ========================================
// Transaction History Page — uses /wallet/transactions
// ========================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { walletApi } from '@/api';
import {
  Card,
  PageHeader,
  Pagination,
  EmptyState,
  ListSkeleton,
  Alert,
  Select,
} from '@/components/ui';
import { CurrencyDisplay } from '@/components/ui';
import {
  formatDateTime,
  getTransactionTypeLabel,
  isPositiveTransaction,
} from '@/lib/utils';
import {
  ArrowDownUp,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'REGISTRATION_BONUS', label: 'Registration Bonus' },
  { value: 'PURCHASE', label: 'Purchase' },
  { value: 'DAILY_CLAIM', label: 'Daily Income' },
  { value: 'REFERRAL_COMMISSION', label: 'Referral Commission' },
  { value: 'REWARD_CODE', label: 'Reward Code' },
  { value: 'WITHDRAWAL', label: 'Withdrawal' },
  { value: 'WITHDRAWAL_REVERSAL', label: 'Withdrawal Reversal' },
  { value: 'ADMIN_CREDIT', label: 'Admin Credit' },
  { value: 'ADMIN_DEBIT', label: 'Admin Debit' },
];

export function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['wallet', 'transactions', { page, limit, type: typeFilter || undefined }],
    queryFn: () =>
      walletApi.getTransactions({
        page,
        limit,
        type: typeFilter || undefined,
      }),
    staleTime: 15000,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Transactions" description="Your complete transaction history." />

      {/* Filter */}
      <div className="max-w-xs">
        <Select
          options={typeOptions}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <ListSkeleton rows={8} />
      ) : error ? (
        <Alert variant="error">Failed to load transactions.</Alert>
      ) : !data?.data.length ? (
        <EmptyState
          icon={<ArrowDownUp className="h-10 w-10" />}
          title="No transactions found"
          description={typeFilter ? 'Try changing the filter.' : 'Your transaction history will appear here.'}
        />
      ) : (
        <>
          <div className="space-y-2">
            {data.data.map((tx) => {
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
                        {formatDateTime(tx.createdAt)}
                      </p>
                      {tx.description && (
                        <p className="text-xs text-surface-500 truncate">{tx.description}</p>
                      )}
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

          {data.pagination && data.pagination.totalPages > 1 && (
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
