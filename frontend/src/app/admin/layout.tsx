import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      </div>
    </AdminAuthGuard>
  );
}
