'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CustomerSidebar from '@/components/layout/CustomerSidebar';
import BankSidebar from '@/components/layout/BankSidebar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Button } from '@/components/ui/Button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Redirect to role-specific dashboard if we're on the main dashboard
    if (userProfile && window.location.pathname === '/dashboard') {
      router.push(`/dashboard/${userProfile.role}`);
    }
  }, [userProfile, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EFF0F2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#EEC643] mx-auto mb-4"></div>
          <p className="text-[#141414]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-[#EFF0F2] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#141414] mb-4">Unable to load user data</div>
          <Button 
            onClick={() => router.push('/login')}
            className="bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414]"
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  const getSidebar = () => {
    switch (userProfile.role) {
      case 'customer':
        return <CustomerSidebar user={userProfile} />;
      case 'bank':
        return <BankSidebar user={userProfile} />;
      case 'admin':
        return <AdminSidebar user={userProfile} />;
      default:
        return <CustomerSidebar user={userProfile} />;
    }
  };

  const getBackgroundStyle = () => {
    switch (userProfile.role) {
      case 'customer':
        return 'bg-gradient-to-br from-[#EFF0F2] to-[#EEC643]/10';
      case 'bank':
        return 'bg-gradient-to-br from-[#EFF0F2] to-[#0D21A1]/10';
      case 'admin':
        return 'bg-gradient-to-br from-[#EFF0F2] to-[#011638]/10';
      default:
        return 'bg-[#EFF0F2]';
    }
  };

  return (
    <div className={getBackgroundStyle()}>
      <SidebarLayout sidebar={getSidebar()}>
        {children}
      </SidebarLayout>
    </div>
  );
}