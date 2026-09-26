// ========================================
// Buy Coffee Page — Purchase Flow
// ========================================

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { packagesApi, purchasesApi, walletApi, paymentMethodsApi } from '@/api';
import { ApiError } from '@/api';
import { useToast } from '@/hooks/useToast';
import {
  Card,
  PageHeader,
  Button,
  Alert,
  FileUpload,
  CardSkeleton,
  EmptyState,
  Select,
} from '@/components/ui';
import { CurrencyDisplay } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Coffee, Wallet, CreditCard, CheckCircle2, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import type { CoffeePackage } from '@/types';

type Step = 'select' | 'payment-method' | 'wallet-confirm' | 'direct-payment' | 'success';

export function BuyCoffeePage() {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('package');
  const navigate = useNavigate();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>(preselectedId ? 'payment-method' : 'select');
  const [selectedPackage, setSelectedPackage] = useState<CoffeePackage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');

  const { data: packages, isLoading: loadingPackages } = useQuery({
    queryKey: ['packages', 'available'],
    queryFn: packagesApi.getAvailablePackages,
    staleTime: 60000,
  });

  const { data: wallet } = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: walletApi.getBalance,
    staleTime: 15000,
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: paymentMethodsApi.getPaymentMethods,
    enabled: step === 'direct-payment',
  });

  // Handle preselected package
  useEffect(() => {
    if (preselectedId && packages) {
      const pkg = packages.find((p) => p.id === preselectedId);
      if (pkg) {
        setSelectedPackage(pkg);
        setStep('payment-method');
      }
    }
  }, [preselectedId, packages]);

  const handleSelectPackage = (pkg: CoffeePackage) => {
    setSelectedPackage(pkg);
    setStep('payment-method');
    setError('');
  };

  const handleWalletPurchase = async () => {
    if (!selectedPackage) return;
    setIsSubmitting(true);
    setError('');
    try {
      await purchasesApi.purchaseWithWallet({ packageId: selectedPackage.id });
      await queryClient.invalidateQueries({ queryKey: ['wallet'] });
      await queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setStep('success');
      addToast({ type: 'success', title: 'Coffee purchased successfully!' });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to complete purchase. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectPayment = async () => {
    if (!selectedPackage || !selectedAccountId) return;
    setIsSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('packageId', selectedPackage.id);
      formData.append('amountPaid', selectedPackage.price);
      formData.append('paymentAccountId', selectedAccountId);
      if (selectedPaymentMethodId) {
        formData.append('paymentMethodId', selectedPaymentMethodId);
      }
      if (paymentProof) {
        formData.append('paymentProof', paymentProof);
      }

      await purchasesApi.createDirectPayment(formData);
      await queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setStep('success');
      addToast({
        type: 'success',
        title: 'Payment submitted',
        message: 'Your payment is being reviewed. You will be notified once approved.',
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to submit payment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const walletBalance = wallet ? parseFloat(wallet.availableBalance) : 0;
  const packagePrice = selectedPackage ? parseFloat(selectedPackage.price) : 0;
  const canAfford = walletBalance >= packagePrice;

  // Build payment account options from methods
  const accountOptions = (paymentMethods ?? []).flatMap((m) =>
    m.accounts.map((acc) => ({
      value: acc.id,
      label: `${m.displayName || m.name} — ${acc.accountNumber} (${acc.accountName})`,
      methodId: m.id,
    }))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Buy Coffee"
        description={step === 'select' ? 'Choose a package to invest in.' : undefined}
        action={
          step !== 'select' && step !== 'success' ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => {
                if (step === 'payment-method') setStep('select');
                else setStep('payment-method');
                setError('');
              }}
            >
              Back
            </Button>
          ) : undefined
        }
      />

      {/* Step 1: Select Package */}
      {step === 'select' && (
        <div>
          {loadingPackages ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CardSkeleton count={6} />
            </div>
          ) : !packages?.length ? (
            <EmptyState
              icon={<Coffee className="h-12 w-12" />}
              title="No packages available"
              description="Check back later for new coffee packages."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => handleSelectPackage(pkg)}
                  className="text-left focus-ring rounded-xl transition-all duration-200"
                >
                  <Card hoverable variant="bordered" className="h-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Coffee className="h-4 w-4 text-brand-400" />
                        <span className="text-sm font-semibold text-surface-100">
                          {pkg.name}
                        </span>
                      </div>
                      <span className="text-xs text-surface-500">VIP {pkg.vipLevel}</span>
                    </div>
                    <p className="text-lg font-bold text-surface-100 mb-1">
                      {formatCurrency(parseFloat(pkg.price))}
                    </p>
                    <p className="text-xs text-success-500">
                      {pkg.dailyIncomeRate}% daily for {pkg.durationDays} days
                    </p>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Payment Method */}
      {step === 'payment-method' && selectedPackage && (
        <div className="max-w-md mx-auto space-y-4">
          <Card variant="glass" padding="lg">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-500/15 mb-3">
                <Coffee className="h-6 w-6 text-brand-400" />
              </div>
              <h3 className="text-lg font-semibold text-surface-100">
                {selectedPackage.name}
              </h3>
              <CurrencyDisplay amount={packagePrice} size="lg" className="mt-1 block" />
            </div>
            <div className="space-y-2 text-sm border-t border-surface-800 pt-4">
              <div className="flex justify-between">
                <span className="text-surface-400">Daily Rate</span>
                <span className="text-success-500">{selectedPackage.dailyIncomeRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Duration</span>
                <span className="text-surface-300">{selectedPackage.durationDays} days</span>
              </div>
            </div>
          </Card>

          <p className="text-sm font-medium text-surface-300 text-center">Choose payment method</p>

          <div className="space-y-3">
            <button
              onClick={() => setStep('wallet-confirm')}
              className={clsx(
                'w-full text-left focus-ring rounded-xl transition-all',
                !canAfford && 'opacity-60'
              )}
              disabled={!canAfford}
            >
              <Card hoverable variant="bordered">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-surface-100">Pay with Wallet</p>
                    <p className="text-xs text-surface-400">
                      Balance: {formatCurrency(walletBalance)}
                      {!canAfford && ' (Insufficient)'}
                    </p>
                  </div>
                </div>
              </Card>
            </button>

            <button
              onClick={() => setStep('direct-payment')}
              className="w-full text-left focus-ring rounded-xl"
            >
              <Card hoverable variant="bordered">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-info-500/15 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-info-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-surface-100">Direct Payment</p>
                    <p className="text-xs text-surface-400">
                      Bank transfer with payment proof
                    </p>
                  </div>
                </div>
              </Card>
            </button>
          </div>
        </div>
      )}

      {/* Step 3a: Wallet Confirmation */}
      {step === 'wallet-confirm' && selectedPackage && wallet && (
        <div className="max-w-md mx-auto space-y-4">
          <Card variant="glass" padding="lg">
            <h3 className="text-lg font-semibold text-surface-100 mb-4">Confirm Purchase</h3>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-400">Package</span>
                <span className="text-surface-100 font-medium">{selectedPackage.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Price</span>
                <span className="text-surface-100 font-medium">{formatCurrency(packagePrice)}</span>
              </div>
              <div className="h-px bg-surface-800" />
              <div className="flex justify-between">
                <span className="text-surface-400">Wallet Balance</span>
                <span className="text-surface-100">{formatCurrency(walletBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">After Purchase</span>
                <span className="text-surface-300">
                  {formatCurrency(walletBalance - packagePrice)}
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setStep('payment-method');
                  setError('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={handleWalletPurchase}
                isLoading={isSubmitting}
              >
                Confirm Purchase
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Step 3b: Direct Payment */}
      {step === 'direct-payment' && selectedPackage && (
        <div className="max-w-md mx-auto space-y-4">
          <Card variant="glass" padding="lg">
            <h3 className="text-sm font-semibold text-surface-100 mb-4">Submit Payment Proof</h3>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            <Alert variant="info" className="mb-4">
              Send {formatCurrency(packagePrice)} to one of the accounts below, then upload your payment screenshot.
            </Alert>
            <div className="space-y-4">
              <Select
                label="Payment Account"
                options={accountOptions}
                value={selectedAccountId}
                onChange={(e) => {
                  setSelectedAccountId(e.target.value);
                  const opt = accountOptions.find((o) => o.value === e.target.value);
                  if (opt) setSelectedPaymentMethodId(opt.methodId);
                }}
                placeholder="Select payment account"
              />
              <FileUpload
                onFileSelect={setPaymentProof}
                selectedFile={paymentProof}
                label="Payment Screenshot"
              />
              <Button
                fullWidth
                onClick={handleDirectPayment}
                isLoading={isSubmitting}
                disabled={!paymentProof || !selectedAccountId}
              >
                Submit Payment
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Success */}
      {step === 'success' && (
        <div className="max-w-md mx-auto text-center py-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success-500/15 mb-4">
            <CheckCircle2 className="h-8 w-8 text-success-500" />
          </div>
          <h2 className="text-xl font-bold text-surface-100 mb-2">Purchase Submitted!</h2>
          <p className="text-sm text-surface-400 mb-6">
            {selectedPackage
              ? `Your ${selectedPackage.name} package has been processed.`
              : 'Your purchase has been processed.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/packages')}>
              View Packages
            </Button>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
      )}
    </div>
  );
}
