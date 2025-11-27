from app.firebase_admin import db
from app.models.user_models import LoanPackageCreate
from datetime import datetime
import uuid
from firebase_admin import firestore

loan_packages_ref = db.collection("loan_packages")

class LoanPackageService:
    
    @staticmethod
    async def create_loan_package(package_data: LoanPackageCreate, bank_id: str):
        package_id = str(uuid.uuid4())
        package_doc = {
            "package_id": package_id,
            "bank_id": bank_id,
            "name": package_data.name,
            "amount": package_data.amount,
            "interest_rate": package_data.interest_rate,
            "loan_term_months": package_data.loan_term_months,
            "minimum_credit_score": package_data.minimum_credit_score,
            "description": package_data.description,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        
        loan_packages_ref.document(package_id).set(package_doc)
        
        # Add package to bank's loan packages list
        bank_ref = db.collection("users").document(bank_id)
        bank_ref.update({
            "loan_packages": firestore.ArrayUnion([package_id])
        })
        
        return package_doc
    
    @staticmethod
    async def get_loan_packages(bank_id: str = None):
        if bank_id:
            query = loan_packages_ref.where("bank_id", "==", bank_id).where("is_active", "==", True)
        else:
            query = loan_packages_ref.where("is_active", "==", True)
        
        packages = query.stream()
        return [package.to_dict() for package in packages]
    
    @staticmethod
    async def get_loan_package(package_id: str):
        package_doc = loan_packages_ref.document(package_id).get()
        if package_doc.exists:
            return package_doc.to_dict()
        return None
    
    @staticmethod
    async def update_loan_package(package_id: str, update_data: dict):
        loan_packages_ref.document(package_id).update({
            **update_data,
            "updated_at": datetime.utcnow()
        })
    
    @staticmethod
    async def delete_loan_package(package_id: str):
        loan_packages_ref.document(package_id).update({
            "is_active": False,
            "updated_at": datetime.utcnow()
        })