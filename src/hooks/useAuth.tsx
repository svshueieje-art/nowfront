// ========================================
// Authentication Context
// ========================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '@/api';
import type { User, LoginRequest, RegisterRequest } from '@/types';
import { ApiError } from '@/api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (error) {
      if (error instanceof ApiError && error.isAuthError) {
        setUser(null);
      }
      // Silently ignore other errors during session check
    }
  }, []);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const userData = await authApi.getMe();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    void checkSession();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const userData = await authApi.login(data);
    setUser(userData);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const userData = await authApi.register(data);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if logout fails server-side, clear local state
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
