// ========================================
// Registration Page
// ========================================

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/api';
import { Button, Input, Alert } from '@/components/ui';
import { Phone, Lock, Users, Coffee } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState(refCode);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors: Record<string, string> = {};

    if (!phoneNumber.trim()) {
      errors['phoneNumber'] = 'Phone number is required';
    }
    if (!password) {
      errors['password'] = 'Password is required';
    } else if (password.length < 6) {
      errors['password'] = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      errors['confirmPassword'] = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await register({
        phone: phoneNumber.trim(),
        password,
        referralCode: referralCode.trim() || undefined,
      });
      addToast({
        type: 'success',
        title: 'Account created!',
        message: 'Welcome to Buna Investors Group. You earned a 100 ETB registration bonus!',
        duration: 8000,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const mapped: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(err.errors)) {
            mapped[key] = msgs[0] ?? '';
          }
          setFieldErrors(mapped);
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh gradient-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 mb-4 shadow-lg shadow-brand-500/20">
            <Coffee className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-100">Create Account</h1>
          <p className="text-sm text-surface-400 mt-1">Join Buna Investors Group today</p>
        </div>

        {/* Bonus banner */}
        <div className="mb-4 rounded-xl bg-gradient-to-r from-brand-600/20 to-brand-500/10 border border-brand-500/20 p-3 text-center">
          <p className="text-sm font-medium text-brand-400">
            🎉 Get <span className="font-bold">100 ETB</span> registration bonus!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <Input
            label="Phone Number"
            type="tel"
            placeholder="09XXXXXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            error={fieldErrors['phoneNumber']}
            leftIcon={<Phone className="h-4 w-4" />}
            autoComplete="tel"
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors['password']}
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            hint="Must be at least 6 characters"
            disabled={isLoading}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors['confirmPassword']}
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            disabled={isLoading}
          />

          <Input
            label="Referral Code (Optional)"
            type="text"
            placeholder="Enter referral code"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            error={fieldErrors['referralCode']}
            leftIcon={<Users className="h-4 w-4" />}
            disabled={isLoading}
          />

          <Button type="submit" fullWidth isLoading={isLoading} size="lg">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-surface-400 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
