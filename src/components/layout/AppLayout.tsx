// ========================================
// App Layout — Sidebar + Bottom Nav
// ========================================

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/api';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Coffee,
  Wallet,
  ArrowDownUp,
  Send,
  Users,
  Gift,
  Bell,
  User,
  LogOut,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  showInBottom?: boolean;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Home', icon: <LayoutDashboard className="h-5 w-5" />, showInBottom: true },
  { to: '/packages', label: 'Packages', icon: <Coffee className="h-5 w-5" />, showInBottom: true },
  { to: '/wallet', label: 'Wallet', icon: <Wallet className="h-5 w-5" />, showInBottom: true },
  { to: '/withdraw', label: 'Withdraw', icon: <Send className="h-5 w-5" />, showInBottom: true },
  { to: '/daily-income', label: 'Daily Income', icon: <Sun className="h-5 w-5" /> },
  { to: '/transactions', label: 'Transactions', icon: <ArrowDownUp className="h-5 w-5" /> },
  { to: '/referrals', label: 'Referrals', icon: <Users className="h-5 w-5" /> },
  { to: '/rewards', label: 'Rewards', icon: <Gift className="h-5 w-5" /> },
  { to: '/notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
  { to: '/profile', label: 'Profile', icon: <User className="h-5 w-5" />, showInBottom: true },
];

const bottomNavItems = navItems.filter((item) => item.showInBottom);

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-dvh gradient-bg">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-card border-b border-surface-800">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors focus-ring"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-brand-400">Buna Investors</span>
          <NavLink
            to="/notifications"
            className="p-2 -mr-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors focus-ring relative"
            aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
          >
            <Bell className="h-5 w-5" />
            {(unreadCount ?? 0) > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-danger-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount! > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-dvh w-64 bg-surface-950 border-r border-surface-800',
          'flex flex-col transition-transform duration-300',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-surface-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Coffee className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-surface-100">Buna Investors</p>
              <p className="text-[10px] text-surface-500">Investment Group</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-surface-400 hover:text-surface-200 transition-colors focus-ring"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  'focus-ring',
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
              {item.to === '/notifications' && (unreadCount ?? 0) > 0 && (
                <span className="ml-auto h-5 w-5 bg-danger-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount! > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-surface-800 p-3">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-9 w-9 rounded-full bg-surface-800 flex items-center justify-center">
              <User className="h-4 w-4 text-surface-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-surface-200 truncate">
                {user?.fullName || user?.phone || 'User'}
              </p>
              <p className="text-xs text-surface-500 truncate">{user?.phone}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-surface-400 hover:text-danger-500 hover:bg-danger-500/10 transition-colors focus-ring"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-dvh pb-20 lg:pb-0 pt-14 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom navigation (mobile) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-surface-800"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around px-2 h-16">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors min-w-[56px]',
                  'focus-ring',
                  isActive ? 'text-brand-400' : 'text-surface-500'
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
