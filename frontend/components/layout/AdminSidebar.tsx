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

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

const adminRoutes = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/users', label: 'User Management', icon: Users },
  { href: '/dashboard/system', label: 'System Metrics', icon: Server },
  { href: '/dashboard/analytics', label: 'System Analytics', icon: BarChart3 },
  { href: '/dashboard/monitoring', label: 'Monitoring', icon: Shield },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full bg-primary/90 backdrop-blur-md text-white">
      {/* Header */}
      <div className="p-6 border-b border-accent/20">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
            <Settings className="w-6 h-6 text-text" />
          </div>
          <div>
            <h2 className="font-semibold">{user.name}</h2>
            <p className="text-accent text-sm">Admin</p>
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