from app.firebase_admin import loans_ref, repayments_ref, users_ref, db
from app.models.loan_models import LoanApplication, RepaymentRequest, LoanStatus, LoanApplicationWithPackage
from app.services.scoring_service import ScoringService
from app.services.loan_package_service import LoanPackageService
from app.services.user_service import UserService
from app.utils.model_utils import predict_default_probability
from datetime import datetime, timedelta
import uuid
from typing import List
from firebase_admin import firestore

class LoanService:
    
    @staticmethod
    async def apply_for_loan(application: LoanApplication, user_id: str):
        """Apply for a loan with custom parameters"""
        try:
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
                "total_amount": application.loan_amount,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "next_payment_date": None,  # Will be set when activated
                "payment_schedule": LoanService._generate_payment_schedule(
                    application.loan_amount, 
                    application.interest_rate, 
                    application.loan_term_months
                )
            }
            
            loans_ref.document(loan_id).set(loan_data)
            
            # Add to user's loan history
            user_ref = users_ref.document(user_id)
            user_ref.update({
                "loan_history": firestore.ArrayUnion([loan_id])
            })
            
            return {**loan_data, "loan_id": loan_id}
            
        except Exception as e:
            raise ValueError(f"Failed to apply for loan: {str(e)}")
    
    @staticmethod
    async def apply_for_loan_with_package(application: LoanApplicationWithPackage, user_id: str):
        """Apply for a loan using a pre-defined package"""
        try:
            # Get the loan package
            package = await LoanPackageService.get_loan_package(application.package_id)
            if not package:
                raise ValueError("Loan package not found")
            
            # Get user profile for verification
            user_profile = await UserService.get_user_profile(user_id)
            if not user_profile:
                raise ValueError("User profile not found")
            
            # Verify user meets package requirements
            if user_profile.get('current_credit_score', 0) < package['minimum_credit_score']:
                raise ValueError("Credit score does not meet package requirements")
            
            # Prepare input data for model prediction
            input_data = {
                "Income": user_profile.get('income', 0),
                "InterestRate": package['interest_rate'],
                "LoanAmount": package['amount'],
                "Age": user_profile.get('age', 0),
                "CreditScore": user_profile.get('current_credit_score', 650),
                "MonthsEmployed": user_profile.get('months_employed', 0),
                "DTIRatio": user_profile.get('current_dti', 0)
            }
            
            # Predict default probability
            default_probability = predict_default_probability(input_data)
            
            # Calculate NEW credit score based on default probability
            current_credit_score = user_profile.get('current_credit_score', 650)
            new_credit_score = ScoringService.calculate_credit_score(default_probability, current_credit_score)
            
            # Calculate credit score and decision
            scoring_result = ScoringService.calculate_loan_decision(
                default_probability, 
                new_credit_score  # Use the NEW credit score for decision
            )
            
            # Create loan document
            loan_id = str(uuid.uuid4())
            loan_data = {
                "loan_id": loan_id,
                "user_id": user_id,
                "package_id": application.package_id,
                "application_data": {
                    "income": user_profile.get('income', 0),
                    "interest_rate": package['interest_rate'],
                    "loan_amount": package['amount'],
                    "age": user_profile.get('age', 0),
                    "credit_score": current_credit_score,  # Store the OLD score at time of application
                    "months_employed": user_profile.get('months_employed', 0),
                    "dti_ratio": user_profile.get('current_dti', 0),
                    "loan_term_months": package['loan_term_months'],
                    "purpose": application.purpose
                },
                "default_probability": default_probability,
                "credit_score_at_application": current_credit_score,  # Store the OLD score
                "updated_credit_score": new_credit_score,  # Store the NEW calculated score
                "credit_grade": scoring_result["credit_grade"],
                "decision": scoring_result["decision"],
                "recommendation": scoring_result["recommendation"],
                "status": LoanStatus.PENDING,
                "amount_remaining": package['amount'],
                "total_amount": package['amount'],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "next_payment_date": None,
                "payment_schedule": LoanService._generate_payment_schedule(
                    package['amount'], 
                    package['interest_rate'], 
                    package['loan_term_months']
                )
            }
            
            loans_ref.document(loan_id).set(loan_data)
            
            # Update user's credit score in the database
            user_ref = users_ref.document(user_id)
            user_ref.update({
                "current_credit_score": new_credit_score,  # Update the actual credit score
                "loan_history": firestore.ArrayUnion([loan_id]),
                "updated_at": datetime.utcnow()
            })
            
            return {**loan_data, "loan_id": loan_id}
            
        except Exception as e:
            raise ValueError(f"Failed to apply for loan with package: {str(e)}")
    @staticmethod
    def _generate_payment_schedule(loan_amount: float, interest_rate: float, loan_term_months: int):
        """Generate a payment schedule for the loan"""
        monthly_rate = (interest_rate / 100) / 12
        monthly_payment = loan_amount * monthly_rate * (1 + monthly_rate) ** loan_term_months / ((1 + monthly_rate) ** loan_term_months - 1)
        
        schedule = []
        remaining_balance = loan_amount
        current_date = datetime.utcnow() + timedelta(days=30)  # First payment in 30 days
        
        for month in range(1, loan_term_months + 1):
            interest_payment = remaining_balance * monthly_rate
            principal_payment = monthly_payment - interest_payment
            remaining_balance -= principal_payment
            
            schedule.append({
                "month": month,
                "due_date": current_date,
                "amount_due": monthly_payment,
                "principal": principal_payment,
                "interest": interest_payment,
                "remaining_balance": max(0, remaining_balance),
                "status": "pending"
            })
            
            current_date += timedelta(days=30)  # Approximate month
        
        return schedule
    
    @staticmethod
    async def process_loan_application(loan_id: str, bank_id: str, approve: bool):
        """Process a loan application (approve or reject)"""
        loan_ref = loans_ref.document(loan_id)
        loan_doc = loan_ref.get()
        
        if not loan_doc.exists:
            raise ValueError("Loan not found")
        
        loan_data = loan_doc.to_dict()
        
        if loan_data['status'] != LoanStatus.PENDING:
            raise ValueError("Loan application has already been processed")
        
        if approve:
            new_status = LoanStatus.APPROVED
            
            # Update user's debt and DTI
            user_id = loan_data['user_id']
            user_ref = users_ref.document(user_id)
            user_doc = user_ref.get().to_dict()
            
            if user_doc:
                new_debt = user_doc.get('total_debt', 0) + loan_data['application_data']['loan_amount']
                new_dti = new_debt / user_doc.get('income', 1) if user_doc.get('income', 0) > 0 else 0
                
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
            
            # Set first payment date
            first_payment_date = datetime.utcnow() + timedelta(days=30)
            loan_ref.update({
                'status': new_status,
                'bank_id': bank_id,
                'next_payment_date': first_payment_date,
                'activated_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
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
    async def activate_loan(loan_id: str, bank_id: str):
        """Activate an approved loan (change status from approved to active)"""
        loan_ref = loans_ref.document(loan_id)
        loan_doc = loan_ref.get()
        
        if not loan_doc.exists:
            raise ValueError("Loan not found")
        
        loan_data = loan_doc.to_dict()
        
        if loan_data['status'] != LoanStatus.APPROVED:
            raise ValueError("Only approved loans can be activated")
        
        if loan_data.get('bank_id') != bank_id:
            raise ValueError("Only the approving bank can activate this loan")
        
        # Update loan status to active and set first payment date
        first_payment_date = datetime.utcnow() + timedelta(days=30)
        loan_ref.update({
            'status': LoanStatus.ACTIVE,
            'updated_at': datetime.utcnow(),
            'activated_at': datetime.utcnow(),
            'next_payment_date': first_payment_date
        })
        
        return {"status": LoanStatus.ACTIVE, "loan_id": loan_id}
    
    @staticmethod
    async def make_repayment(loan_id: str, repayment: RepaymentRequest):
        """Process a loan repayment - simplified version"""
        loan_ref = loans_ref.document(loan_id)
        loan_data = loan_ref.get().to_dict()
        
        # Create repayment record
        payment_id = str(uuid.uuid4())
        repayment_data = {
            "payment_id": payment_id,
            "loan_id": loan_id,
            "amount": repayment.amount,
            "payment_date": datetime.utcnow(),
            "status": "paid",
            "created_at": datetime.utcnow()
        }
        
        repayments_ref.document(payment_id).set(repayment_data)
        
        # Update loan remaining amount
        new_remaining = loan_data['amount_remaining'] - repayment.amount
        
        updates = {
            "amount_remaining": new_remaining,
            "updated_at": datetime.utcnow(),
        }
        
        # Check if loan is paid off
        if new_remaining <= 0:
            updates["status"] = LoanStatus.PAID
            updates["paid_at"] = datetime.utcnow()
        
        loan_ref.update(updates)
        
        # Update user's debt and calculate DTI
        user_ref = users_ref.document(loan_data['user_id'])
        user_doc = user_ref.get().to_dict()
        
        new_dti = 0
        if user_doc:
            new_debt = max(0, user_doc.get('total_debt', 0) - repayment.amount)
            new_dti = new_debt / user_doc.get('income', 1) if user_doc.get('income', 0) > 0 else 0
            
            user_ref.update({
                'total_debt': new_debt,
                'current_dti': new_dti,
                'updated_at': datetime.utcnow()
            })
        
        return {
            "payment_id": payment_id,
            "amount_remaining": new_remaining,
            "loan_status": updates.get("status", loan_data['status']),
            "new_dti": new_dti
        }
    
    @staticmethod
    def _get_current_due_amount(loan_data: dict) -> float:
        """Calculate the current due amount based on payment schedule"""
        if not loan_data.get('payment_schedule'):
            # Fallback calculation
            total_amount = loan_data['total_amount']
            loan_term = loan_data['application_data']['loan_term_months']
            return total_amount / loan_term
        
        # Find the next due payment in the schedule
        current_date = datetime.utcnow()
        for payment in loan_data['payment_schedule']:
            due_date = payment.get('due_date')
            if isinstance(due_date, str):
                due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            
            if due_date and due_date > current_date and payment.get('status') == 'pending':
                return payment.get('amount_due', 0)
        
        return 0
    
    @staticmethod
    def _update_payment_schedule(loan_id: str, payment_amount: float):
        """Update the payment schedule after a payment"""
        loan_ref = loans_ref.document(loan_id)
        loan_doc = loan_ref.get()
        
        if not loan_doc.exists:
            return
        
        loan_data = loan_doc.to_dict()
        payment_schedule = loan_data.get('payment_schedule', [])
        
        current_date = datetime.utcnow()
        
        for payment in payment_schedule:
            due_date = payment.get('due_date')
            if isinstance(due_date, str):
                due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            
            if due_date and due_date <= current_date and payment.get('status') == 'pending':
                payment['status'] = 'paid'
                payment['paid_date'] = current_date
                payment['amount_paid'] = payment_amount
                break
        
        loan_ref.update({
            'payment_schedule': payment_schedule,
            'updated_at': datetime.utcnow()
        })
    
    @staticmethod
    async def get_user_loans(user_id: str):
        """Get all loans for a specific user"""
        try:
            # Option 2a: Remove ordering temporarily
            loans = loans_ref.where("user_id", "==", user_id).stream()
            
            # Option 2b: Or order by a different field that doesn't require composite index
            # loans = loans_ref.where("user_id", "==", user_id).order_by("loan_id").stream()
            
            loan_list = [loan.to_dict() for loan in loans]
            
            # Option 2c: Sort in memory instead (if you have few loans)
            # loan_list.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            
            return loan_list
        except Exception as e:
            print(f"Error in get_user_loans: {str(e)}")
            raise e
    
    @staticmethod
    async def get_pending_loans():
        """Get all pending loan applications"""
        loans = loans_ref.where("status", "==", LoanStatus.PENDING).stream()
        return [loan.to_dict() for loan in loans]
    
    @staticmethod
    async def get_loans_by_bank(bank_id: str):
        """Get all loans processed by a specific bank"""
        loans = loans_ref.where("bank_id", "==", bank_id).stream()
        return [loan.to_dict() for loan in loans]
    
    @staticmethod
    async def get_loan_repayments(loan_id: str):
        """Get all repayments for a specific loan"""
        repayments = repayments_ref.where("loan_id", "==", loan_id).order_by("payment_date").stream()
        return [repayment.to_dict() for repayment in repayments]
    
    @staticmethod
    async def get_active_loans():
        """Get all active loans"""
        loans = loans_ref.where("status", "in", [LoanStatus.ACTIVE, LoanStatus.APPROVED]).stream()
        return [loan.to_dict() for loan in loans]