'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  
  // useAuth now returns safe defaults instead of throwing
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      setIsChecking(false);
      
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        router.push('/admin/login');
        return;
      }

      // Check if user has admin privileges
      if (!isAdmin()) {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, isAdmin, router]);

  // Show loading state while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not admin, don't render children
  if (!isAuthenticated || !user || !isAdmin()) {
    return null;
  }

  return <>{children}</>;
}
