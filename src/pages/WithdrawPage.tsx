// ========================================
// Withdrawals Page
// ========================================

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { withdrawalsApi, walletApi } from '@/api';
import { ApiError } from '@/api';
import { useToast } from '@/hooks/useToast';
import {
  Card,
  PageHeader,
  Button,
  Input,
  Select,
  Alert,
  Modal,
  EmptyState,
  ListSkeleton,
  StatusBadge,
  StatSkeleton,
} from '@/components/ui';
import { CurrencyDisplay } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Send, Wallet } from 'lucide-react';
import type { WithdrawalFeeCalculation, WithdrawalMethod } from '@/types';

export function WithdrawPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [feeCalc, setFeeCalc] = useState<WithdrawalFeeCalculation | null>(null);

  const { data: wallet, isLoading: loadingWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getWallet,
    staleTime: 15000,
  });

  const { data: methods, isLoading: loadingMethods } = useQuery({
    queryKey: ['withdrawal-methods'],
    queryFn: withdrawalsApi.getMethods,
    staleTime: 60000,
  });

  const { data: withdrawals, isLoading: loadingHistory } = useQuery({
    queryKey: ['withdrawals', 'my'],
    queryFn: withdrawalsApi.getMyWithdrawals,
    staleTime: 15000,
  });

  const methodOptions = (methods ?? [])
    .filter((m) => m.enabled)
    .map((m) => ({ value: m.id, label: m.name }));

  const handlePreview = async () => {
    setError('');
    setFieldErrors({});
    const errors: Record<string, string> = {};

    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errors['amount'] = 'Enter a valid amount';
    }
    if (!method) {
      errors['method'] = 'Select a payment method';
    }
    if (!accountNumber.trim()) {
      errors['accountNumber'] = 'Account number is required';
    }
    if (!accountName.trim()) {
      errors['accountName'] = 'Account name is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const calc = await withdrawalsApi.calculateFee(parsedAmount);
      setFeeCalc(calc);
      setShowConfirm(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to calculate withdrawal fee.');
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await withdrawalsApi.requestWithdrawal({
        amount: Number(amount),
        method: method as WithdrawalMethod,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
      });
      addToast({
        type: 'success',
        title: 'Withdrawal Requested',
        message: 'Your withdrawal is being processed.',
      });
      setShowConfirm(false);
      setAmount('');
      setMethod('');
      setAccountNumber('');
      setAccountName('');
      setFeeCalc(null);
      await queryClient.invalidateQueries({ queryKey: ['wallet'] });
      await queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.errors) {
          const mapped: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(err.errors)) {
            mapped[key] = msgs[0] ?? '';
          }
          setFieldErrors(mapped);
        }
      } else {
        setError('Failed to submit withdrawal request.');
      }
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Withdraw" description="Request a withdrawal to your bank account." />

      {/* Balance */}
      {loadingWallet ? (
        <StatSkeleton />
      ) : wallet ? (
        <Card variant="glass">
          <div className="flex items-center gap-2 text-surface-400 mb-1">
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-medium">Available Balance</span>
          </div>
          <CurrencyDisplay amount={wallet.availableBalance} size="lg" />
        </Card>
      ) : null}

      {/* Withdrawal Form */}
      <Card variant="bordered" padding="lg">
        <h3 className="text-sm font-semibold text-surface-100 mb-4">Request Withdrawal</h3>
        {error && <Alert variant="error" className="mb-4">{error}</Alert>}
        <div className="space-y-4">
          <Input
            label="Amount (ETB)"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={fieldErrors['amount']}
            min={1}
            disabled={isSubmitting}
          />
          <Select
            label="Payment Method"
            options={methodOptions}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="Select payment method"
            error={fieldErrors['method']}
            disabled={isSubmitting || loadingMethods}
          />
          <Input
            label="Account Number"
            type="text"
            placeholder="Enter account number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            error={fieldErrors['accountNumber']}
            disabled={isSubmitting}
          />
          <Input
            label="Account Name"
            type="text"
            placeholder="Enter account holder name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            error={fieldErrors['accountName']}
            disabled={isSubmitting}
          />
          <Button
            fullWidth
            onClick={handlePreview}
            isLoading={isSubmitting}
            leftIcon={<Send className="h-4 w-4" />}
          >
            Review Withdrawal
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Withdrawal"
        size="sm"
      >
        {feeCalc && (
          <div className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-400">Requested Amount</span>
                <span className="text-surface-100 font-medium">
                  {formatCurrency(feeCalc.grossAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Fee</span>
                <span className="text-danger-500">
                  -{formatCurrency(feeCalc.fee)}
                </span>
              </div>
              {feeCalc.feeDescription && (
                <p className="text-xs text-surface-500">{feeCalc.feeDescription}</p>
              )}
              <div className="h-px bg-surface-700" />
              <div className="flex justify-between">
                <span className="text-surface-300 font-medium">You will receive</span>
                <span className="text-surface-100 font-bold text-base">
                  {formatCurrency(feeCalc.netAmount)}
                </span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button fullWidth onClick={handleSubmit} isLoading={isSubmitting}>
                Confirm
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Withdrawal History */}
      <div>
        <h2 className="text-base font-semibold text-surface-100 mb-3">Withdrawal History</h2>
        {loadingHistory ? (
          <ListSkeleton rows={5} />
        ) : !withdrawals?.length ? (
          <EmptyState
            icon={<Send className="h-10 w-10" />}
            title="No withdrawals yet"
            description="Your withdrawal history will appear here."
          />
        ) : (
          <div className="space-y-2">
            {withdrawals.map((w) => (
              <Card key={w.id} variant="bordered" padding="sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-surface-200">
                        {formatCurrency(w.amount)}
                      </p>
                      <StatusBadge status={w.status} />
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {w.methodName} • {w.accountNumber} • {formatDate(w.createdAt)}
                    </p>
                    {w.rejectionReason && (
                      <p className="text-xs text-danger-500 mt-1">{w.rejectionReason}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-surface-500">Net</p>
                    <p className="text-sm font-semibold text-surface-200">
                      {formatCurrency(w.netAmount)}
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
