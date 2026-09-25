// ========================================
// Buy Coffee Page — Purchase Flow
// ========================================

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { packagesApi, purchasesApi, walletApi } from '@/api';
import { ApiError } from '@/api';
import { useToast } from '@/hooks/useToast';
import {
  Card,
  PageHeader,
  Button,
  Alert,
  FileUpload,
  Input,
  CardSkeleton,
  EmptyState,
} from '@/components/ui';
import { CurrencyDisplay } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Coffee, Wallet, CreditCard, CheckCircle2, ArrowLeft, Copy } from 'lucide-react';
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
  const [paymentReference, setPaymentReference] = useState('');
  const [copiedField, setCopiedField] = useState('');

  const { data: packages, isLoading: loadingPackages } = useQuery({
    queryKey: ['packages', 'available'],
    queryFn: packagesApi.getAvailablePackages,
    staleTime: 60000,
  });

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletApi.getWallet,
    staleTime: 15000,
  });

  const { data: paymentInfo } = useQuery({
    queryKey: ['payment-info'],
    queryFn: purchasesApi.getPaymentAccountInfo,
    enabled: step === 'direct-payment',
  });

  // Handle preselected package
  useState(() => {
    if (preselectedId && packages) {
      const pkg = packages.find((p) => p.id === preselectedId);
      if (pkg) {
        setSelectedPackage(pkg);
        setStep('payment-method');
      }
    }
  });

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
      await queryClient.invalidateQueries({ queryKey: ['packages'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
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
    if (!selectedPackage) return;
    setIsSubmitting(true);
    setError('');
    try {
      const purchase = await purchasesApi.createDirectPayment({
        packageId: selectedPackage.id,
        amount: selectedPackage.price,
        paymentReference: paymentReference.trim() || undefined,
      });
      if (paymentProof) {
        await purchasesApi.uploadPaymentProof(purchase.id, paymentProof);
      }
      await queryClient.invalidateQueries({ queryKey: ['packages'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const canAfford = wallet && selectedPackage ? wallet.availableBalance >= selectedPackage.price : false;

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
              {packages
                .filter((p) => p.status === 'available')
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((pkg) => (
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
                        {formatCurrency(pkg.price)}
                      </p>
                      <p className="text-xs text-success-500">
                        {formatCurrency(pkg.dailyIncome)}/day for {pkg.duration} days
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
              <CurrencyDisplay amount={selectedPackage.price} size="lg" className="mt-1 block" />
            </div>
            <div className="space-y-2 text-sm border-t border-surface-800 pt-4">
              <div className="flex justify-between">
                <span className="text-surface-400">Daily Income</span>
                <span className="text-success-500">{formatCurrency(selectedPackage.dailyIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Duration</span>
                <span className="text-surface-300">{selectedPackage.duration} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Total Return</span>
                <span className="text-success-500 font-medium">
                  {formatCurrency(selectedPackage.dailyIncome * selectedPackage.duration)}
                </span>
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
                      Balance: {wallet ? formatCurrency(wallet.availableBalance) : '...'}
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
                <span className="text-surface-100 font-medium">{formatCurrency(selectedPackage.price)}</span>
              </div>
              <div className="h-px bg-surface-800" />
              <div className="flex justify-between">
                <span className="text-surface-400">Wallet Balance</span>
                <span className="text-surface-100">{formatCurrency(wallet.availableBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">After Purchase</span>
                <span className="text-surface-300">
                  {formatCurrency(wallet.availableBalance - selectedPackage.price)}
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
          {/* Payment Info */}
          {paymentInfo && (
            <Card variant="bordered" padding="lg">
              <h3 className="text-sm font-semibold text-surface-100 mb-3">Payment Details</h3>
              <div className="space-y-3">
                <InfoRow label="Bank" value={paymentInfo.bankName} />
                <InfoRow
                  label="Account Name"
                  value={paymentInfo.accountName}
                  copyable
                  onCopy={() => handleCopy(paymentInfo.accountName, 'accountName')}
                  copied={copiedField === 'accountName'}
                />
                <InfoRow
                  label="Account Number"
                  value={paymentInfo.accountNumber}
                  copyable
                  onCopy={() => handleCopy(paymentInfo.accountNumber, 'accountNumber')}
                  copied={copiedField === 'accountNumber'}
                />
                <InfoRow
                  label="Amount"
                  value={formatCurrency(selectedPackage.price)}
                  copyable
                  onCopy={() => handleCopy(String(selectedPackage.price), 'amount')}
                  copied={copiedField === 'amount'}
                />
              </div>
              {paymentInfo.instructions && (
                <p className="text-xs text-surface-500 mt-3 pt-3 border-t border-surface-800">
                  {paymentInfo.instructions}
                </p>
              )}
            </Card>
          )}

          <Card variant="glass" padding="lg">
            <h3 className="text-sm font-semibold text-surface-100 mb-4">Submit Payment Proof</h3>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            <Alert variant="info" className="mb-4">
              Your payment will be reviewed by an administrator before the package becomes active.
            </Alert>
            <div className="space-y-4">
              <Input
                label="Payment Reference (Optional)"
                placeholder="Transaction ID or reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                disabled={isSubmitting}
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
                disabled={!paymentProof}
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

// Helper sub-component
function InfoRow({
  label,
  value,
  copyable,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-surface-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-surface-100 font-medium">{value}</span>
        {copyable && onCopy && (
          <button
            onClick={onCopy}
            className="p-1 rounded text-surface-500 hover:text-brand-400 transition-colors focus-ring"
            aria-label={`Copy ${label}`}
            type="button"
          >
            {copied ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
