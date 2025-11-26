from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth_middleware import get_current_admin
from app.services.user_service import UserService
from app.services.system_monitoring import SystemMonitoringService
from app.services.analytics_service import AnalyticsService
from app.models.user_models import UserCreate
from typing import List

router = APIRouter()

@router.get("/users")
async def get_all_users(current_user: dict = Depends(get_current_admin)):
    try:
        users = await UserService.get_all_users()
        return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/users/{role}")
async def get_users_by_role(role: str, current_user: dict = Depends(get_current_admin)):
    try:
        users = await UserService.get_all_users(role)
        return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_admin)):
    try:
        # Note: This only removes from Firestore, not Firebase Auth
        from app.firebase_admin import users_ref
        users_ref.document(user_id).delete()
        return {"message": "User deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/system/metrics")
async def get_system_metrics(current_user: dict = Depends(get_current_admin)):
    try:
        metrics = await SystemMonitoringService.get_system_analytics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/system/analytics")
async def get_system_analytics(current_user: dict = Depends(get_current_admin)):
    try:
        analytics = await AnalyticsService.get_system_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/system/collect-metrics")
async def collect_system_metrics(current_user: dict = Depends(get_current_admin)):
    try:
        metrics = await SystemMonitoringService.collect_system_metrics()
        return {"message": "Metrics collected", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))