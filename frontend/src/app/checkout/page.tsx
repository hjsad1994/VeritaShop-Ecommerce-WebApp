'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CheckoutPage from '@/features/checkout/CheckoutPage';

export default function Checkout() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save current path for redirect after login
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('redirectPath', '/checkout');
    }
    router.push('/login');
    return null;
  }

  // Show checkout page if authenticated
  return <CheckoutPage />;
}
