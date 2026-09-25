// ========================================
// Transaction History Page
// ========================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '@/api';
import {
  Card,
  PageHeader,
  Pagination,
  EmptyState,
  ListSkeleton,
  Alert,
  StatusBadge,
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
import type { TransactionType } from '@/types';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'registration_bonus', label: 'Registration Bonus' },
  { value: 'coffee_purchase', label: 'Coffee Purchase' },
  { value: 'daily_income', label: 'Daily Income' },
  { value: 'referral_commission', label: 'Referral Commission' },
  { value: 'promo_reward', label: 'Promo Reward' },
  { value: 'withdrawal_hold', label: 'Withdrawal Hold' },
  { value: 'withdrawal_completed', label: 'Withdrawal' },
  { value: 'withdrawal_refund', label: 'Withdrawal Refund' },
  { value: 'admin_adjustment', label: 'Adjustment' },
  { value: 'refund', label: 'Refund' },
];

export function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', { page, limit, type: typeFilter || undefined }],
    queryFn: () =>
      transactionsApi.getTransactions({
        page,
        limit,
        type: (typeFilter as TransactionType) || undefined,
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
          placeholder="Filter by type"
        />
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <ListSkeleton rows={10} />
      ) : error ? (
        <Alert variant="error">Failed to load transactions.</Alert>
      ) : !data?.data.length ? (
        <EmptyState
          icon={<ArrowDownUp className="h-12 w-12" />}
          title="No transactions yet"
          description="Your transaction history will appear here once you start using the platform."
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
                      className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
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
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-surface-200 truncate">
                          {getTransactionTypeLabel(tx.type)}
                        </p>
                        {tx.status !== 'completed' && <StatusBadge status={tx.status} />}
                      </div>
                      <p className="text-xs text-surface-500 mt-0.5">
                        {formatDateTime(tx.createdAt)}
                      </p>
                      {tx.description && (
                        <p className="text-xs text-surface-500 mt-0.5 truncate">
                          {tx.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <CurrencyDisplay
                        amount={tx.amount}
                        size="sm"
                        positive={positive}
                        negative={!positive}
                      />
                      {tx.reference && (
                        <p className="text-[10px] text-surface-600 mt-0.5">
                          Ref: {tx.reference}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {data.pagination.totalPages > 1 && (
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </div>
  );
}
