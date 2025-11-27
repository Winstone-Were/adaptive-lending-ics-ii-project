'use client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { 
  Users, 
  FileText, 
  TrendingUp,
  BarChart3,
  Shield,
  DollarSign
} from 'lucide-react';

export default function BankDashboard() {
  const router = useRouter();

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => apiRequest('/auth/me'),
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['bank-dashboard'],
    queryFn: () => apiRequest('/banks/dashboard'),
  });

  const { data: pendingLoans } = useQuery({
    queryKey: ['pending-loans'],
    queryFn: () => apiRequest('/banks/loans/pending'),
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#141414]">Bank Dashboard</h1>
        <p className="text-[#141414]/70">{userProfile?.bank_name} - Portfolio Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Pending Loans</p>
              <p className="text-2xl font-bold text-[#141414]">
                {pendingLoans?.pending_loans?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#EEC643] rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#141414]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Approval Rate</p>
              <p className="text-2xl font-bold text-[#141414]">
                {dashboardData?.approval_rate ? `${dashboardData.approval_rate.toFixed(1)}%` : '0%'}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#0D21A1] rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#EFF0F2]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Portfolio Value</p>
              <p className="text-2xl font-bold text-[#141414]">
                ${dashboardData?.total_portfolio_value ? (dashboardData.total_portfolio_value / 1000).toFixed(1) + 'K' : '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#011638] rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#EFF0F2]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Default Rate</p>
              <p className="text-2xl font-bold text-[#141414]">
                {dashboardData?.default_rate ? `${dashboardData.default_rate.toFixed(1)}%` : '0%'}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#EEC643] rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#141414]" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#141414] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/dashboard/pending')}
              className="w-full bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414]"
            >
              <FileText className="w-4 h-4 mr-2" />
              Review Pending Loans
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/analytics')}
              className="w-full bg-[#0D21A1] hover:bg-[#0D21A1]/90 text-[#EFF0F2]"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/risk')}
              className="w-full bg-[#011638] hover:bg-[#011638]/90 text-[#EFF0F2]"
            >
              <Shield className="w-4 h-4 mr-2" />
              Risk Analysis
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#141414] mb-4">Pending Applications</h3>
          <div className="space-y-3">
            {pendingLoans?.pending_loans?.slice(0, 3).map((loan: any) => (
              <div key={loan.loan_id} className="flex items-center justify-between p-3 bg-[#EFF0F2] rounded-lg">
                <div>
                  <p className="font-medium text-[#141414]">${loan.application_data.loan_amount}</p>
                  <p className="text-sm text-[#141414]/70">
                    {loan.application_data.purpose}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#141414]">
                    {loan.default_probability ? (loan.default_probability * 100).toFixed(1) + '%' : 'N/A'}
                  </p>
                  <p className="text-xs text-[#141414]/70">Risk</p>
                </div>
              </div>
            ))}
            {(!pendingLoans?.pending_loans || pendingLoans.pending_loans.length === 0) && (
              <p className="text-[#141414]/70 text-center py-4">No pending applications</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}