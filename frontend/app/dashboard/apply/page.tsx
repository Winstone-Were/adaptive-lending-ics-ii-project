'use client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Calendar, Percent, Check, Building } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LoanPackage {
  package_id: string;
  name: string;
  amount: number;
  interest_rate: number;
  loan_term_months: number;
  minimum_credit_score: number;
  description?: string;
  bank_id: string;
  bank_name?: string;
}

export default function ApplyForLoan() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<LoanPackage | null>(null);
  const [purpose, setPurpose] = useState('Personal Loan');

  // Fetch loan packages
  const { data: packagesData, isLoading: packagesLoading } = useQuery({
    queryKey: ['loan-packages'],
    queryFn: () => apiRequest('/banks/packages/all'),
  });

  // Fetch user profile for pre-filled data
  const { data: userData } = useQuery({
    queryKey: ['user-profile-data'],
    queryFn: () => apiRequest('/auth/me'),
  });

  const applyLoanMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/customers/loans/apply-package', {
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
    
    if (!selectedPackage) {
      toast.error('Please select a loan package');
      return;
    }

    const applicationData = {
      package_id: selectedPackage.package_id,
      purpose: purpose,
      // User data comes from backend profile
      user_data: {
        income: userData?.income,
        credit_score: userData?.current_credit_score,
        months_employed: userData?.months_employed,
        dti_ratio: userData?.current_dti,
        age: userData?.age
      }
    };

    applyLoanMutation.mutate(applicationData);
  };

  const isEligibleForPackage = (loanPackage: LoanPackage) => {
    if (!userData) return false;
    
    const hasSufficientCredit = userData.current_credit_score >= loanPackage.minimum_credit_score;
    const hasReasonableDTI = userData.current_dti < 0.5; // 50% DTI threshold
    const hasStableEmployment = userData.months_employed >= 6; // At least 6 months employed
    
    return hasSufficientCredit && hasReasonableDTI && hasStableEmployment;
  };

  const calculateMonthlyPayment = (packageData: LoanPackage) => {
    const principal = packageData.amount;
    const monthlyRate = (packageData.interest_rate / 100) / 12;
    const numberOfPayments = packageData.loan_term_months;
    
    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }
    
    return principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  };

  if (packagesLoading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#EEC643] mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#141414]">Apply for Loan</h1>
        <p className="text-[#141414]/70">Select from available loan packages</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loan Packages Selection */}
        <GlassCard className="p-6 lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#141414] mb-4">Available Loan Packages</h3>
            
            {/* Loan Purpose Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#141414] mb-2">
                Loan Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
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

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packagesData?.packages?.map((loanPackage: LoanPackage) => {
                const isEligible = isEligibleForPackage(loanPackage);
                const isSelected = selectedPackage?.package_id === loanPackage.package_id;
                
                return (
                  <div
                    key={loanPackage.package_id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-[#EEC643] bg-[#EEC643]/10'
                        : isEligible
                        ? 'border-[#011638]/20 hover:border-[#0D21A1] bg-white'
                        : 'border-[#011638]/10 bg-[#EFF0F2] opacity-60'
                    }`}
                    onClick={() => isEligible && setSelectedPackage(loanPackage)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-[#141414]">{loanPackage.name}</h4>
                        <p className="text-sm text-[#141414]/70">{loanPackage.description}</p>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-[#EEC643]" />
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#141414]/70">Amount:</span>
                        <span className="font-semibold text-[#141414]">
                          Ksh {loanPackage.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#141414]/70">Interest:</span>
                        <span className="font-semibold text-[#141414]">
                          {loanPackage.interest_rate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#141414]/70">Term:</span>
                        <span className="font-semibold text-[#141414]">
                          {loanPackage.loan_term_months} months
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#141414]/70">Min Credit:</span>
                        <span className="font-semibold text-[#141414]">
                          {loanPackage.minimum_credit_score}
                        </span>
                      </div>
                    </div>
                    
                    {!isEligible && (
                      <div className="mt-2 text-xs text-red-600">
                        You don't meet the requirements for this package
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {(!packagesData?.packages || packagesData.packages.length === 0) && (
              <div className="text-center py-8">
                <Building className="w-16 h-16 text-[#011638]/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#141414] mb-2">No Loan Packages Available</h3>
                <p className="text-[#141414]/70">Check back later for available loan packages.</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Selected Package Preview & User Info */}
        <div className="space-y-6">
          {/* Selected Package Preview */}
          {selectedPackage && (
            <GlassCard className="p-6">
              <div className="text-center mb-6">
                <Calculator className="w-12 h-12 text-[#EEC643] mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-[#141414]">Selected Package</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#141414]/70">Package</span>
                  <span className="text-[#141414] font-semibold">{selectedPackage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#141414]/70">Loan Amount</span>
                  <span className="text-[#141414] font-semibold">
                    Ksh {selectedPackage.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#141414]/70">Interest Rate</span>
                  <span className="text-[#141414] font-semibold">
                    {selectedPackage.interest_rate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#141414]/70">Term</span>
                  <span className="text-[#141414] font-semibold">
                    {selectedPackage.loan_term_months} months
                  </span>
                </div>
                <div className="border-t border-[#011638]/20 pt-3">
                  <div className="flex justify-between">
                    <span className="text-[#141414]/70">Monthly Payment</span>
                    <span className="text-[#0D21A1] font-bold">
                      ${calculateMonthlyPayment(selectedPackage).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* User Information Preview */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-[#141414] mb-4">Your Information</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#141414]/70">Credit Score</span>
                <span className="font-semibold text-[#141414]">
                  {userData?.current_credit_score || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#141414]/70">Annual Income</span>
                <span className="font-semibold text-[#141414]">
                  Ksh {userData?.income ? userData.income.toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#141414]/70">Months Employed</span>
                <span className="font-semibold text-[#141414]">
                  {userData?.months_employed || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#141414]/70">DTI Ratio</span>
                <span className="font-semibold text-[#141414]">
                  {userData?.current_dti ? (userData.current_dti * 100).toFixed(1) + '%' : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#141414]/70">Age</span>
                <span className="font-semibold text-[#141414]">
                  {userData?.age || 'N/A'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#011638]/20">
              <Button
                onClick={() => router.push('/dashboard/profile')}
                variant="secondary"
                className="w-full bg-[#0D21A1] hover:bg-[#0D21A1]/90 text-[#EFF0F2]"
              >
                Update Profile Information
              </Button>
            </div>
          </GlassCard>

          {/* Submit Button */}
          {selectedPackage && (
            <Button
              onClick={handleSubmit}
              disabled={applyLoanMutation.isPending}
              className="w-full bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414]"
            >
              {applyLoanMutation.isPending ? 'Submitting...' : 'Apply for Loan'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}