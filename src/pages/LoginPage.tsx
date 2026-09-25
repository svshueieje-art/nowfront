// ========================================
// Login Page
// ========================================

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/api';
import { Button, Input, Alert } from '@/components/ui';
import { Phone, Lock, Coffee } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Basic client validation
    if (!phoneNumber.trim()) {
      setFieldErrors({ phoneNumber: 'Phone number is required' });
      return;
    }
    if (!password) {
      setFieldErrors({ password: 'Password is required' });
      return;
    }

    setIsLoading(true);
    try {
      await login({ phone: phoneNumber.trim(), password });
      addToast({ type: 'success', title: 'Welcome back!' });
      navigate(from, { replace: true });
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
          <h1 className="text-2xl font-bold text-surface-100">Welcome Back</h1>
          <p className="text-sm text-surface-400 mt-1">Sign in to your account</p>
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors['password']}
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="current-password"
            disabled={isLoading}
          />

          <Button type="submit" fullWidth isLoading={isLoading} size="lg">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-surface-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}
