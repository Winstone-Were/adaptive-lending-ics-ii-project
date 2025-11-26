import psutil
import GPUtil
from datetime import datetime
from app.firebase_admin import system_metrics_ref
from app.models.analytics_models import SystemMetrics

class SystemMonitoringService:
    
    @staticmethod
    async def collect_system_metrics():
        # CPU usage
        cpu_usage = psutil.cpu_percent(interval=1)
        
        # Memory usage
        memory = psutil.virtual_memory()
        memory_usage = memory.percent
        
        # Disk usage
        disk = psutil.disk_usage('/')
        disk_usage = disk.percent
        
        # GPU usage (if available)
        gpu_usage = None
        try:
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu_usage = gpus[0].load * 100
        except:
            gpu_usage = None
        
        # Power consumption (estimate)
        power_consumption = None
        try:
            # This is a rough estimate
            power_consumption = cpu_usage * 0.5 + (gpu_usage * 2 if gpu_usage else 0)
        except:
            pass
        
        # Network and connections
        active_connections = len(psutil.net_connections())
        
        metrics = SystemMetrics(
            timestamp=datetime.utcnow(),
            cpu_usage=cpu_usage,
            memory_usage=memory_usage,
            disk_usage=disk_usage,
            gpu_usage=gpu_usage,
            power_consumption=power_consumption,
            active_connections=active_connections,
            request_rate=0  # Would need to be calculated from request logs
        )
        
        # Store in Firestore
        system_metrics_ref.add(metrics.dict())
        
        return metrics
    
    @staticmethod
    async def get_system_analytics():
        # Get recent metrics (last 24 hours)
        yesterday = datetime.utcnow().timestamp() - 86400
        metrics_query = system_metrics_ref.where("timestamp", ">", yesterday).stream()
        
        metrics_list = [metric.to_dict() for metric in metrics_query]
        
        if not metrics_list:
            return {
                "cpu_usage": 0,
                "memory_usage": 0,
                "disk_usage": 0,
                "system_uptime": 0,
                "active_connections": 0
            }
        
        # Calculate averages
        avg_cpu = sum(m['cpu_usage'] for m in metrics_list) / len(metrics_list)
        avg_memory = sum(m['memory_usage'] for m in metrics_list) / len(metrics_list)
        avg_disk = sum(m['disk_usage'] for m in metrics_list) / len(metrics_list)
        
        return {
            "cpu_usage": avg_cpu,
            "memory_usage": avg_memory,
            "disk_usage": avg_disk,
            "system_uptime": psutil.boot_time(),
            "active_connections": metrics_list[-1].get('active_connections', 0)
        }