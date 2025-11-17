'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/lib/api/authService';
import { User } from '@/lib/api/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  isAdmin: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Immediate localStorage restore on mount
  const initializeAuth = () => {
    try {
      const savedUser = localStorage.getItem('verita-user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
          setUser(parsedUser);
        }
      }
    } catch (error) {
      console.error('Failed to restore user from localStorage:', error);
      localStorage.removeItem('verita-user');
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  // Auto-restore session from localStorage and server validation
  useEffect(() => {
    const checkAuth = async () => {
      // First, try to restore from localStorage for immediate UI response
      const savedUser = localStorage.getItem('verita-user');
      let restoredUser = null;

      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // Validate user structure
          if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
            setUser(parsedUser);
            restoredUser = parsedUser;
          } else {
            localStorage.removeItem('verita-user');
          }
        } catch (error) {
          console.error('Failed to restore user session from localStorage:', error);
          localStorage.removeItem('verita-user');
        }
      }

      // Skip server validation for now to avoid 404 errors and hydration issues
      // localStorage is sufficient for session persistence
      if (restoredUser) {
        // Server validation disabled - uncomment when backend has /auth/me endpoint
        /*
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.data?.user) {
            setUser(response.data.user as User);
            localStorage.setItem('verita-user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.warn('Server validation failed, using localStorage data:', error);
        }
        */
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Save to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('verita-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('verita-user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.data) {
        // Map backend response to User interface
        const userData: User = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role,
          avatar: response.data.user.avatar,
          phone: response.data.user.phone,
          createdAt: response.data.user.createdAt,
          updatedAt: response.data.user.updatedAt,
        };
        setUser(userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API to clear server-side tokens
      await authService.logout();
      setUser(null);

      // Clear any localStorage fallback
      localStorage.removeItem('verita-user');

      // Force redirect to home page instead of login
      window.location.href = '/';
    } catch {
      // Still logout on frontend even if API call fails
      setUser(null);
      localStorage.removeItem('verita-user');
      window.location.href = '/';
    }
  };

  const isAdmin = () => {
    if (!user) return false;
    return user.role === 'ADMIN' || user.role === 'MANAGER';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setUser,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}