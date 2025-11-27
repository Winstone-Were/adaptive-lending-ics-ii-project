'use client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Calendar, Percent, User } from 'lucide-react';

export default function ApplyForLoan() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    loan_amount: '',
    interest_rate: '',
    loan_term_months: '',
    purpose: 'Personal Loan',
    income: '',
    age: '',
    credit_score: '',
    months_employed: '',
    dti_ratio: '',
  });

  const applyLoanMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/customers/loans/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: (data) => {
      toast.success('Loan application submitted successfully!');
      router.push('/dashboard/loans');
    },
    onError: (error: any) => {
      toast.error('Failed to submit loan application');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const applicationData = {
      income: parseFloat(formData.income),
      interest_rate: parseFloat(formData.interest_rate),
      loan_amount: parseFloat(formData.loan_amount),
      age: parseInt(formData.age),
      credit_score: parseFloat(formData.credit_score),
      months_employed: parseInt(formData.months_employed),
      dti_ratio: parseFloat(formData.dti_ratio),
      loan_term_months: parseInt(formData.loan_term_months),
      purpose: formData.purpose,
    };

    applyLoanMutation.mutate(applicationData);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#141414]">Apply for Loan</h1>
        <p className="text-[#141414]/70">Complete your loan application</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan Calculator Preview */}
        <GlassCard className="p-6 lg:col-span-1">
          <div className="text-center mb-6">
            <Calculator className="w-12 h-12 text-[#EEC643] mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-[#141414]">Loan Estimate</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#141414]/70">Loan Amount</span>
              <span className="text-[#141414] font-semibold">
                {formData.loan_amount ? `$${parseFloat(formData.loan_amount).toLocaleString()}` : '$0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#141414]/70">Interest Rate</span>
              <span className="text-[#141414] font-semibold">
                {formData.interest_rate ? `${formData.interest_rate}%` : '0%'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#141414]/70">Term</span>
              <span className="text-[#141414] font-semibold">
                {formData.loan_term_months ? `${formData.loan_term_months} months` : '0 months'}
              </span>
            </div>
            <div className="border-t border-[#011638]/20 pt-3">
              <div className="flex justify-between">
                <span className="text-[#141414]/70">Estimated Monthly</span>
                <span className="text-[#0D21A1] font-bold">
                  {formData.loan_amount && formData.interest_rate && formData.loan_term_months 
                    ? `$${((parseFloat(formData.loan_amount) * (1 + parseFloat(formData.interest_rate) / 100)) / parseInt(formData.loan_term_months)).toFixed(2)}`
                    : '$0'
                  }
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Application Form */}
        <GlassCard className="p-6 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Loan Details */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-[#141414] mb-4">Loan Details</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Loan Amount ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#141414]/50" />
                  <input
                    type="number"
                    value={formData.loan_amount}
                    onChange={(e) => setFormData({ ...formData, loan_amount: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#141414]/50" />
                  <input
                    type="number"
                    step="0.1"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Loan Term (months)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#141414]/50" />
                  <input
                    type="number"
                    value={formData.loan_term_months}
                    onChange={(e) => setFormData({ ...formData, loan_term_months: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Loan Purpose
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643]"
                >
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Home Improvement">Home Improvement</option>
                  <option value="Debt Consolidation">Debt Consolidation</option>
                  <option value="Business">Business</option>
                  <option value="Education">Education</option>
                  <option value="Medical">Medical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Financial Information */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-[#141414] mb-4">Financial Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Annual Income ($)
                </label>
                <input
                  type="number"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                  className="w-full px-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Credit Score
                </label>
                <div className="relative">
                  <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#141414]/50" />
                  <input
                    type="number"
                    min="300"
                    max="850"
                    value={formData.credit_score}
                    onChange={(e) => setFormData({ ...formData, credit_score: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Months Employed
                </label>
                <input
                  type="number"
                  value={formData.months_employed}
                  onChange={(e) => setFormData({ ...formData, months_employed: e.target.value })}
                  className="w-full px-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  DTI Ratio
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#141414]/50" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.dti_ratio}
                    onChange={(e) => setFormData({ ...formData, dti_ratio: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643]"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={applyLoanMutation.isPending}
              className="w-full bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414]"
            >
              {applyLoanMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}