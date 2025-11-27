'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CustomerSidebar from './CustomerSidebar';
import BankSidebar from './BankSidebar';
import AdminSidebar from './AdminSidebar';
import SidebarLayout from './SidebarLayout';
import { apiRequest } from '@/lib/utils';
import { toast } from 'sonner';

interface UserProfile {
  role: 'customer' | 'bank' | 'admin';
  name: string;
  email: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const profile = await apiRequest('/auth/me');
      setUserProfile(profile);
    } catch (error) {
      toast.error('Failed to load user profile');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text">Loading...</div>
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
        return 'bg-gradient-to-br from-background to-accent/10';
      case 'bank':
        return 'bg-gradient-to-br from-background to-secondary/10';
      case 'admin':
        return 'bg-gradient-to-br from-background to-primary/10';
      default:
        return 'bg-background';
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