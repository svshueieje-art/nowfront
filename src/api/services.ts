// ========================================
// API Service Modules
// ========================================

import { apiClient } from './client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  DashboardData,
  Wallet,
  CoffeePackage,
  UserPackage,
  WalletPurchaseRequest,
  DirectPaymentRequest,
  PaymentAccountInfo,
  Purchase,
  Transaction,
  TransactionFilters,
  PaginatedResponse,
  ClaimResult,
  ReferralInfo,
  WithdrawalMethodInfo,
  WithdrawalRequest,
  WithdrawalFeeCalculation,
  Withdrawal,
  RewardRedemptionRequest,
  RewardRedemptionResult,
  Notification,
  ChangePasswordRequest,
} from '@/types';

// ---- Auth ----
export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<{ user: User }>('/auth/me');
    return res.data.user;
  },
};

// ---- Dashboard ----
export const dashboardApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const res = await apiClient.get<DashboardData>('/dashboard');
    return res.data;
  },
};

// ---- Wallet ----
export const walletApi = {
  getWallet: async (): Promise<Wallet> => {
    const res = await apiClient.get<Wallet>('/wallet');
    return res.data;
  },
};

// ---- Packages ----
export const packagesApi = {
  getAvailablePackages: async (): Promise<CoffeePackage[]> => {
    const res = await apiClient.get<{ packages: CoffeePackage[] }>('/packages');
    return res.data.packages;
  },

  getMyPackages: async (): Promise<UserPackage[]> => {
    const res = await apiClient.get<{ packages: UserPackage[] }>('/packages/my');
    return res.data.packages;
  },

  getPackageById: async (id: string): Promise<UserPackage> => {
    const res = await apiClient.get<{ package: UserPackage }>(`/packages/my/${id}`);
    return res.data.package;
  },
};

// ---- Purchases ----
export const purchasesApi = {
  purchaseWithWallet: async (data: WalletPurchaseRequest): Promise<Purchase> => {
    const res = await apiClient.post<{ purchase: Purchase }>('/purchases/wallet', data);
    return res.data.purchase;
  },

  createDirectPayment: async (data: DirectPaymentRequest): Promise<Purchase> => {
    const res = await apiClient.post<{ purchase: Purchase }>('/purchases/direct', data);
    return res.data.purchase;
  },

  uploadPaymentProof: async (purchaseId: string, file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('proof', file);
    const res = await apiClient.post<{ url: string }>(
      `/purchases/${purchaseId}/proof`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      }
    );
    return res.data;
  },

  getPaymentAccountInfo: async (): Promise<PaymentAccountInfo> => {
    const res = await apiClient.get<PaymentAccountInfo>('/purchases/payment-info');
    return res.data;
  },

  getMyPurchases: async (): Promise<Purchase[]> => {
    const res = await apiClient.get<{ purchases: Purchase[] }>('/purchases/my');
    return res.data.purchases;
  },
};

// ---- Transactions ----
export const transactionsApi = {
  getTransactions: async (
    filters?: TransactionFilters
  ): Promise<PaginatedResponse<Transaction>> => {
    const res = await apiClient.get<PaginatedResponse<Transaction>>('/transactions', {
      params: filters,
    });
    return res.data;
  },
};

// ---- Daily Claims ----
export const claimsApi = {
  claimDailyIncome: async (): Promise<ClaimResult> => {
    const res = await apiClient.post<ClaimResult>('/claims/daily');
    return res.data;
  },

  getClaimHistory: async (
    userPackageId?: string
  ): Promise<PaginatedResponse<import('@/types').DailyClaim>> => {
    const res = await apiClient.get<PaginatedResponse<import('@/types').DailyClaim>>(
      '/claims/history',
      {
        params: userPackageId ? { userPackageId } : undefined,
      }
    );
    return res.data;
  },
};

// ---- Referrals ----
export const referralsApi = {
  getReferralInfo: async (): Promise<ReferralInfo> => {
    const res = await apiClient.get<ReferralInfo>('/referrals');
    return res.data;
  },
};

// ---- Withdrawals ----
export const withdrawalsApi = {
  getMethods: async (): Promise<WithdrawalMethodInfo[]> => {
    const res = await apiClient.get<{ methods: WithdrawalMethodInfo[] }>(
      '/withdrawals/methods'
    );
    return res.data.methods;
  },

  calculateFee: async (amount: number): Promise<WithdrawalFeeCalculation> => {
    const res = await apiClient.get<WithdrawalFeeCalculation>('/withdrawals/calculate-fee', {
      params: { amount },
    });
    return res.data;
  },

  requestWithdrawal: async (data: WithdrawalRequest): Promise<Withdrawal> => {
    const res = await apiClient.post<{ withdrawal: Withdrawal }>('/withdrawals', data);
    return res.data.withdrawal;
  },

  getMyWithdrawals: async (): Promise<Withdrawal[]> => {
    const res = await apiClient.get<{ withdrawals: Withdrawal[] }>('/withdrawals/my');
    return res.data.withdrawals;
  },
};

// ---- Reward Codes ----
export const rewardsApi = {
  redeemCode: async (data: RewardRedemptionRequest): Promise<RewardRedemptionResult> => {
    const res = await apiClient.post<RewardRedemptionResult>('/rewards/redeem', data);
    return res.data;
  },
};

// ---- Notifications ----
export const notificationsApi = {
  getNotifications: async (
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Notification>> => {
    const res = await apiClient.get<PaginatedResponse<Notification>>('/notifications', {
      params: { page, limit },
    });
    return res.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return res.data.count;
  },
};

// ---- Profile ----
export const profileApi = {
  getProfile: async (): Promise<User> => {
    const res = await apiClient.get<{ user: User }>('/profile');
    return res.data.user;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/profile/change-password', data);
    return res.data;
  },
};
