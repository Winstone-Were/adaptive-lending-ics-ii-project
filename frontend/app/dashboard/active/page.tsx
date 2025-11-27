'use client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { TrendingUp, User, DollarSign, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ActiveLoans() {
  const { data: activeLoans, isLoading } = useQuery({
    queryKey: ['active-loans'],
    queryFn: () => apiRequest('/banks/loans/active'),
  });

  const getRiskLevel = (probability: number) => {
    if (probability < 0.3) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (probability < 0.6) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getPaymentStatus = (loan: any) => {
    const nextPayment = loan.next_payment_date;
    const now = new Date();
    const paymentDate = new Date(nextPayment);
    
    if (paymentDate < now) {
      return { status: 'Overdue', color: 'text-red-600', bg: 'bg-red-100' };
    } else if ((paymentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 7) {
      return { status: 'Due Soon', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    } else {
      return { status: 'On Track', color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

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
        <h1 className="text-3xl font-bold text-[#141414]">Active Loans</h1>
        <p className="text-[#141414]/70">Monitor your current loan portfolio</p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Total Active</p>
              <p className="text-2xl font-bold text-[#141414]">{activeLoans?.active_loans?.length || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-[#011638]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-[#141414]">
                ${activeLoans?.active_loans?.reduce((sum: number, loan: any) => sum + loan.amount_remaining, 0).toLocaleString() || 0}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-[#EEC643]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">On Track</p>
              <p className="text-2xl font-bold text-[#141414]">
                {activeLoans?.active_loans?.filter((loan: any) => getPaymentStatus(loan).status === 'On Track').length || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Due Soon</p>
              <p className="text-2xl font-bold text-[#141414]">
                {activeLoans?.active_loans?.filter((loan: any) => getPaymentStatus(loan).status === 'Due Soon').length || 0}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </GlassCard>
      </div>

      {/* Active Loans List */}
      <div className="grid grid-cols-1 gap-6">
        {activeLoans?.active_loans?.map((loan: any) => {
          const risk = getRiskLevel(loan.default_probability);
          const paymentStatus = getPaymentStatus(loan);
          
          return (
            <GlassCard key={loan.loan_id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Loan Details */}
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-[#0D21A1] rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-[#EFF0F2]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#141414]">
                        ${loan.application_data.loan_amount.toLocaleString()}
                      </h3>
                      <p className="text-[#141414]/70">{loan.application_data.purpose}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-[#141414]/70">Remaining</p>
                      <p className="font-semibold text-[#141414]">${loan.amount_remaining.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#141414]/70">Interest Rate</p>
                      <p className="font-semibold text-[#141414]">{loan.application_data.interest_rate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#141414]/70">Next Payment</p>
                      <p className="font-semibold text-[#141414]">
                        {new Date(loan.next_payment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#141414]/70">Credit Grade</p>
                      <span className="font-semibold text-[#141414] capitalize">{loan.credit_grade}</span>
                    </div>
                  </div>
                </div>

                {/* Risk & Status */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="text-center">
                    <p className="text-sm text-[#141414]/70">Default Risk</p>
                    <p className={`text-2xl font-bold ${risk.color}`}>
                      {(loan.default_probability * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-[#141414]/70">{risk.level} Risk</p>
                  </div>

                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatus.bg} ${paymentStatus.color}`}>
                    {paymentStatus.status === 'On Track' && <CheckCircle className="w-4 h-4 mr-1" />}
                    {paymentStatus.status === 'Due Soon' && <AlertTriangle className="w-4 h-4 mr-1" />}
                    {paymentStatus.status === 'Overdue' && <AlertTriangle className="w-4 h-4 mr-1" />}
                    {paymentStatus.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-[#141414]/70 mb-1">
                  <span>Paid: ${(loan.application_data.loan_amount - loan.amount_remaining).toLocaleString()}</span>
                  <span>Total: ${loan.application_data.loan_amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-[#EFF0F2] rounded-full h-2">
                  <div 
                    className="bg-[#0D21A1] h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((loan.application_data.loan_amount - loan.amount_remaining) / loan.application_data.loan_amount) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </GlassCard>
          );
        })}

        {(!activeLoans?.active_loans || activeLoans.active_loans.length === 0) && (
          <GlassCard className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-[#011638]/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#141414] mb-2">No Active Loans</h3>
            <p className="text-[#141414]/70">You don't have any active loans in your portfolio.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}