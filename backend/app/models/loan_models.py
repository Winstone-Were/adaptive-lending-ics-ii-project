# In app/models/loan_models.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .user_models import LoanStatus

class LoanApplication(BaseModel):
    income: float = Field(gt=0, description="Annual income")
    interest_rate: float = Field(gt=0, le=50, description="Annual interest rate percentage")
    loan_amount: float = Field(gt=0, description="Requested loan amount")
    age: int = Field(gt=18, lt=100, description="Applicant age")
    credit_score: float = Field(ge=300, le=850, description="Current credit score")
    months_employed: int = Field(ge=0, description="Months at current employment")
    dti_ratio: float = Field(ge=0, le=1, description="Current debt-to-income ratio")
    loan_term_months: Optional[int] = Field(gt=0, description="Loan term in months")
    purpose: Optional[str] = "Personal Loan"

class LoanApplicationWithPackage(BaseModel):
    package_id: str
    purpose: str

class RepaymentRequest(BaseModel):
    amount: float = Field(gt=0)
    payment_method: str = "bank_transfer"

class RepaymentRecord(BaseModel):
    payment_id: str
    loan_id: str
    amount: float
    payment_date: datetime
    due_date: datetime
    status: str  # paid, pending, overdue
    late_fee: float = 0
    created_at: datetime