'use client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { 
  Users, 
  Server, 
  BarChart3,
  Shield,
  Cpu,
  Database
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => apiRequest('/auth/me'),
  });

  const { data: systemAnalytics } = useQuery({
    queryKey: ['system-analytics'],
    queryFn: () => apiRequest('/admin/system/analytics'),
  });

  const { data: users } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => apiRequest('/admin/users'),
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#141414]">Admin Dashboard</h1>
        <p className="text-[#141414]/70">System Overview & Management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-[#141414]">
                {systemAnalytics?.total_users || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#EEC643] rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-[#141414]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">System Uptime</p>
              <p className="text-2xl font-bold text-[#141414]">
                {systemAnalytics?.system_uptime ? `${systemAnalytics.system_uptime}%` : '100%'}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#0D21A1] rounded-full flex items-center justify-center">
              <Server className="w-6 h-6 text-[#EFF0F2]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Total Loans</p>
              <p className="text-2xl font-bold text-[#141414]">
                {systemAnalytics?.total_loans || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#011638] rounded-full flex items-center justify-center">
              <Database className="w-6 h-6 text-[#EFF0F2]" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">CPU Usage</p>
              <p className="text-2xl font-bold text-[#141414]">
                {systemAnalytics?.cpu_usage ? `${systemAnalytics.cpu_usage}%` : '0%'}
              </p>
            </div>
            <div className="w-12 h-12 bg-[#EEC643] rounded-full flex items-center justify-center">
              <Cpu className="w-6 h-6 text-[#141414]" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions & User Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#141414] mb-4">System Management</h3>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/dashboard/users')}
              className="w-full bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414]"
            >
              <Users className="w-4 h-4 mr-2" />
              User Management
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/system')}
              className="w-full bg-[#0D21A1] hover:bg-[#0D21A1]/90 text-[#EFF0F2]"
            >
              <Server className="w-4 h-4 mr-2" />
              System Metrics
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/monitoring')}
              className="w-full bg-[#011638] hover:bg-[#011638]/90 text-[#EFF0F2]"
            >
              <Shield className="w-4 h-4 mr-2" />
              System Monitoring
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-[#141414] mb-4">User Distribution</h3>
          <div className="space-y-4">
            {users?.users?.reduce((acc: any, user: any) => {
              acc[user.role] = (acc[user.role] || 0) + 1;
              return acc;
            }, {}) && Object.entries(users.users.reduce((acc: any, user: any) => {
              acc[user.role] = (acc[user.role] || 0) + 1;
              return acc;
            }, {})).map(([role, count]: [string, any]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-[#141414] capitalize">{role}s</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-[#EFF0F2] rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        role === 'customer' ? 'bg-[#EEC643]' :
                        role === 'bank' ? 'bg-[#0D21A1]' :
                        'bg-[#011638]'
                      }`}
                      style={{ width: `${(count / users.users.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-[#141414] font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}