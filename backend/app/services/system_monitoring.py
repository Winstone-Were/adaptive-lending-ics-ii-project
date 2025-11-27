import psutil
import GPUtil
from datetime import datetime
from app.firebase_admin import system_metrics_ref
from app.models.analytics_models import SystemMetrics

class SystemMonitoringService:
    
    @staticmethod
    async def collect_system_metrics():
        try:
            # CPU usage
            cpu_usage = psutil.cpu_percent(interval=1)
            
            # Memory usage
            memory = psutil.virtual_memory()
            memory_usage = memory.percent
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_usage = disk.percent
            
            # Enhanced GPU monitoring for CUDA
            gpu_usage = None
            gpu_memory_usage = None
            gpu_temperature = None
            gpu_power_usage = None
            
            try:
                gpus = GPUtil.getGPUs()
                if gpus:
                    # Get the first GPU (you can modify this to handle multiple GPUs)
                    gpu = gpus[0]
                    gpu_usage = gpu.load * 100  # GPU utilization %
                    gpu_memory_usage = (gpu.memoryUsed / gpu.memoryTotal) * 100  # GPU memory %
                    gpu_temperature = gpu.temperature
                    
                    # Try to get power consumption if available
                    try:
                        if hasattr(gpu, 'powerDraw') and gpu.powerDraw is not None:
                            gpu_power_usage = gpu.powerDraw
                        elif hasattr(gpu, 'power_load') and gpu.power_load is not None:
                            gpu_power_usage = gpu.power_load
                    except:
                        gpu_power_usage = None
                        
                    print(f"GPU: {gpu_usage:.1f}% usage, {gpu_memory_usage:.1f}% memory, {gpu_temperature}°C, {gpu_power_usage}W power")
                    
            except Exception as e:
                print(f"GPU monitoring error: {e}")
                gpu_usage = None
                gpu_memory_usage = None
                gpu_temperature = None
                gpu_power_usage = None
            
            # Enhanced Power consumption estimation
            total_power_consumption = None
            try:
                # Base system power (idle power ~50-100W depending on system)
                base_power = 80  # watts - adjust based on your system
                
                # CPU power scaling (0-100% usage adds 0-100W typically)
                cpu_power_contribution = cpu_usage * 1.0  # 1W per % usage
                
                # GPU power scaling
                gpu_power_contribution = 0
                if gpu_power_usage is not None:
                    gpu_power_contribution = gpu_power_usage
                elif gpu_usage is not None:
                    # Estimate GPU power if not directly available
                    # High-end GPUs can draw 200-400W at full load
                    gpu_power_contribution = gpu_usage * 3.0  # 3W per % usage for high-end GPU
                
                total_power_consumption = base_power + cpu_power_contribution + gpu_power_contribution
                
                print(f"Power estimate: Base={base_power}W, CPU={cpu_power_contribution:.1f}W, GPU={gpu_power_contribution:.1f}W, Total={total_power_consumption:.1f}W")
                
            except Exception as e:
                print(f"Power estimation error: {e}")
                total_power_consumption = None
            
            # Network and connections
            active_connections = len(psutil.net_connections())
            
            metrics = SystemMetrics(
                timestamp=datetime.utcnow(),
                cpu_usage=cpu_usage,
                memory_usage=memory_usage,
                disk_usage=disk_usage,
                gpu_usage=gpu_usage,
                gpu_memory_usage=gpu_memory_usage,
                gpu_temperature=gpu_temperature,
                gpu_power_usage=gpu_power_usage,
                power_consumption=total_power_consumption,
                active_connections=active_connections,
                request_rate=0
            )
            
            # Store in Firestore with error handling
            try:
                system_metrics_ref.add(metrics.dict())
                print(f"Stored metrics: CPU={cpu_usage}%, Memory={memory_usage}%, GPU={gpu_usage}%")
            except Exception as e:
                print(f"Firestore storage error: {e}")
            
            return metrics
            
        except Exception as e:
            print(f"System metrics collection error: {e}")
            return None
    
    @staticmethod
    async def get_system_analytics():
        # Get recent metrics (last 24 hours)
        from datetime import datetime, timedelta
        
        yesterday = datetime.utcnow() - timedelta(hours=24)
        
        # Query using datetime object directly
        metrics_query = system_metrics_ref.where("timestamp", ">", yesterday).stream()
        
        metrics_list = []
        for metric in metrics_query:
            data = metric.to_dict()
            # Convert Firestore timestamp to datetime if needed
            if 'timestamp' in data and hasattr(data['timestamp'], 'timestamp'):
                data['timestamp'] = data['timestamp'].timestamp()
            metrics_list.append(data)
        
        if not metrics_list:
            print("No metrics found in the last 24 hours")
            return {
                "cpu_usage": 0,
                "memory_usage": 0,
                "disk_usage": 0,
                "gpu_usage": 0,
                "gpu_memory_usage": 0,
                "gpu_temperature": 0,
                "power_consumption": 0,
                "system_uptime": 0,
                "active_connections": 0
            }
        
        # Debug: print what we found
        print(f"Found {len(metrics_list)} metrics records")
        
        # Calculate averages for all metrics
        def safe_avg(values):
            valid_values = [v for v in values if v is not None]
            return sum(valid_values) / len(valid_values) if valid_values else 0
        
        avg_cpu = safe_avg([m.get('cpu_usage', 0) for m in metrics_list])
        avg_memory = safe_avg([m.get('memory_usage', 0) for m in metrics_list])
        avg_disk = safe_avg([m.get('disk_usage', 0) for m in metrics_list])
        avg_gpu = safe_avg([m.get('gpu_usage', 0) for m in metrics_list])
        avg_gpu_memory = safe_avg([m.get('gpu_memory_usage', 0) for m in metrics_list])
        avg_gpu_temp = safe_avg([m.get('gpu_temperature', 0) for m in metrics_list])
        avg_power = safe_avg([m.get('power_consumption', 0) for m in metrics_list])
        
        return {
            "cpu_usage": round(avg_cpu, 2),
            "memory_usage": round(avg_memory, 2),
            "disk_usage": round(avg_disk, 2),
            "gpu_usage": round(avg_gpu, 2),
            "gpu_memory_usage": round(avg_gpu_memory, 2),
            "gpu_temperature": round(avg_gpu_temp, 1),
            "power_consumption": round(avg_power, 1),
            "system_uptime": psutil.boot_time(),
            "active_connections": metrics_list[-1].get('active_connections', 0)
        }
    
    @staticmethod
    async def get_gpu_analytics():
        """Get detailed GPU analytics"""
        from datetime import datetime, timedelta
        
        yesterday = datetime.utcnow() - timedelta(hours=24)
        metrics_query = system_metrics_ref.where("timestamp", ">", yesterday).stream()
        
        metrics_list = []
        for metric in metrics_query:
            data = metric.to_dict()
            metrics_list.append(data)
        
        if not metrics_list:
            return {"gpu_available": False}
        
        # Filter metrics that have GPU data
        gpu_metrics = [m for m in metrics_list if m.get('gpu_usage') is not None]
        
        if not gpu_metrics:
            return {"gpu_available": False}
        
        def safe_avg(values):
            valid_values = [v for v in values if v is not None]
            return sum(valid_values) / len(valid_values) if valid_values else 0
        
        return {
            "gpu_available": True,
            "gpu_usage_avg": safe_avg([m.get('gpu_usage', 0) for m in gpu_metrics]),
            "gpu_usage_max": max([m.get('gpu_usage', 0) for m in gpu_metrics]),
            "gpu_memory_avg": safe_avg([m.get('gpu_memory_usage', 0) for m in gpu_metrics]),
            "gpu_temperature_avg": safe_avg([m.get('gpu_temperature', 0) for m in gpu_metrics]),
            "gpu_temperature_max": max([m.get('gpu_temperature', 0) for m in gpu_metrics]),
            "gpu_power_avg": safe_avg([m.get('gpu_power_usage', 0) for m in gpu_metrics]),
            "total_power_avg": safe_avg([m.get('power_consumption', 0) for m in gpu_metrics]),
            "sample_count": len(gpu_metrics)
        }