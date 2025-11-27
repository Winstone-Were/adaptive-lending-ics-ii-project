'use client';
import { GlassCard } from '@/components/ui/GlassCard';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { History, CheckCircle, Clock, XCircle, DollarSign, Calendar } from 'lucide-react';

export default function PaymentHistory() {
  const { data: loans, isLoading } = useQuery({
    queryKey: ['customer-loans'],
    queryFn: () => apiRequest('/customers/loans'),
  });

  // Extract all payments from all loans
  const allPayments = loans?.loans?.flatMap((loan: any) => 
    loan.repayment_history?.map((payment: any) => ({
      ...payment,
      loan_amount: loan.application_data.loan_amount,
      loan_purpose: loan.application_data.purpose,
    })) || []
  ) || [];

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'overdue':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
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
        <h1 className="text-3xl font-bold text-[#141414]">Payment History</h1>
        <p className="text-[#141414]/70">Track your loan payments and repayment progress</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Total Payments</p>
              <p className="text-2xl font-bold text-[#141414]">{allPayments.length}</p>
            </div>
            <History className="w-8 h-8 text-[#011638]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Completed</p>
              <p className="text-2xl font-bold text-[#141414]">
                {allPayments.filter((p: any) => p.status === 'paid').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Pending</p>
              <p className="text-2xl font-bold text-[#141414]">
                {allPayments.filter((p: any) => p.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </GlassCard>
      </div>

      {/* Payments List */}
      <GlassCard className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#011638]/20">
                <th className="text-left py-3 px-4 text-[#141414] font-semibold">Loan</th>
                <th className="text-left py-3 px-4 text-[#141414] font-semibold">Amount</th>
                <th className="text-left py-3 px-4 text-[#141414] font-semibold">Date</th>
                <th className="text-left py-3 px-4 text-[#141414] font-semibold">Due Date</th>
                <th className="text-left py-3 px-4 text-[#141414] font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {allPayments.map((payment: any) => (
                <tr key={payment.payment_id} className="border-b border-[#011638]/10 hover:bg-[#EFF0F2]">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-[#141414]">${payment.loan_amount.toLocaleString()}</p>
                      <p className="text-sm text-[#141414]/70">{payment.loan_purpose}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-[#141414]/50" />
                      <span className="font-semibold text-[#141414]">${payment.amount}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-[#141414]/50" />
                      <span className="text-[#141414]">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-[#141414]/50" />
                      <span className="text-[#141414]">
                        {new Date(payment.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                      {getPaymentStatusIcon(payment.status)}
                      <span className="ml-1 capitalize">{payment.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {allPayments.length === 0 && (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-[#011638]/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#141414] mb-2">No Payment History</h3>
              <p className="text-[#141414]/70">Your payment history will appear here once you make payments.</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}