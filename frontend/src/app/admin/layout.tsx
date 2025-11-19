'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import { authService, userService } from '@/lib/api';
import type { User } from '@/lib/api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith('/admin/login');

  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(!isAuthRoute);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setIsChecking(true);
      const response = await userService.getCurrentUser();
      
      // Check if response is valid
      if (!response || !response.success || !response.data || !response.data.user) {
        throw new Error('Invalid response from server');
      }
      
      const currentUser = response.data.user;
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
        console.warn('User does not have admin privileges');
        setUser(null);
        setIsChecking(false);
        if (!isAuthRoute) {
          router.replace('/admin/login');
        }
        return;
      }
      
      setUser(currentUser);
      setIsChecking(false);
    } catch (error: unknown) {
      // Log error for debugging but don't throw
      console.error('Failed to fetch current user:', error);
      setUser(null);
      setIsChecking(false);
      if (!isAuthRoute) {
        // Use replace to avoid adding to history
        router.replace('/admin/login');
      }
    }
  }, [isAuthRoute, router]);

  useEffect(() => {
    if (!isAuthRoute) {
      // Wrap in try-catch to prevent errors from bubbling up
      fetchCurrentUser().catch((error) => {
        console.error('Error in fetchCurrentUser effect:', error);
        setUser(null);
        setIsChecking(false);
        router.replace('/admin/login');
      });
    } else {
      setIsChecking(false);
    }
  }, [fetchCurrentUser, isAuthRoute, router]);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      router.replace('/admin/login');
    }
  }, [router]);

  const showProtectedLayout = useMemo(() => !isAuthRoute, [isAuthRoute]);

  if (!showProtectedLayout) {
    return <>{children}</>;
  }

  if (isChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 font-medium">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthGuard>
      <div className="flex h-screen bg-gray-100 overflow-hidden" suppressHydrationWarning>
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-0 lg:ml-0" suppressHydrationWarning>
          <AdminHeader user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-y-auto bg-gray-100" suppressHydrationWarning>
            <div className="w-full h-full">{children}</div>
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
