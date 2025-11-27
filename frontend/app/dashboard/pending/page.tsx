'use client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { toast } from 'sonner';
import { Clock, User, DollarSign, TrendingUp, Check, X } from 'lucide-react';

export default function PendingLoans() {
  const queryClient = useQueryClient();

  const { data: pendingLoans, isLoading } = useQuery({
    queryKey: ['pending-loans'],
    queryFn: () => apiRequest('/banks/loans/pending'),
  });

  const approveMutation = useMutation({
    mutationFn: (loanId: string) => apiRequest(`/banks/loans/${loanId}/approve`, {
      method: 'POST',
    }),
    onSuccess: () => {
      toast.success('Loan approved successfully');
      queryClient.invalidateQueries({ queryKey: ['pending-loans'] });
    },
    onError: (error: any) => {
      toast.error('Failed to approve loan');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (loanId: string) => apiRequest(`/banks/loans/${loanId}/reject`, {
      method: 'POST',
    }),
    onSuccess: () => {
      toast.success('Loan rejected');
      queryClient.invalidateQueries({ queryKey: ['pending-loans'] });
    },
    onError: (error: any) => {
      toast.error('Failed to reject loan');
    },
  });

  const getRiskColor = (probability: number) => {
    if (probability < 0.3) return 'text-green-600';
    if (probability < 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevel = (probability: number) => {
    if (probability < 0.3) return 'Low Risk';
    if (probability < 0.6) return 'Medium Risk';
    return 'High Risk';
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
        <h1 className="text-3xl font-bold text-[#141414]">Pending Loans</h1>
        <p className="text-[#141414]/70">Review and process loan applications</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pendingLoans?.pending_loans?.map((loan: any) => (
          <GlassCard key={loan.loan_id} className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Loan Information */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-[#0D21A1] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[#EFF0F2]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#141414]">
                      ${loan.application_data.loan_amount.toLocaleString()}
                    </h3>
                    <p className="text-[#141414]/70">{loan.application_data.purpose}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-[#141414]/70">Applicant Age</p>
                    <p className="font-semibold text-[#141414]">{loan.application_data.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#141414]/70">Income</p>
                    <p className="font-semibold text-[#141414]">${loan.application_data.income.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#141414]/70">Credit Score</p>
                    <p className="font-semibold text-[#141414]">{loan.application_data.credit_score}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#141414]/70">DTI Ratio</p>
                    <p className="font-semibold text-[#141414]">{(loan.application_data.dti_ratio * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Risk Assessment & Actions */}
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center">
                  <p className="text-sm text-[#141414]/70">Default Probability</p>
                  <p className={`text-2xl font-bold ${getRiskColor(loan.default_probability)}`}>
                    {(loan.default_probability * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-[#141414]/70">{getRiskLevel(loan.default_probability)}</p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => approveMutation.mutate(loan.loan_id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => rejectMutation.mutate(loan.loan_id)}
                    disabled={rejectMutation.isPending || approveMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="mt-4 p-3 bg-[#EEC643]/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#EEC643]" />
                <span className="font-semibold text-[#141414]">AI Recommendation:</span>
                <span className="text-[#141414]">{loan.recommendation}</span>
              </div>
            </div>
          </GlassCard>
        ))}

        {(!pendingLoans?.pending_loans || pendingLoans.pending_loans.length === 0) && (
          <GlassCard className="p-12 text-center">
            <Clock className="w-16 h-16 text-[#011638]/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#141414] mb-2">No Pending Loans</h3>
            <p className="text-[#141414]/70">All loan applications have been processed.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}