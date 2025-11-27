'use client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { CreditCard, Clock, CheckCircle, XCircle, TrendingUp, DollarSign } from 'lucide-react';
import { useState } from 'react';

export default function MyLoans() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const { data: loans, isLoading } = useQuery({
    queryKey: ['customer-loans'],
    queryFn: () => apiRequest('/customers/loans'),
  });

  const filteredLoans = loans?.loans?.filter((loan: any) => 
    selectedStatus === 'all' || loan.status === selectedStatus
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <h1 className="text-3xl font-bold text-[#141414]">My Loans</h1>
        <p className="text-[#141414]/70">View and manage your loan applications</p>
      </div>

      {/* Status Filters */}
      <GlassCard className="p-6">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setSelectedStatus('all')}
            variant={selectedStatus === 'all' ? 'primary' : 'secondary'}
            className={selectedStatus === 'all' ? 'bg-[#EEC643] text-[#141414]' : ''}
          >
            All Loans
          </Button>
          <Button
            onClick={() => setSelectedStatus('pending')}
            variant={selectedStatus === 'pending' ? 'primary' : 'secondary'}
            className={selectedStatus === 'pending' ? 'bg-[#0D21A1] text-[#EFF0F2]' : ''}
          >
            Pending
          </Button>
          <Button
            onClick={() => setSelectedStatus('approved')}
            variant={selectedStatus === 'approved' ? 'primary' : 'secondary'}
            className={selectedStatus === 'approved' ? 'bg-green-600 text-white' : ''}
          >
            Approved
          </Button>
          <Button
            onClick={() => setSelectedStatus('active')}
            variant={selectedStatus === 'active' ? 'primary' : 'secondary'}
            className={selectedStatus === 'active' ? 'bg-[#011638] text-[#EFF0F2]' : ''}
          >
            Active
          </Button>
        </div>
      </GlassCard>

      {/* Loans Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredLoans?.map((loan: any) => (
          <GlassCard key={loan.loan_id} className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Loan Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-[#0D21A1] rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-[#EFF0F2]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#141414]">
                      Ksh {loan.application_data.loan_amount.toLocaleString()}
                    </h3>
                    <p className="text-[#141414]/70">{loan.application_data.purpose}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-[#141414]/70">Interest Rate</p>
                    <p className="font-semibold text-[#141414]">{loan.application_data.interest_rate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#141414]/70">Term</p>
                    <p className="font-semibold text-[#141414]">{loan.application_data.loan_term_months} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#141414]/70">Applied On</p>
                    <p className="font-semibold text-[#141414]">
                      {new Date(loan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#141414]/70">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                      {getStatusIcon(loan.status)}
                      <span className="ml-1 capitalize">{loan.status}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk & Actions */}
              <div className="flex flex-col items-center space-y-3">
                <div className="text-center">
                  <p className="text-sm text-[#141414]/70">Default Risk</p>
                  <p className="text-2xl font-bold text-[#141414]">
                    {(loan.default_probability * 100).toFixed(1)}%
                  </p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-[#141414]/50" />
                    <span className="text-sm text-[#141414]/70 capitalize">{loan.credit_grade}</span>
                  </div>
                </div>

                {(loan.status === 'active' || loan.status === 'approved') && (
                  <Button className="bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414]">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Make Payment
                  </Button>
                )}
              </div>
            </div>

            {/* Bank Decision */}
            {loan.decision && (
              <div className="mt-4 p-3 bg-[#EFF0F2] rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#141414]">Bank Decision: {loan.decision}</p>
                    <p className="text-sm text-[#141414]/70">{loan.recommendation}</p>
                  </div>
                  {loan.bank_id && (
                    <span className="text-sm text-[#141414]/70">Processed by Bank</span>
                  )}
                </div>
              </div>
            )}
          </GlassCard>
        ))}

        {(!filteredLoans || filteredLoans.length === 0) && (
          <GlassCard className="p-12 text-center">
            <CreditCard className="w-16 h-16 text-[#011638]/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#141414] mb-2">No Loans Found</h3>
            <p className="text-[#141414]/70">
              {selectedStatus === 'all' 
                ? "You haven't applied for any loans yet." 
                : `No ${selectedStatus} loans found.`
              }
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}