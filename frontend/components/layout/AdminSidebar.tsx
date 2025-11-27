'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Users, 
  BarChart3, 
  Server,
  Shield,
  LogOut,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const adminRoutes = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: Home },
  { href: '/dashboard/users', label: 'User Management', icon: Users },
  { href: '/dashboard/system', label: 'System Metrics', icon: Server },
  { href: '/dashboard/monitoring', label: 'System Analytics', icon: BarChart3 },
  { href: '/dashboard/risk', label: 'Risk Analysis', icon: Shield },
];

export default function AdminSidebar() {
  const { userProfile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!userProfile) return null;

  return (
    <div className="flex flex-col h-full bg-[#011638]/90 backdrop-blur-md text-white">
      {/* Header */}
      <div className="p-6 border-b border-[#EEC643]/20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#EEC643] rounded-full flex items-center justify-center">
            <Settings className="w-6 h-6 text-[#141414]" />
          </div>
          <div>
            <h2 className="font-semibold">{userProfile.name}</h2>
            <p className="text-[#EEC643] text-sm">Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {adminRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;
          
          return (
            <button
              key={route.href}
              onClick={() => router.push(route.href)}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive 
                  ? 'bg-[#EEC643] text-[#141414] shadow-lg' 
                  : 'text-white/80 hover:bg-[#EEC643]/20 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{route.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#EEC643]/20">
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