from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth_middleware import get_current_customer
from app.services.user_service import UserService
from app.services.loan_service import LoanService
from app.models.user_models import UserUpdate
from app.models.loan_models import LoanApplication, RepaymentRequest
from typing import List

router = APIRouter()

@router.get("/profile")
async def get_customer_profile(current_user: dict = Depends(get_current_customer)):
    return current_user

@router.put("/profile")
async def update_customer_profile(
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_customer)
):
    try:
        updated_user = await UserService.update_user_profile(current_user['user_id'], update_data)
        return {"message": "Profile updated successfully", "user": updated_user}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/loans/apply")
async def apply_for_loan(
    application: LoanApplication,
    current_user: dict = Depends(get_current_customer)
):
    try:
        result = await LoanService.apply_for_loan(application, current_user['user_id'])
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/loans")
async def get_my_loans(current_user: dict = Depends(get_current_customer)):
    try:
        loans = await LoanService.get_user_loans(current_user['user_id'])
        return {"loans": loans}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/loans/{loan_id}/repay")
async def repay_loan(
    loan_id: str,
    repayment: RepaymentRequest,
    current_user: dict = Depends(get_current_customer)
):
    try:
        result = await LoanService.make_repayment(loan_id, repayment)
        return {"message": "Payment successful", **result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))