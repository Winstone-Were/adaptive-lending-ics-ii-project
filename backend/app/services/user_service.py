from app.firebase_admin import users_ref, db
from app.models.user_models import UserCreate, UserUpdate, CustomerProfile, BankProfile
from datetime import datetime
import uuid

class UserService:
    
    @staticmethod
    async def create_user(user_data: UserCreate, firebase_uid: str):
        user_doc = {
            "user_id": firebase_uid,
            "email": user_data.email,
            "name": user_data.name,
            "role": user_data.role,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        if user_data.role == "customer":
            user_doc.update({
                "income": user_data.income,
                "age": user_data.age,
                "months_employed": user_data.months_employed,
                "current_credit_score": 650,  # Default starting score
                "total_debt": 0.0,
                "current_dti": 0.0,
                "employment_status": "employed",
                "loan_history": []
            })
        elif user_data.role == "bank":
            user_doc.update({
                "bank_name": user_data.bank_name,
                "max_dti_threshold": 0.45,
                "total_loans_approved": 0,
                "total_loans_rejected": 0,
                "total_loans_under_management": 0
            })
        
        users_ref.document(firebase_uid).set(user_doc)
        return user_doc
    
    @staticmethod
    async def update_user_profile(uid: str, update_data: UserUpdate):
        user_ref = users_ref.document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            raise ValueError("User not found")
        
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()
        
        user_ref.update(update_dict)
        return user_ref.get().to_dict()
    
    @staticmethod
    async def get_user_profile(uid: str):
        user_doc = users_ref.document(uid).get()
        if user_doc.exists:
            return user_doc.to_dict()
        return None
    
    @staticmethod
    async def update_credit_score(uid: str, new_score: float):
        users_ref.document(uid).update({
            "current_credit_score": new_score,
            "updated_at": datetime.utcnow()
        })
    
    @staticmethod
    async def update_debt_info(uid: str, new_debt: float, new_dti: float):
        users_ref.document(uid).update({
            "total_debt": new_debt,
            "current_dti": new_dti,
            "updated_at": datetime.utcnow()
        })
    
    @staticmethod
    async def get_all_users(role: str = None):
        if role:
            query = users_ref.where("role", "==", role)
        else:
            query = users_ref
        
        users = query.stream()
        return [user.to_dict() for user in users]