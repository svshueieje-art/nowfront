// ========================================
// Application Router
// ========================================

import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ToastProvider } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui';
import { PageLoader } from '@/components/ui';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const PackagesPage = lazy(() => import('@/pages/PackagesPage').then((m) => ({ default: m.PackagesPage })));
const BuyCoffeePage = lazy(() => import('@/pages/BuyCoffeePage').then((m) => ({ default: m.BuyCoffeePage })));
const WalletPage = lazy(() => import('@/pages/WalletPage').then((m) => ({ default: m.WalletPage })));
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage').then((m) => ({ default: m.TransactionsPage })));
const DailyIncomePage = lazy(() => import('@/pages/DailyIncomePage').then((m) => ({ default: m.DailyIncomePage })));
const ReferralsPage = lazy(() => import('@/pages/ReferralsPage').then((m) => ({ default: m.ReferralsPage })));
const WithdrawPage = lazy(() => import('@/pages/WithdrawPage').then((m) => ({ default: m.WithdrawPage })));
const RewardsPage = lazy(() => import('@/pages/RewardsPage').then((m) => ({ default: m.RewardsPage })));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Guest-only route (redirect authenticated users to dashboard)
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        {/* Protected routes with layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="packages" element={<PackagesPage />} />
          <Route path="packages/buy" element={<BuyCoffeePage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="daily-income" element={<DailyIncomePage />} />
          <Route path="referrals" element={<ReferralsPage />} />
          <Route path="withdraw" element={<WithdrawPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <ToastContainer />
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
