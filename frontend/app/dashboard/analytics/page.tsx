'use client';
import { GlassCard } from '@/components/ui/GlassCard';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { BarChart3, PieChart, TrendingUp, Users, DollarSign, Shield } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['bank-analytics'],
    queryFn: () => apiRequest('/banks/dashboard'),
  });

  const { data: riskAnalysis } = useQuery({
    queryKey: ['risk-analysis'],
    queryFn: () => apiRequest('/banks/analytics/risk'),
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
        <h1 className="text-3xl font-bold text-[#141414]">Analytics Dashboard</h1>
        <p className="text-[#141414]/70">Comprehensive insights into your loan portfolio</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Approval Rate</p>
              <p className="text-2xl font-bold text-[#141414]">
                {analytics?.approval_rate ? `${analytics.approval_rate.toFixed(1)}%` : '0%'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-[#EEC643]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Default Rate</p>
              <p className="text-2xl font-bold text-[#141414]">
                {analytics?.default_rate ? `${analytics.default_rate.toFixed(1)}%` : '0%'}
              </p>
            </div>
            <Shield className="w-8 h-8 text-[#0D21A1]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Portfolio Value</p>
              <p className="text-2xl font-bold text-[#141414]">
                ${analytics?.total_portfolio_value ? (analytics.total_portfolio_value / 1000).toFixed(1) + 'K' : '0'}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-[#011638]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Total Processed</p>
              <p className="text-2xl font-bold text-[#141414]">
                {analytics?.total_loans_processed || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-[#EEC643]" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="w-5 h-5 text-[#EEC643]" />
            <h3 className="text-lg font-semibold text-[#141414]">Risk Distribution</h3>
          </div>
          
          <div className="space-y-4">
            {riskAnalysis?.risk_by_grade && Object.entries(riskAnalysis.risk_by_grade).map(([grade, data]: [string, any]) => (
              <div key={grade} className="flex items-center justify-between">
                <span className="text-[#141414] capitalize">{grade}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-[#EFF0F2] rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        grade === 'excellent' ? 'bg-green-500' :
                        grade === 'good' ? 'bg-blue-500' :
                        grade === 'fair' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(data.count / riskAnalysis.total_analyzed_loans) * 100}%` }}
                    />
                  </div>
                  <span className="text-[#141414] font-medium w-12 text-right">
                    {data.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Monthly Trends */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-[#0D21A1]" />
            <h3 className="text-lg font-semibold text-[#141414]">Monthly Trends</h3>
          </div>
          
          <div className="space-y-3">
            {analytics?.monthly_trends?.slice(-6).map((trend: any) => (
              <div key={trend.month} className="flex items-center justify-between">
                <span className="text-[#141414] text-sm">{trend.month}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-[#141414] text-sm">{trend.approved_applications} approved</span>
                  <span className="text-[#141414]/70 text-sm">
                    {trend.approval_rate.toFixed(1)}% rate
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Risk Analysis Summary */}
      <GlassCard className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-[#011638]" />
          <h3 className="text-lg font-semibold text-[#141414]">Portfolio Risk Summary</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{riskAnalysis?.low_risk_loans || 0}</p>
            <p className="text-green-700">Low Risk Loans</p>
            <p className="text-green-600 text-sm">
              ${riskAnalysis?.low_risk_volume ? (riskAnalysis.low_risk_volume / 1000).toFixed(1) + 'K' : '0'}
            </p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{riskAnalysis?.medium_risk_loans || 0}</p>
            <p className="text-yellow-700">Medium Risk Loans</p>
            <p className="text-yellow-600 text-sm">
              ${riskAnalysis?.medium_risk_volume ? (riskAnalysis.medium_risk_volume / 1000).toFixed(1) + 'K' : '0'}
            </p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{riskAnalysis?.high_risk_loans || 0}</p>
            <p className="text-red-700">High Risk Loans</p>
            <p className="text-red-600 text-sm">
              ${riskAnalysis?.high_risk_volume ? (riskAnalysis.high_risk_volume / 1000).toFixed(1) + 'K' : '0'}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}