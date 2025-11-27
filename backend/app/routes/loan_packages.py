from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth_middleware import get_current_bank
from app.services.loan_package_service import LoanPackageService
from app.models.user_models import LoanPackageCreate

router = APIRouter()

@router.post("/packages")
async def create_loan_package(
    package_data: LoanPackageCreate,
    current_user: dict = Depends(get_current_bank)
):
    """Create a new loan package (Bank only)"""
    try:
        package = await LoanPackageService.create_loan_package(package_data, current_user['user_id'])
        return {"message": "Loan package created successfully", "package": package}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/packages")
async def get_loan_packages(current_user: dict = Depends(get_current_bank)):
    """Get loan packages for the current bank"""
    try:
        packages = await LoanPackageService.get_loan_packages(current_user['user_id'])
        return {"packages": packages}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/packages/all")
async def get_all_loan_packages():
    """Get all active loan packages (for customers)"""
    try:
        packages = await LoanPackageService.get_loan_packages()
        return {"packages": packages}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/packages/{package_id}")
async def update_loan_package(
    package_id: str,
    update_data: dict,
    current_user: dict = Depends(get_current_bank)
):
    """Update a loan package"""
    try:
        # Verify the package belongs to the current bank
        package = await LoanPackageService.get_loan_package(package_id)
        if not package or package['bank_id'] != current_user['user_id']:
            raise HTTPException(status_code=404, detail="Package not found")
        
        await LoanPackageService.update_loan_package(package_id, update_data)
        return {"message": "Package updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/packages/{package_id}")
async def delete_loan_package(
    package_id: str,
    current_user: dict = Depends(get_current_bank)
):
    """Delete (deactivate) a loan package"""
    try:
        # Verify the package belongs to the current bank
        package = await LoanPackageService.get_loan_package(package_id)
        if not package or package['bank_id'] != current_user['user_id']:
            raise HTTPException(status_code=404, detail="Package not found")
        
        await LoanPackageService.delete_loan_package(package_id)
        return {"message": "Package deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))