'use client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/utils';
import { toast } from 'sonner';
import { Cpu, MemoryStick, HardDrive, Activity, Wifi, Zap, RefreshCw } from 'lucide-react';

export default function SystemMetrics() {
  const queryClient = useQueryClient();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: () => apiRequest('/admin/system/metrics'),
  });

  const collectMetricsMutation = useMutation({
    mutationFn: () => apiRequest('/admin/system/collect-metrics', {
      method: 'POST',
    }),
    onSuccess: () => {
      toast.success('Metrics collected successfully');
      queryClient.invalidateQueries({ queryKey: ['system-metrics'] });
    },
    onError: (error: any) => {
      toast.error('Failed to collect metrics');
    },
  });

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'text-green-600';
    if (usage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUsageLevel = (usage: number) => {
    if (usage < 50) return 'Low';
    if (usage < 80) return 'Medium';
    return 'High';
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
          <h1 className="text-3xl font-bold text-[#141414]">System Metrics</h1>
          <p className="text-[#141414]/70">Real-time system performance monitoring</p>
        </div>
        <Button
          onClick={() => collectMetricsMutation.mutate()}
          disabled={collectMetricsMutation.isPending}
          className="bg-[#EEC643] hover:bg-[#EEC643]/90 text-[#141414]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {collectMetricsMutation.isPending ? 'Collecting...' : 'Collect Metrics'}
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">CPU Usage</p>
              <p className={`text-2xl font-bold ${getUsageColor(metrics?.cpu_usage || 0)}`}>
                {metrics?.cpu_usage?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-[#141414]/70">{getUsageLevel(metrics?.cpu_usage || 0)} Load</p>
            </div>
            <Cpu className="w-8 h-8 text-[#011638]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Memory Usage</p>
              <p className={`text-2xl font-bold ${getUsageColor(metrics?.memory_usage || 0)}`}>
                {metrics?.memory_usage?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-[#141414]/70">{getUsageLevel(metrics?.memory_usage || 0)} Load</p>
            </div>
            <MemoryStick className="w-8 h-8 text-[#0D21A1]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Disk Usage</p>
              <p className={`text-2xl font-bold ${getUsageColor(metrics?.disk_usage || 0)}`}>
                {metrics?.disk_usage?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-[#141414]/70">{getUsageLevel(metrics?.disk_usage || 0)} Load</p>
            </div>
            <HardDrive className="w-8 h-8 text-[#EEC643]" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#141414]/70 text-sm">Active Connections</p>
              <p className="text-2xl font-bold text-[#141414]">
                {metrics?.active_connections || 0}
              </p>
              <p className="text-sm text-[#141414]/70">Network Load</p>
            </div>
            <Wifi className="w-8 h-8 text-[#011638]" />
          </div>
        </GlassCard>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GPU Usage */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-[#EEC643]" />
            <h3 className="text-lg font-semibold text-[#141414]">GPU Usage</h3>
          </div>
          
          <div className="text-center py-8">
            {metrics?.gpu_usage ? (
              <>
                <div className={`text-4xl font-bold ${getUsageColor(metrics.gpu_usage)} mb-2`}>
                  {metrics.gpu_usage.toFixed(1)}%
                </div>
                <p className="text-[#141414]/70">GPU Utilization</p>
                <p className="text-sm text-[#141414]/50 mt-2">{getUsageLevel(metrics.gpu_usage)} Load</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-[#141414]/50 mb-2">N/A</div>
                <p className="text-[#141414]/70">GPU Not Available</p>
              </>
            )}
          </div>
        </GlassCard>

        {/* Power Consumption */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-[#0D21A1]" />
            <h3 className="text-lg font-semibold text-[#141414]">Power Consumption</h3>
          </div>
          
          <div className="text-center py-8">
            {metrics?.power_consumption ? (
              <>
                <div className="text-4xl font-bold text-[#141414] mb-2">
                  {metrics.power_consumption.toFixed(1)}W
                </div>
                <p className="text-[#141414]/70">Estimated Power Draw</p>
                <p className="text-sm text-[#141414]/50 mt-2">System + GPU</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-[#141414]/50 mb-2">N/A</div>
                <p className="text-[#141414]/70">Power Metrics Unavailable</p>
              </>
            )}
          </div>
        </GlassCard>
      </div>

      {/* System Health */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[#141414] mb-4">System Health Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-[#EFF0F2] rounded-lg">
            <span className="text-[#141414]">System Uptime</span>
            <span className="font-semibold text-[#141414]">
              {metrics?.system_uptime ? `${metrics.system_uptime.toFixed(1)}%` : '100%'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-[#EFF0F2] rounded-lg">
            <span className="text-[#141414]">Request Rate</span>
            <span className="font-semibold text-[#141414]">
              {metrics?.request_rate ? `${metrics.request_rate.toFixed(1)}/sec` : '0/sec'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-[#EFF0F2] rounded-lg">
            <span className="text-[#141414]">Last Updated</span>
            <span className="font-semibold text-[#141414]">
              {metrics?.timestamp ? new Date(metrics.timestamp).toLocaleString() : 'Never'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-[#EFF0F2] rounded-lg">
            <span className="text-[#141414]">Health Status</span>
            <span className={`font-semibold ${
              (metrics?.cpu_usage || 0) < 80 && (metrics?.memory_usage || 0) < 80 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {((metrics?.cpu_usage || 0) < 80 && (metrics?.memory_usage || 0) < 80) 
                ? 'Healthy' 
                : 'Warning'
              }
            </span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}