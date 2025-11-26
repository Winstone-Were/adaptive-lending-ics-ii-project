from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime

class BankAnalytics(BaseModel):
    bank_id: str
    total_loans_processed: int
    approval_rate: float
    default_rate: float
    average_loan_amount: float
    total_portfolio_value: float
    risk_distribution: Dict[str, int]  # credit grade counts
    monthly_trends: List[Dict]

class SystemAnalytics(BaseModel):
    total_users: int
    total_loans: int
    system_uptime: float
    model_accuracy: Optional[float]
    avg_response_time: float
    active_loans: int
    total_loan_volume: float

class SystemMetrics(BaseModel):
    timestamp: datetime
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    gpu_usage: Optional[float]
    power_consumption: Optional[float]
    active_connections: int
    request_rate: float