from app.firebase_admin import users_ref, db
from app.models.user_models import UserCreate, UserUpdate, CustomerProfile, BankProfile
from datetime import date, datetime
import uuid

class UserService:
    
    @staticmethod
    def calculate_age(date_of_birth: date) -> int:
        """Calculate age from date of birth"""
        today = date.today()
        return today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
    
    @staticmethod
    def calculate_months_employed(employment_start_date: date) -> int:
        """Calculate months employed from start date"""
        today = date.today()
        return (today.year - employment_start_date.year) * 12 + (today.month - employment_start_date.month)
    
    @staticmethod
    async def create_user(user_data: UserCreate, firebase_uid: str):
        user_doc = {
            "user_id": firebase_uid,
            "email": user_data.email,
            "name": user_data.name,
            "role": "customer",  # Always customer for this flow
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Since role is always customer, we can directly process customer data
        # Handle date conversion from string
        date_of_birth = None
        employment_start_date = None
        
        if user_data.date_of_birth:
            try:
                # Parse string date to datetime object
                if isinstance(user_data.date_of_birth, str):
                    date_of_birth = datetime.fromisoformat(user_data.date_of_birth)
                else:
                    date_of_birth = user_data.date_of_birth
            except:
                date_of_birth = None
        
        if user_data.employment_start_date:
            try:
                if isinstance(user_data.employment_start_date, str):
                    employment_start_date = datetime.fromisoformat(user_data.employment_start_date)
                else:
                    employment_start_date = user_data.employment_start_date
            except:
                employment_start_date = None
        
        # Calculate age and months employed
        age = UserService.calculate_age(date_of_birth) if date_of_birth else 0
        months_employed = UserService.calculate_months_employed(employment_start_date) if employment_start_date else 0
        
        user_doc.update({
            "income": user_data.income,
            "date_of_birth": date_of_birth.isoformat() if date_of_birth else None,
            "employment_start_date": employment_start_date.isoformat() if employment_start_date else None,
            "age": age,
            "months_employed": months_employed,
            "current_credit_score": 650,
            "total_debt": 0.0,
            "current_dti": 0.0,
            "employment_status": "employed",
            "loan_history": []
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