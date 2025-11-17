'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { User } from '@/lib/api/types';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const fetchUser = async () => {
    // This function is kept for compatibility but the actual user data
    // is managed by AuthContext
  };

  const value: UserContextType = {
    user,
    isLoading,
    isAuthenticated,
    fetchUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
