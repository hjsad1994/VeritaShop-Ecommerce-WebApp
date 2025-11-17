'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setIsChecking(false);
      
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        // Save the current path to redirect back after login
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirectPath', window.location.pathname);
        }
        router.push(redirectTo);
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect immediately - no intermediate page
  if (!isAuthenticated || !user) {
    return null; // Don't render anything while redirecting
  }

  return <>{children}</>;
}
