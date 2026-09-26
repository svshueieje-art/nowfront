// ========================================
// API Service Modules
// Aligned with backend routes as source of truth
// ========================================

import { apiClient } from './client';
import type {
  LoginRequest,
  RegisterRequest,
  User,
  CoffeePackage,
  UserPackage,
  WalletPurchaseRequest,
  PaymentMethodInfo,
  Purchase,
  Transaction,
  TransactionFilters,
  PaginatedResponse,
  ReferralInfo,
  WithdrawalRequest,
  WithdrawalFeeCalculation,
  Withdrawal,
  RewardRedemptionResult,
  Notification,
  ChangePasswordRequest,
  WalletBalance,
  DailyClaim,
  Referral,
  ReferralCommission,
} from '@/types';

// Helper to unwrap { success, data } responses
interface ApiWrapper<T> {
  success: boolean;
  data: T;
}

// ---- Auth (/api/v1/auth) ----
export const authApi = {
  register: async (data: RegisterRequest): Promise<User> => {
    const res = await apiClient.post<ApiWrapper<User>>('/auth/register', data);
    return res.data.data;
  },

  login: async (data: LoginRequest): Promise<User> => {
    const res = await apiClient.post<ApiWrapper<User>>('/auth/login', data);
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<ApiWrapper<User>>('/auth/me');
    return res.data.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.put('/auth/change-password', data);
  },
};

// ---- Packages (/api/v1/packages) ----
export const packagesApi = {
  getAvailablePackages: async (): Promise<CoffeePackage[]> => {
    const res = await apiClient.get<ApiWrapper<CoffeePackage[]>>('/packages');
    return res.data.data;
  },
};

// ---- Purchases (/api/v1/purchases) ----
export const purchasesApi = {
  purchaseWithWallet: async (data: WalletPurchaseRequest): Promise<Purchase> => {
    const res = await apiClient.post<ApiWrapper<Purchase>>('/purchases/wallet', data);
    return res.data.data;
  },

  createDirectPayment: async (data: FormData): Promise<Purchase> => {
    const res = await apiClient.post<ApiWrapper<Purchase>>(
      '/purchases/direct-payment',
      data,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      }
    );
    return res.data.data;
  },

  getMyPurchases: async (
    page = 1,
    limit = 20,
    status?: string
  ): Promise<PaginatedResponse<UserPackage>> => {
    const res = await apiClient.get<{ success: boolean; data: UserPackage[]; pagination: PaginatedResponse<UserPackage>['pagination'] }>(
      '/purchases',
      { params: { page, limit, status } }
    );
    return { data: res.data.data, pagination: res.data.pagination };
  },
};

// ---- Wallet (/api/v1/wallet) ----
export const walletApi = {
  getBalance: async (): Promise<WalletBalance> => {
    const res = await apiClient.get<ApiWrapper<WalletBalance>>('/wallet/balance');
    return res.data.data;
  },

  getTransactions: async (
    filters?: TransactionFilters
  ): Promise<PaginatedResponse<Transaction>> => {
    const res = await apiClient.get<{ success: boolean; data: Transaction[]; pagination: PaginatedResponse<Transaction>['pagination'] }>(
      '/wallet/transactions',
      { params: filters }
    );
    return { data: res.data.data, pagination: res.data.pagination };
  },
};

// ---- Daily Claims (/api/v1/claims) ----
export const claimsApi = {
  getEligibleClaims: async (): Promise<DailyClaim[]> => {
    const res = await apiClient.get<ApiWrapper<DailyClaim[]>>('/claims/eligible');
    return res.data.data;
  },

  claimDailyIncome: async (purchaseId: string): Promise<DailyClaim> => {
    const res = await apiClient.post<ApiWrapper<DailyClaim>>('/claims', { purchaseId });
    return res.data.data;
  },

  getClaimHistory: async (
    purchaseId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<DailyClaim>> => {
    const res = await apiClient.get<{ success: boolean; data: DailyClaim[]; pagination: PaginatedResponse<DailyClaim>['pagination'] }>(
      `/claims/history/${purchaseId}`,
      { params: { page, limit } }
    );
    return { data: res.data.data, pagination: res.data.pagination };
  },
};

// ---- Referrals (/api/v1/referrals) ----
export const referralsApi = {
  getReferralInfo: async (): Promise<ReferralInfo> => {
    const res = await apiClient.get<ApiWrapper<ReferralInfo>>('/referrals/info');
    return res.data.data;
  },

  getReferrals: async (
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Referral>> => {
    const res = await apiClient.get<{ success: boolean; data: Referral[]; pagination: PaginatedResponse<Referral>['pagination'] }>(
      '/referrals',
      { params: { page, limit } }
    );
    return { data: res.data.data, pagination: res.data.pagination };
  },

  getCommissions: async (
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<ReferralCommission>> => {
    const res = await apiClient.get<{ success: boolean; data: ReferralCommission[]; pagination: PaginatedResponse<ReferralCommission>['pagination'] }>(
      '/referrals/commissions',
      { params: { page, limit } }
    );
    return { data: res.data.data, pagination: res.data.pagination };
  },
};

// ---- Withdrawals (/api/v1/withdrawals) ----
export const withdrawalsApi = {
  previewWithdrawal: async (amount: string): Promise<WithdrawalFeeCalculation> => {
    const res = await apiClient.post<ApiWrapper<WithdrawalFeeCalculation>>(
      '/withdrawals/preview',
      { amount }
    );
    return res.data.data;
  },

  requestWithdrawal: async (data: WithdrawalRequest): Promise<Withdrawal> => {
    const res = await apiClient.post<ApiWrapper<Withdrawal>>('/withdrawals', data);
    return res.data.data;
  },

  getMyWithdrawals: async (
    page = 1,
    limit = 20,
    status?: string
  ): Promise<PaginatedResponse<Withdrawal>> => {
    const res = await apiClient.get<{ success: boolean; data: Withdrawal[]; pagination: PaginatedResponse<Withdrawal>['pagination'] }>(
      '/withdrawals',
      { params: { page, limit, status } }
    );
    return { data: res.data.data, pagination: res.data.pagination };
  },
};

// ---- Reward Codes (/api/v1/rewards) ----
export const rewardsApi = {
  redeemCode: async (code: string): Promise<RewardRedemptionResult> => {
    const res = await apiClient.post<ApiWrapper<RewardRedemptionResult>>(
      '/rewards/redeem',
      { code }
    );
    return res.data.data;
  },
};

// ---- Notifications (/api/v1/notifications) ----
export const notificationsApi = {
  getNotifications: async (
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Notification>> => {
    const res = await apiClient.get<{ success: boolean; data: Notification[]; pagination: PaginatedResponse<Notification>['pagination'] }>(
      '/notifications',
      { params: { page, limit } }
    );
    return { data: res.data.data, pagination: res.data.pagination };
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<ApiWrapper<{ unreadCount: number }>>('/notifications/unread-count');
    return res.data.data.unreadCount;
  },
};

// ---- Payment Methods (/api/v1/payment-methods) ----
export const paymentMethodsApi = {
  getPaymentMethods: async (): Promise<PaymentMethodInfo[]> => {
    const res = await apiClient.get<ApiWrapper<PaymentMethodInfo[]>>('/payment-methods');
    return res.data.data;
  },
};
