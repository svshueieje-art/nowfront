// ========================================
// Domain Types — Buna Investors Group
// ========================================

// ---- User ----
export interface User {
  id: string;
  phoneNumber: string;
  fullName?: string;
  referralCode: string;
  registrationBonusStatus: 'locked' | 'unlocked' | 'claimed';
  registrationBonusAmount: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Auth ----
export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

// ---- Wallet ----
export interface Wallet {
  availableBalance: number;
  lockedBonus: number;
  totalEarned: number;
  pendingWithdrawals: number;
}

// ---- Dashboard ----
export interface DashboardData {
  wallet: Wallet;
  dailyIncome: DailyIncomeStatus;
  packageSummary: PackageSummary;
  referralSummary: ReferralSummary;
  pendingWithdrawalAmount: number;
  unreadNotifications: number;
}

export interface DailyIncomeStatus {
  canClaim: boolean;
  todayClaimed: boolean;
  todayAmount: number;
  activePackages: number;
  totalClaimableToday: number;
}

export interface PackageSummary {
  activeCount: number;
  totalActiveInvestment: number;
  maturedCount: number;
  totalPackages: number;
}

export interface ReferralSummary {
  totalEarnings: number;
  referralCount: number;
}

// ---- Coffee Packages ----
export type PackageStatus = 'available' | 'disabled' | 'coming_soon';
export type PurchaseStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
export type UserPackageStatus = 'pending' | 'active' | 'matured' | 'rejected' | 'cancelled';

export interface CoffeePackage {
  id: string;
  name: string;
  vipLevel: number;
  price: number;
  dailyIncome: number;
  duration: number;
  description?: string;
  status: PackageStatus;
  displayOrder: number;
}

export interface UserPackage {
  id: string;
  packageId: string;
  packageName: string;
  vipLevel: number;
  price: number;
  dailyIncome: number;
  purchaseDate: string;
  activationDate: string | null;
  maturityDate: string | null;
  claimedDays: number;
  missedDays: number;
  totalClaimedIncome: number;
  remainingDays: number;
  status: UserPackageStatus;
  canClaimToday: boolean;
  todayClaimed: boolean;
  rejectionReason?: string;
}

// ---- Purchase / Payment ----
export type PaymentMethod = 'wallet' | 'direct';

export interface WalletPurchaseRequest {
  packageId: string;
}

export interface DirectPaymentRequest {
  packageId: string;
  amount: number;
  paymentReference?: string;
}

export interface PaymentAccountInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions?: string;
}

export interface Purchase {
  id: string;
  packageId: string;
  packageName: string;
  vipLevel: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Transactions ----
export type TransactionType =
  | 'registration_bonus'
  | 'coffee_purchase'
  | 'daily_income'
  | 'referral_commission'
  | 'promo_reward'
  | 'withdrawal_hold'
  | 'withdrawal_completed'
  | 'withdrawal_refund'
  | 'admin_adjustment'
  | 'refund';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  reference?: string;
  balanceAfter?: number;
  createdAt: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  page?: number;
  limit?: number;
}

// ---- Daily Claims ----
export interface DailyClaim {
  id: string;
  userPackageId: string;
  packageName: string;
  day: number;
  amount: number;
  claimedAt: string;
}

export interface ClaimResult {
  totalClaimed: number;
  claims: DailyClaim[];
  walletBalance: number;
}

// ---- Referrals ----
export interface Referral {
  id: string;
  referredUserPhone: string;
  commission: number;
  packageName: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  totalEarnings: number;
  referralCount: number;
  referrals: Referral[];
}

// ---- Withdrawals ----
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export type WithdrawalMethod = 'cbe' | 'boa' | 'awash' | 'dashen' | 'cbe_birr';

export interface WithdrawalMethodInfo {
  id: WithdrawalMethod;
  name: string;
  enabled: boolean;
}

export interface WithdrawalRequest {
  amount: number;
  method: WithdrawalMethod;
  accountNumber: string;
  accountName: string;
}

export interface WithdrawalFeeCalculation {
  grossAmount: number;
  fee: number;
  netAmount: number;
  feeDescription?: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  fee: number;
  netAmount: number;
  method: WithdrawalMethod;
  methodName: string;
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
}

// ---- Reward Codes ----
export interface RewardRedemptionRequest {
  code: string;
}

export interface RewardRedemptionResult {
  rewardAmount: number;
  message: string;
  walletBalance: number;
}

// ---- Notifications ----
export type NotificationType =
  | 'payment_approved'
  | 'payment_rejected'
  | 'coffee_activated'
  | 'daily_income'
  | 'withdrawal_completed'
  | 'withdrawal_rejected'
  | 'referral_commission'
  | 'reward_received'
  | 'system_announcement';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
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
  confirmNewPassword: string;
}
