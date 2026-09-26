// ========================================
// Profile Page
// ========================================

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { authApi } from '@/api';
import { ApiError } from '@/api';
import {
  Card,
  PageHeader,
  Button,
  Input,
  Alert,
  StatusBadge,
} from '@/components/ui';
import { formatDate, copyToClipboard } from '@/lib/utils';
import {
  User,
  Phone,
  Calendar,
  Shield,
  Lock,
  Copy,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [copiedRef, setCopiedRef] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!currentPassword) errors['currentPassword'] = 'Current password is required';
    if (!newPassword) errors['newPassword'] = 'New password is required';
    else if (newPassword.length < 6) errors['newPassword'] = 'Must be at least 6 characters';
    if (newPassword !== confirmNewPassword)
      errors['confirmNewPassword'] = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      addToast({ type: 'success', title: 'Password changed successfully' });
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const mapped: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(err.errors)) {
            mapped[key] = msgs[0] ?? '';
          }
          setFieldErrors(mapped);
        } else {
          setPasswordError(err.message);
        }
      } else {
        setPasswordError('Failed to change password.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCopyReferral = async () => {
    if (user?.referralCode) {
      await copyToClipboard(user.referralCode);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Profile" description="Manage your account information." />

      {/* Profile Info */}
      <Card variant="glass" padding="lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-surface-100">
              {user.fullName || 'Customer'}
            </h2>
            <p className="text-sm text-surface-400">{user.phone}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50">
            <Phone className="h-4 w-4 text-surface-500" />
            <div>
              <p className="text-xs text-surface-500">Phone Number</p>
              <p className="text-sm text-surface-200">{user.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50">
            <Shield className="h-4 w-4 text-surface-500" />
            <div className="flex-1">
              <p className="text-xs text-surface-500">Referral Code</p>
              <p className="text-sm text-surface-200 font-mono">{user.referralCode}</p>
            </div>
            <button
              onClick={handleCopyReferral}
              className="p-1.5 rounded text-surface-400 hover:text-brand-400 transition-colors focus-ring"
              aria-label="Copy referral code"
            >
              {copiedRef ? (
                <CheckCircle2 className="h-4 w-4 text-success-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50">
            <Lock className="h-4 w-4 text-surface-500" />
            <div className="flex-1">
              <p className="text-xs text-surface-500">Registration Bonus</p>
              <p className="text-sm text-surface-200">100 ETB</p>
            </div>
            <StatusBadge status={user.bonusStatus} />
          </div>

          {user.createdAt && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50">
              <Calendar className="h-4 w-4 text-surface-500" />
              <div>
                <p className="text-xs text-surface-500">Member Since</p>
                <p className="text-sm text-surface-200">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Change Password */}
      <Card variant="bordered" padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-surface-100 flex items-center gap-2">
            <Lock className="h-4 w-4 text-surface-400" />
            Password
          </h3>
          {!showChangePassword && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChangePassword(true)}
            >
              Change Password
            </Button>
          )}
        </div>

        {showChangePassword && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordError && <Alert variant="error">{passwordError}</Alert>}
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={fieldErrors['currentPassword']}
              autoComplete="current-password"
              disabled={isChangingPassword}
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={fieldErrors['newPassword']}
              autoComplete="new-password"
              hint="Must be at least 6 characters"
              disabled={isChangingPassword}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              error={fieldErrors['confirmNewPassword']}
              autoComplete="new-password"
              disabled={isChangingPassword}
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordError('');
                  setFieldErrors({});
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                }}
                disabled={isChangingPassword}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isChangingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Logout */}
      <Card variant="bordered">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-left p-1 text-danger-500 hover:text-danger-400 transition-colors focus-ring rounded-lg"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </Card>
    </div>
  );
}
