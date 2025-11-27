'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { DollarSign, BanknoteIcon, Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, userProfile } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      
      // Redirect based on user role
      if (userProfile) {
        router.push(`/dashboard/${userProfile.role}`);
      } else {
        // Fallback - redirect to main dashboard which will handle the redirect
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#011638] to-[#0D21A1] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <GlassCard className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center space-x-4 mb-4">
            <div className="p-3 bg-[#EEC643]/20 rounded-full">
              <DollarSign className="w-8 h-8 text-[#EEC643]" />
            </div>
            <div className="p-3 bg-[#0D21A1]/20 rounded-full">
              <BanknoteIcon className="w-8 h-8 text-[#0D21A1]" />
            </div>
            <div className="p-3 bg-[#011638]/20 rounded-full">
              <Shield className="w-8 h-8 text-[#011638]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#141414] mb-2">Adaptive Lending</h1>
          <p className="text-[#141414]/70">AI-Powered Loan Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#141414] mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] placeholder-[#141414]/50 focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643]"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#141414] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#EFF0F2] border border-[#011638]/20 rounded-lg text-[#141414] placeholder-[#141414]/50 focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643]"
              placeholder="Enter your password"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414]"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-center">
            <p className="text-[#141414]/70">
              Don't have an account?{' '}
              <a href="/register" className="text-[#0D21A1] hover:text-[#0D21A1]/80 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}