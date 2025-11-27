'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, DollarSign, Users, Shield } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle} = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      // The redirect will be handled by the AuthContext
      // Successful login will redirect to dashboard or google-register automatically
    } catch (error: any) {
      console.error("Google Sign-In failed:", error);
      toast.error(error.message || "Failed to sign in with Google");
    }
  };
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Gradient Background */}
      <div 
        className="hidden lg:flex lg:w-2/5 p-6 xl:p-12 flex-col justify-center text-white"
        style={{
          background: 'linear-gradient(to bottom, #EEC643 20%, #0D21A1 50%, #011638 100%)'
        }}
      >
        <div className="max-w-md">
          <h1 className="text-xl font-semibold mb-8">Adaptive Lending</h1>
          <h2 className="text-2xl xl:text-4xl font-bold mb-6 leading-tight">
            AI-Powered Loan Default Prediction Platform
          </h2>
          <p className="text-base xl:text-lg opacity-90 leading-relaxed">
            Join the most advanced lending platform powered by machine learning. 
            Get instant loan decisions, dynamic credit scoring, and comprehensive risk analysis.
          </p>
          
          {/* Feature Icons */}
          <div className="flex space-x-6 mt-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm">Smart Loans</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm">Multi-Role</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm">Secure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-3/5 bg-[#EFF0F2] p-4 sm:p-6 lg:p-8 xl:p-12 flex flex-col justify-center min-h-screen">
        <div className="w-full max-w-xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#141414] mb-3">
              Sign in to Adaptive Lending
            </h1>
            <p className="text-lg text-[#141414]/70">
              Use one account for all platform services.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Google Sign-In Button */}
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              variant="secondary"
              className="w-full h-14 border border-[#011638]/20 hover:bg-[#EFF0F2] bg-white text-[#141414] text-base"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#011638]/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#EFF0F2] text-[#141414]/50">Or continue with email</span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-base font-medium text-[#141414] mb-3">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 px-4 bg-white border border-[#011638]/20 rounded-lg text-[#141414] placeholder-[#141414]/50 focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643] text-base"
                placeholder="you@company.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-base font-medium text-[#141414] mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 px-4 pr-12 bg-white border border-[#011638]/20 rounded-lg text-[#141414] placeholder-[#141414]/50 focus:outline-none focus:ring-2 focus:ring-[#EEC643] focus:border-[#EEC643] text-base"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#141414]/40 hover:text-[#141414]/60"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-base text-[#141414]/50 mt-2">
                At least 8 characters with letters & numbers.
              </p>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414] font-medium text-base"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center space-y-5 mt-10">
            <p className="text-xs text-[#141414]/50">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-[#0D21A1] hover:text-[#0D21A1]/80 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#0D21A1] hover:text-[#0D21A1]/80 hover:underline">
                Privacy Policy
              </Link>
            </p>

            <p className="text-sm text-[#141414]/70">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-[#0D21A1] hover:text-[#0D21A1]/80 hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}