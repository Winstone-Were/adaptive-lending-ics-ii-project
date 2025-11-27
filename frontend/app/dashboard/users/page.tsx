'use client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { toast } from 'sonner';
import { Users, User, Building, Settings, Trash2, Mail, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => apiRequest('/admin/users'),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    },
    onError: (error: any) => {
      toast.error('Failed to delete user');
    },
  });

  const filteredUsers = users?.users?.filter((user: any) => 
    selectedRole === 'all' || user.role === selectedRole
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'customer':
        return <User className="w-4 h-4" />;
      case 'bank':
        return <Building className="w-4 h-4" />;
      case 'admin':
        return <Settings className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'customer':
        return 'bg-[#EEC643] text-[#141414]';
      case 'bank':
        return 'bg-[#0D21A1] text-[#EFF0F2]';
      case 'admin':
        return 'bg-[#011638] text-[#EFF0F2]';
      default:
        return 'bg-gray-500 text-white';
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
        <h1 className="text-3xl font-bold text-[#141414]">User Management</h1>
        <p className="text-[#141414]/70">Manage system users and permissions</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-[#141414]">{users?.users?.length || 0}</p>
            </div>
            <Users className="w-8 h-8 text-[#011638]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Customers</p>
              <p className="text-2xl font-bold text-[#141414]">
                {users?.users?.filter((u: any) => u.role === 'customer').length || 0}
              </p>
            </div>
            <User className="w-8 h-8 text-[#EEC643]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Banks</p>
              <p className="text-2xl font-bold text-[#141414]">
                {users?.users?.filter((u: any) => u.role === 'bank').length || 0}
              </p>
            </div>
            <Building className="w-8 h-8 text-[#0D21A1]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Admins</p>
              <p className="text-2xl font-bold text-[#141414]">
                {users?.users?.filter((u: any) => u.role === 'admin').length || 0}
              </p>
            </div>
            <Settings className="w-8 h-8 text-[#011638]" />
          </div>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-6">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setSelectedRole('all')}
            variant={selectedRole === 'all' ? 'primary' : 'secondary'}
            className={selectedRole === 'all' ? 'bg-[#EEC643] text-[#141414]' : ''}
          >
            All Users
          </Button>
          <Button
            onClick={() => setSelectedRole('customer')}
            variant={selectedRole === 'customer' ? 'primary' : 'secondary'}
            className={selectedRole === 'customer' ? 'bg-[#EEC643] text-[#141414]' : ''}
          >
            Customers
          </Button>
          <Button
            onClick={() => setSelectedRole('bank')}
            variant={selectedRole === 'bank' ? 'primary' : 'secondary'}
            className={selectedRole === 'bank' ? 'bg-[#0D21A1] text-[#EFF0F2]' : ''}
          >
            Banks
          </Button>
          <Button
            onClick={() => setSelectedRole('admin')}
            variant={selectedRole === 'admin' ? 'primary' : 'secondary'}
            className={selectedRole === 'admin' ? 'bg-[#011638] text-[#EFF0F2]' : ''}
          >
            Admins
          </Button>
        </div>
      </GlassCard>

      {/* Users Table */}
      <GlassCard className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#011638]/20">
                <th className="text-left py-3 px-4 text-[#141414] font-semibold">User</th>
                <th className="text-left py-3 px-4 text-[#141414] font-semibold">Role</th>
                <th className="text-left py-3 px-4 text-[#141414] font-semibold">Contact</th>
                <th className="text-left py-3 px-4 text-[#141414] font-semibold">Joined</th>
                <th className="text-left py-3 px-4 text-[#141414] font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers?.map((user: any) => (
                <tr key={user.user_id} className="border-b border-[#011638]/10 hover:bg-[#EFF0F2]">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <p className="font-medium text-[#141414]">{user.name}</p>
                        <p className="text-sm text-[#141414]/70 capitalize">{user.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1 capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4 text-[#141414]/50" />
                      <span className="text-[#141414]">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-[#141414]/50" />
                      <span className="text-[#141414]">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                          deleteUserMutation.mutate(user.user_id);
                        }
                      }}
                      disabled={deleteUserMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!filteredUsers || filteredUsers.length === 0) && (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-[#011638]/30 mx-auto mb-4" />
              <p className="text-[#141414]/70">No users found</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}