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
      const currentUser = await userService.getCurrentUser();
      if (currentUser.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }
      setUser(currentUser);
      setIsChecking(false);
    } catch {
      setUser(null);
      setIsChecking(false);
      if (!isAuthRoute) {
        router.replace('/admin/login');
      }
    }
  }, [isAuthRoute, router]);

  useEffect(() => {
    if (!isAuthRoute) {
      fetchCurrentUser();
    } else {
      setIsChecking(false);
    }
  }, [fetchCurrentUser, isAuthRoute]);

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
          <AdminHeader />
          <main className="flex-1 overflow-y-auto bg-gray-100" suppressHydrationWarning>
            <div className="w-full h-full">
              {children}
            </div>
          </main>
        </div>
    <div className="flex h-screen bg-gray-100 overflow-hidden" suppressHydrationWarning>
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-0 lg:ml-0" suppressHydrationWarning>
        <AdminHeader user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto bg-gray-100" suppressHydrationWarning>
          <div className="w-full h-full">{children}</div>
        </main>
      </div>
    </AdminAuthGuard>
  );
}
