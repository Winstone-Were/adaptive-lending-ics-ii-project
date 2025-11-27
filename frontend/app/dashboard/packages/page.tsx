'use client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';
import { Plus, Edit, Trash2, DollarSign, Percent, Calendar, Target, Package } from 'lucide-react';

interface LoanPackage {
  package_id: string;
  name: string;
  amount: number;
  interest_rate: number;
  loan_term_months: number;
  minimum_credit_score: number;
  description?: string;
  created_at: string;
  is_active: boolean;
}

export default function LoanPackagesManagement() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<LoanPackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    interest_rate: '',
    loan_term_months: '',
    minimum_credit_score: '',
    description: '',
  });

  const { data: packages, isLoading } = useQuery({
    queryKey: ['bank-packages'],
    queryFn: () => apiRequest('/banks/packages'),
  });

  const createPackageMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/banks/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast.success('Loan package created successfully');
      setShowCreateForm(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['bank-packages'] });
    },
    onError: (error: any) => {
      toast.error('Failed to create loan package');
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: ({ packageId, data }: { packageId: string; data: any }) => 
      apiRequest(`/banks/packages/${packageId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success('Loan package updated successfully');
      setShowCreateForm(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['bank-packages'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update loan package');
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: (packageId: string) => apiRequest(`/banks/packages/${packageId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      toast.success('Loan package deleted');
      queryClient.invalidateQueries({ queryKey: ['bank-packages'] });
    },
    onError: (error: any) => {
      toast.error('Failed to delete loan package');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      interest_rate: '',
      loan_term_months: '',
      minimum_credit_score: '',
      description: '',
    });
    setEditingPackage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const packageData = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      interest_rate: parseFloat(formData.interest_rate),
      loan_term_months: parseInt(formData.loan_term_months),
      minimum_credit_score: parseInt(formData.minimum_credit_score),
      description: formData.description,
    };

    if (editingPackage) {
      updatePackageMutation.mutate({
        packageId: editingPackage.package_id,
        data: packageData
      });
    } else {
      createPackageMutation.mutate(packageData);
    }
  };

  const handleEdit = (pkg: LoanPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      amount: pkg.amount.toString(),
      interest_rate: pkg.interest_rate.toString(),
      loan_term_months: pkg.loan_term_months.toString(),
      minimum_credit_score: pkg.minimum_credit_score.toString(),
      description: pkg.description || '',
    });
    setShowCreateForm(true);
  };

  const handleDelete = (packageId: string) => {
    if (confirm('Are you sure you want to delete this loan package?')) {
      deletePackageMutation.mutate(packageId);
    }
  };

  const togglePackageStatus = (pkg: LoanPackage) => {
    const updateData = {
      ...pkg,
      is_active: !pkg.is_active
    };
    delete updateData.package_id;
    delete updateData.created_at;

    updatePackageMutation.mutate({
      packageId: pkg.package_id,
      data: updateData
    });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#141414]">Loan Packages</h1>
          <p className="text-[#141414]/70">Manage your loan packages for customers</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Package
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#141414] mb-4">
            {editingPackage ? 'Edit Loan Package' : 'Create New Loan Package'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Package Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Loan Amount ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#141414]/50" />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643]"
                    required
                    min="0"
                    step="1000"
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
                    min="0"
                    max="100"
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
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Minimum Credit Score
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#141414]/50" />
                  <input
                    type="number"
                    min="300"
                    max="850"
                    value={formData.minimum_credit_score}
                    onChange={(e) => setFormData({ ...formData, minimum_credit_score: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643]"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#141414] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643] resize-none"
                  placeholder="Describe this loan package..."
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={createPackageMutation.isPending || updatePackageMutation.isPending}
                className="bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414]"
              >
                {(createPackageMutation.isPending || updatePackageMutation.isPending) 
                  ? 'Saving...' 
                  : editingPackage ? 'Update Package' : 'Create Package'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                variant="secondary"
                className="bg-white border border-[#011638]/20 text-[#141414] hover:bg-[#EFF0F2]"
              >
                Cancel
              </Button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Packages List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages?.packages?.length > 0 ? (
          packages.packages.map((pkg: LoanPackage) => (
            <GlassCard key={pkg.package_id} className="p-6 relative">
              {/* Status Badge */}
              <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium ${
                pkg.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {pkg.is_active ? 'Active' : 'Inactive'}
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-[#0D21A1]" />
                  <h3 className="text-lg font-semibold text-[#141414]">{pkg.name}</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="p-1 text-[#0D21A1] hover:text-[#0D21A1]/80 transition-colors"
                    title="Edit package"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.package_id)}
                    className="p-1 text-red-600 hover:text-red-800 transition-colors"
                    title="Delete package"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {pkg.description && (
                <p className="text-[#141414]/70 text-sm mb-4">{pkg.description}</p>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#141414]/70">Amount:</span>
                  <span className="font-semibold text-[#141414]">
                    ${pkg.amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[#141414]/70">Interest Rate:</span>
                  <span className="font-semibold text-[#141414]">
                    {pkg.interest_rate}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[#141414]/70">Loan Term:</span>
                  <span className="font-semibold text-[#141414]">
                    {pkg.loan_term_months} months
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[#141414]/70">Min Credit Score:</span>
                  <span className="font-semibold text-[#141414]">
                    {pkg.minimum_credit_score}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-[#141414]/50">
                  <span>Created:</span>
                  <span>{new Date(pkg.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#011638]/10">
                <Button
                  onClick={() => togglePackageStatus(pkg)}
                  variant="secondary"
                  className={`w-full text-sm ${
                    pkg.is_active
                      ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                      : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                  }`}
                >
                  {pkg.is_active ? 'Deactivate Package' : 'Activate Package'}
                </Button>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Package className="w-16 h-16 text-[#011638]/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#141414] mb-2">No Loan Packages</h3>
            <p className="text-[#141414]/70 mb-4">Get started by creating your first loan package.</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Package
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}