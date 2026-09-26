// ========================================
// Domain Types — Buna Investors Group
// Aligned with backend response shapes
// ========================================

// ---- User (from /auth/me) ----
export interface User {
  id: string;
  phone: string;
  fullName?: string;
  referralCode: string;
  bonusStatus: 'locked' | 'unlocked' | 'claimed';
  isActive: boolean;
  createdAt: string;
  wallet?: {
    availableBalance: string;
    lockedBalance: string;
  } | null;
  stats?: {
    totalReferrals: number;
    totalPurchases: number;
  };
}

// ---- Auth ----
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  fullName?: string;
  referralCode?: string;
}

// ---- Wallet Balance (from /wallet/balance) ----
export interface WalletBalance {
  availableBalance: string;
  lockedBalance: string;
  totalEarned?: string;
}

// ---- Coffee Packages (from /packages) ----
export interface CoffeePackage {
  id: string;
  name: string;
  vipLevel: number;
  price: string;
  dailyIncomeRate: string;
  durationDays: number;
  description?: string;
}

// ---- User Packages / Purchases (from /purchases) ----
export type PurchaseStatus = 'PENDING_PAYMENT' | 'PENDING_ACTIVATION' | 'ACTIVE' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export interface UserPackage {
  id: string;
  snapshotName: string;
  purchasePrice: string;
  status: PurchaseStatus;
  activationDate?: string | null;
  firstClaimDate?: string | null;
  maturityDate?: string | null;
  createdAt: string;
}

export interface Purchase {
  id: string;
  packageName: string;
  price: string;
  status: PurchaseStatus;
  activationDate?: string | null;
  firstClaimDate?: string | null;
  maturityDate?: string | null;
}

// ---- Purchase / Payment ----
export type PaymentMethod = 'wallet' | 'direct';

export interface WalletPurchaseRequest {
  packageId: string;
  idempotencyKey?: string;
}

export interface DirectPaymentRequest {
  packageId: string;
  amountPaid: string;
  paymentAccountId: string;
  paymentMethodId?: string;
  idempotencyKey?: string;
}

export interface PaymentMethodInfo {
  id: string;
  name: string;
  displayName: string;
  instructions?: string;
  accounts: PaymentAccount[];
}

export interface PaymentAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  instructions?: string;
  displayOrder: number;
}

// ---- Transactions (from /wallet/transactions) ----
export type TransactionType =
  | 'REGISTRATION_BONUS'
  | 'PURCHASE'
  | 'DAILY_CLAIM'
  | 'REFERRAL_COMMISSION'
  | 'REWARD_CODE'
  | 'WITHDRAWAL'
  | 'WITHDRAWAL_REVERSAL'
  | 'ADMIN_CREDIT'
  | 'ADMIN_DEBIT';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  description: string;
  createdAt: string;
}

export interface TransactionFilters {
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ---- Daily Claims (from /claims) ----
export interface DailyClaim {
  id: string;
  purchaseId: string;
  day?: number;
  amount: string;
  claimedAt: string;
  packageName?: string;
}

// ---- Referrals (from /referrals) ----
export interface Referral {
  id: string;
  phone: string;
  fullName?: string;
  totalPurchases: number;
  joinedAt: string;
}

export interface ReferralInfo {
  referralCode: string;
  referredBy?: { phone: string; fullName?: string } | null;
  totalReferrals: number;
  totalCommissionsEarned: string;
  totalCommissionCount: number;
}

export interface ReferralCommission {
  id: string;
  purchaseAmount: string;
  commissionRate: string;
  commissionAmount: string;
  packageName: string;
  createdAt: string;
}

// ---- Withdrawals (from /withdrawals) ----
export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export interface WithdrawalRequest {
  amount: string;
  paymentMethodId: string;
  accountNumber: string;
  accountName: string;
  idempotencyKey?: string;
}

export interface WithdrawalFeeCalculation {
  grossAmount: string;
  feeAmount: string;
  feeRate: string;
  netAmount: string;
}

export interface Withdrawal {
  id: string;
  grossAmount: string;
  feeAmount: string;
  netAmount: string;
  status: WithdrawalStatus;
  createdAt: string;
}

// ---- Reward Codes (from /rewards) ----
export interface RewardRedemptionResult {
  amount: string;
  message: string;
}

// ---- Notifications (from /notifications) ----
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ---- Pagination ----
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---- API Errors ----
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

// ---- Password Change ----
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
