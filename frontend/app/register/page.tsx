'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/utils';
import { auth } from '@/lib/firebase/config';
import { User, Users, Settings } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer' as 'customer' | 'bank' | 'admin',
    income: '',
    age: '',
    monthsEmployed: '',
    bankName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Register in Firebase Auth
      await register(formData.email, formData.password);
      
      // 2. Get ID token and register in backend
      const token = await auth.currentUser?.getIdToken();
      
      const backendData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.role === 'customer') {
        backendData.income = parseFloat(formData.income);
        backendData.age = parseInt(formData.age);
        backendData.months_employed = parseInt(formData.monthsEmployed);
      } else if (formData.role === 'bank') {
        backendData.bank_name = formData.bankName;
      }

      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(backendData),
      });

      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'customer':
        return <User className="w-5 h-5" />;
      case 'bank':
        return <Users className="w-5 h-5" />;
      case 'admin':
        return <Settings className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'customer':
        return 'border-accent bg-accent/10';
      case 'bank':
        return 'border-secondary bg-secondary/10';
      case 'admin':
        return 'border-primary bg-primary/10';
      default:
        return 'border-accent bg-accent/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/10 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <GlassCard className="w-full max-w-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Create Account</h1>
          <p className="text-text/70">Join Adaptive Lending Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-text placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-text placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-text placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              >
                <option value="customer">Customer</option>
                <option value="bank">Bank</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {formData.role === 'customer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Income ($)
                  </label>
                  <input
                    type="number"
                    value={formData.income}
                    onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-text placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-text placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Months Employed
                  </label>
                  <input
                    type="number"
                    value={formData.monthsEmployed}
                    onChange={(e) => setFormData({ ...formData, monthsEmployed: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-text placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                    required
                  />
                </div>
              </>
            )}

            {formData.role === 'bank' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-primary/20 rounded-lg text-text placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                  required
                />
              </div>
            )}
          </div>

          {/* Role Preview */}
          <div className={`p-4 rounded-lg border-2 ${getRoleColor(formData.role)}`}>
            <div className="flex items-center space-x-3">
              {getRoleIcon(formData.role)}
              <div>
                <h3 className="font-semibold text-text capitalize">{formData.role} Account</h3>
                <p className="text-text/70 text-sm">
                  {formData.role === 'customer' && 'Apply for loans and manage your credit profile'}
                  {formData.role === 'bank' && 'Review loan applications and manage portfolio'}
                  {formData.role === 'admin' && 'Manage system users and monitor platform health'}
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-text"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}