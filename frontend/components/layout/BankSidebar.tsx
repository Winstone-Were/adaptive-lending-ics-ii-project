'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  FileText, 
  BarChart3, 
  TrendingUp,
  Shield,
  LogOut,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface BankSidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

const bankRoutes = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/pending', label: 'Pending Loans', icon: FileText },
  { href: '/dashboard/active', label: 'Active Loans', icon: TrendingUp },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/risk', label: 'Risk Analysis', icon: Shield },
];

export default function BankSidebar({ user }: BankSidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full bg-secondary/90 backdrop-blur-md text-white">
      {/* Header */}
      <div className="p-6 border-b border-accent/20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-text" />
          </div>
          <div>
            <h2 className="font-semibold">{user.name}</h2>
            <p className="text-accent text-sm">Bank</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {bankRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;
          
          return (
            <button
              key={route.href}
              onClick={() => router.push(route.href)}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive 
                  ? 'bg-accent text-text shadow-lg' 
                  : 'text-white/80 hover:bg-accent/20 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{route.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-accent/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white/80 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}