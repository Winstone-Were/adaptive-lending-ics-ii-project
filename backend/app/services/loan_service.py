from app.firebase_admin import loans_ref, repayments_ref, users_ref, db
from app.models.loan_models import LoanApplication, RepaymentRequest, LoanStatus
from app.services.scoring_service import ScoringService
from app.utils.model_utils import predict_default_probability
from datetime import datetime, timedelta
import uuid
from typing import List
from firebase_admin import firestore

class LoanService:
    
    @staticmethod
    async def apply_for_loan(application: LoanApplication, user_id: str):
        # Map application data to the format expected by the model
        application_dict = application.dict()
        
        # Prepare input data for the model
        input_data = {
            "Income": application.income,
            "InterestRate": application.interest_rate,
            "LoanAmount": application.loan_amount,
            "Age": application.age,
            "CreditScore": application.credit_score,
            "MonthsEmployed": application.months_employed,
            "DTIRatio": application.dti_ratio
        }
        
        # Predict default probability using the model utils
        default_probability = predict_default_probability(input_data)
        
        # Calculate credit score and decision
        scoring_result = ScoringService.calculate_loan_decision(default_probability, application.credit_score)
        
        # Create loan document
        loan_id = str(uuid.uuid4())
        loan_data = {
            "loan_id": loan_id,
            "user_id": user_id,
            "application_data": application_dict,
            "default_probability": default_probability,
            "credit_score_at_application": application.credit_score,
            "credit_grade": scoring_result["credit_grade"],
            "decision": scoring_result["decision"],
            "recommendation": scoring_result["recommendation"],
            "status": LoanStatus.PENDING,
            "amount_remaining": application.loan_amount,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "next_payment_date": datetime.utcnow() + timedelta(days=30)  # First payment in 30 days
        }
        
        loans_ref.document(loan_id).set(loan_data)
        
        # Add to user's loan history
        user_ref = users_ref.document(user_id)
        user_ref.update({
            "loan_history": firestore.ArrayUnion([loan_id])
        })
        
        return {**loan_data, "loan_id": loan_id}
    
    @staticmethod
    async def process_loan_application(loan_id: str, bank_id: str, approve: bool):
        loan_ref = loans_ref.document(loan_id)
        loan_doc = loan_ref.get()
        
        if not loan_doc.exists:
            raise ValueError("Loan not found")
        
        loan_data = loan_doc.to_dict()
        
        if approve:
            new_status = LoanStatus.APPROVED
            # Update user's debt and DTI
            user_id = loan_data['user_id']
            user_ref = users_ref.document(user_id)
            user_doc = user_ref.get().to_dict()
            
            new_debt = user_doc.get('total_debt', 0) + loan_data['application_data']['loan_amount']
            new_dti = new_debt / user_doc.get('income', 1)
            
            user_ref.update({
                'total_debt': new_debt,
                'current_dti': new_dti
            })
            
            # Update bank stats
            bank_ref = users_ref.document(bank_id)
            bank_ref.update({
                'total_loans_approved': firestore.Increment(1),
                'total_loans_under_management': firestore.Increment(1)
            })
        else:
            new_status = LoanStatus.REJECTED
            # Update bank stats
            bank_ref = users_ref.document(bank_id)
            bank_ref.update({
                'total_loans_rejected': firestore.Increment(1)
            })
        
        loan_ref.update({
            'status': new_status,
            'bank_id': bank_id,
            'updated_at': datetime.utcnow()
        })
        
        return {"status": new_status, "loan_id": loan_id}
    
    @staticmethod
    async def make_repayment(loan_id: str, repayment: RepaymentRequest):
        loan_ref = loans_ref.document(loan_id)
        loan_doc = loan_ref.get()
        
        if not loan_doc.exists:
            raise ValueError("Loan not found")
        
        loan_data = loan_doc.to_dict()
        
        if loan_data['status'] != LoanStatus.ACTIVE:
            raise ValueError("Loan is not active")
        
        # Create repayment record
        payment_id = str(uuid.uuid4())
        repayment_data = {
            "payment_id": payment_id,
            "loan_id": loan_id,
            "amount": repayment.amount,
            "payment_date": datetime.utcnow(),
            "due_date": loan_data.get('next_payment_date', datetime.utcnow()),
            "status": "paid",
            "created_at": datetime.utcnow()
        }
        
        repayments_ref.document(payment_id).set(repayment_data)
        
        # Update loan remaining amount
        new_remaining = loan_data['amount_remaining'] - repayment.amount
        updates = {
            "amount_remaining": new_remaining,
            "updated_at": datetime.utcnow(),
            "next_payment_date": datetime.utcnow() + timedelta(days=30)
        }
        
        if new_remaining <= 0:
            updates["status"] = LoanStatus.PAID
        
        loan_ref.update(updates)
        
        # Update user's debt
        user_id = loan_data['user_id']
        user_ref = users_ref.document(user_id)
        user_doc = user_ref.get().to_dict()
        
        new_debt = max(0, user_doc.get('total_debt', 0) - repayment.amount)
        new_dti = new_debt / user_doc.get('income', 1)
        
        user_ref.update({
            'total_debt': new_debt,
            'current_dti': new_dti
        })
        
        return {
            "payment_id": payment_id,
            "amount_remaining": new_remaining,
            "loan_status": updates.get("status", LoanStatus.ACTIVE)
        }
    
    @staticmethod
    async def get_user_loans(user_id: str):
        loans = loans_ref.where("user_id", "==", user_id).stream()
        return [loan.to_dict() for loan in loans]
    
    @staticmethod
    async def get_pending_loans():
        loans = loans_ref.where("status", "==", LoanStatus.PENDING).stream()
        return [loan.to_dict() for loan in loans]
    
    @staticmethod
    async def get_loans_by_bank(bank_id: str):
        """Get all loans processed by a specific bank"""
        loans = loans_ref.where("bank_id", "==", bank_id).stream()
        return [loan.to_dict() for loan in loans]