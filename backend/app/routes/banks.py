from fastapi import APIRouter, Depends, HTTPException, Query
from app.middleware.auth_middleware import get_current_bank
from app.services.loan_service import LoanService
from app.services.analytics_service import AnalyticsService
from typing import List, Optional

router = APIRouter()

@router.get("/loans/pending")
async def get_pending_loans(current_user: dict = Depends(get_current_bank)):
    try:
        loans = await LoanService.get_pending_loans()
        return {"pending_loans": loans}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/loans/{loan_id}/approve")
async def approve_loan(
    loan_id: str,
    current_user: dict = Depends(get_current_bank)
):
    try:
        result = await LoanService.process_loan_application(loan_id, current_user['user_id'], True)
        return {"message": "Loan approved", **result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/loans/{loan_id}/reject")
async def reject_loan(
    loan_id: str,
    current_user: dict = Depends(get_current_bank)
):
    try:
        result = await LoanService.process_loan_application(loan_id, current_user['user_id'], False)
        return {"message": "Loan rejected", **result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/dashboard")
async def get_bank_dashboard(
    current_user: dict = Depends(get_current_bank),
    period: str = Query("30d", description="Time period: 7d, 30d, 90d, 1y")
):
    try:
        analytics = await AnalyticsService.get_bank_analytics(current_user['user_id'], period)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/loans/active")
async def get_active_loans(current_user: dict = Depends(get_current_bank)):
    try:
        # Get loans managed by this bank
        from app.firebase_admin import loans_ref
        loans = loans_ref.where("bank_id", "==", current_user['user_id']).where("status", "in", ["active", "approved"]).stream()
        return {"active_loans": [loan.to_dict() for loan in loans]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analytics/risk")
async def get_risk_analysis(current_user: dict = Depends(get_current_bank)):
    """Get detailed risk analysis for the bank's portfolio"""
    try:
        risk_analysis = await AnalyticsService.get_risk_analysis(current_user['user_id'])
        return risk_analysis
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analytics/performance")
async def get_performance_metrics(current_user: dict = Depends(get_current_bank)):
    """Get performance metrics for the bank's loan portfolio"""
    try:
        performance_metrics = await AnalyticsService.get_performance_metrics(current_user['user_id'])
        return performance_metrics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/loans/overdue")
async def get_overdue_loans(current_user: dict = Depends(get_current_bank)):
    """Get loans that are overdue on payments"""
    try:
        # This would require checking repayment schedules
        # For now, return empty as placeholder
        return {"overdue_loans": []}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))