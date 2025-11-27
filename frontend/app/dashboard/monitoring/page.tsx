'use client';
import { GlassCard } from '@/components/ui/GlassCard';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { BarChart3, LineChart, Users, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';

export default function SystemMonitoring() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['system-analytics'],
    queryFn: () => apiRequest('/admin/system/analytics'),
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#EEC643] mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#141414]">System Analytics</h1>
        <p className="text-[#141414]/70">Comprehensive platform performance and usage analytics</p>
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-[#141414]">{analytics?.total_users || 0}</p>
            </div>
            <Users className="w-8 h-8 text-[#011638]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Total Loans</p>
              <p className="text-2xl font-bold text-[#141414]">{analytics?.total_loans || 0}</p>
            </div>
            <CreditCard className="w-8 h-8 text-[#0D21A1]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Active Loans</p>
              <p className="text-2xl font-bold text-[#141414]">{analytics?.active_loans || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-[#EEC643]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Default Rate</p>
              <p className="text-2xl font-bold text-[#141414]">
                {analytics?.defaulted_loans_count || 0}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#EEC643]" />
            <h3 className="text-lg font-semibold text-[#141414]">User Distribution</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#141414]">Customers</span>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-[#EFF0F2] rounded-full h-2">
                  <div 
                    className="bg-[#EEC643] h-2 rounded-full"
                    style={{ width: `${((analytics?.customer_count || 0) / (analytics?.total_users || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-[#141414] font-medium w-12 text-right">
                  {analytics?.customer_count || 0}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[#141414]">Banks</span>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-[#EFF0F2] rounded-full h-2">
                  <div 
                    className="bg-[#0D21A1] h-2 rounded-full"
                    style={{ width: `${((analytics?.bank_count || 0) / (analytics?.total_users || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-[#141414] font-medium w-12 text-right">
                  {analytics?.bank_count || 0}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[#141414]">Admins</span>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-[#EFF0F2] rounded-full h-2">
                  <div 
                    className="bg-[#011638] h-2 rounded-full"
                    style={{ width: `${((analytics?.admin_count || 0) / (analytics?.total_users || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-[#141414] font-medium w-12 text-right">
                  {analytics?.admin_count || 0}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Loan Performance */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <LineChart className="w-5 h-5 text-[#0D21A1]" />
            <h3 className="text-lg font-semibold text-[#141414]">Loan Performance</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#141414]">Total Loan Volume</span>
              <span className="font-semibold text-[#141414]">
                ${analytics?.total_loan_volume ? (analytics.total_loan_volume / 1000).toFixed(1) + 'K' : '0'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[#141414]">Active Loan Volume</span>
              <span className="font-semibold text-[#141414]">
                ${analytics?.active_loan_volume ? (analytics.active_loan_volume / 1000).toFixed(1) + 'K' : '0'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[#141414]">Average Credit Score</span>
              <span className="font-semibold text-[#141414]">
                {analytics?.average_credit_score?.toFixed(0) || 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[#141414]">Model Accuracy</span>
              <span className="font-semibold text-[#141414]">
                {analytics?.model_accuracy ? `${analytics.model_accuracy.toFixed(1)}%` : 'N/A'}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Financial Summary */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[#141414] mb-4">Financial Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{analytics?.paid_loans_count || 0}</p>
            <p className="text-green-700">Paid Loans</p>
            <p className="text-green-600 text-sm">Successfully Repaid</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{analytics?.active_loans || 0}</p>
            <p className="text-blue-700">Active Loans</p>
            <p className="text-blue-600 text-sm">Currently Active</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{analytics?.defaulted_loans_count || 0}</p>
            <p className="text-red-700">Defaulted Loans</p>
            <p className="text-red-600 text-sm">Payment Defaults</p>
          </div>
        </div>
      </GlassCard>

      {/* System Performance */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[#141414] mb-4">System Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#141414]">System Uptime</span>
              <span className="font-semibold text-[#141414]">
                {analytics?.system_uptime ? `${analytics.system_uptime}%` : '100%'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#141414]">Avg Response Time</span>
              <span className="font-semibold text-[#141414]">
                {analytics?.avg_response_time ? `${analytics.avg_response_time}ms` : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#141414]">Avg Default Probability</span>
              <span className="font-semibold text-[#141414]">
                {analytics?.average_default_probability ? `${(analytics.average_default_probability * 100).toFixed(1)}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#141414]">Platform Health</span>
              <span className="font-semibold text-green-600">
                {((analytics?.system_uptime || 100) > 95 && (analytics?.model_accuracy || 0) > 80) 
                  ? 'Excellent' 
                  : 'Good'
                }
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}