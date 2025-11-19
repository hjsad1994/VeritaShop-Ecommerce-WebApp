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

// Helper function to restore user from localStorage synchronously
function getInitialUser(): User | null {
  if (typeof window === 'undefined') {
    return null; // SSR: no localStorage
  }
  
  try {
    const savedUser = localStorage.getItem('verita-user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Validate user structure
      if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
        return parsedUser;
      } else {
        localStorage.removeItem('verita-user');
      }
    }
  } catch (error) {
    console.error('Failed to restore user from localStorage:', error);
    localStorage.removeItem('verita-user');
  }
  
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Restore user immediately in initial state to avoid flash
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState(true);

  // Validate and finalize auth state after mount
  useEffect(() => {
    const checkAuth = async () => {
      // User already restored from initial state synchronously
      // This effect just validates and sets loading to false
      const savedUser = localStorage.getItem('verita-user');

      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // Validate user structure matches what we have
          if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
            // Ensure state matches localStorage (in case of any mismatch)
            setUser((currentUser) => {
              if (!currentUser || currentUser.id !== parsedUser.id) {
                return parsedUser;
              }
              return currentUser;
            });
          } else {
            // Invalid data, clear it
            localStorage.removeItem('verita-user');
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to validate user session from localStorage:', error);
          localStorage.removeItem('verita-user');
          setUser(null);
        }
      } else {
        // No saved user, ensure state is null
        setUser(null);
      }

      // Skip server validation for now to avoid 404 errors and hydration issues
      // localStorage is sufficient for session persistence
      // Server validation disabled - uncomment when backend has /auth/me endpoint
      /*
      if (user) {
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.data?.user) {
            setUser(response.data.user as User);
            localStorage.setItem('verita-user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.warn('Server validation failed, using localStorage data:', error);
        }
      }
      */

      setIsLoading(false);
    };

    checkAuth();
  }, []); // Empty deps - only run once on mount

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
          isActive: response.data.user.isActive ?? true,
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
    // Instead of throwing, return a safe default to prevent error boundary from catching
    // This allows components to handle the loading state gracefully
    console.warn('useAuth called outside AuthProvider. Make sure AuthProvider wraps your app.');
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: async () => { throw new Error('AuthProvider not available'); },
      logout: async () => { throw new Error('AuthProvider not available'); },
      setUser: () => { throw new Error('AuthProvider not available'); },
      isAdmin: () => false,
    };
  }
  return context;
}