from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .user_models import LoanStatus, CreditGrade

class LoanApplication(BaseModel):
    income: float = Field(gt=0, description="Annual income")
    interest_rate: float = Field(gt=0, le=50, description="Annual interest rate percentage")
    loan_amount: float = Field(gt=0, description="Requested loan amount")
    age: int = Field(gt=18, lt=100, description="Applicant age")
    credit_score: float = Field(ge=300, le=850, description="Current credit score")
    months_employed: int = Field(ge=0, description="Months at current employment")
    dti_ratio: float = Field(ge=0, le=1, description="Current debt-to-income ratio")
    loan_term_months: int = Field(gt=0, description="Loan term in months")
    purpose: Optional[str] = "Personal Loan"

class LoanDecision(BaseModel):
    default_probability: float = Field(ge=0, le=1)
    credit_score: float = Field(ge=300, le=850)
    credit_grade: CreditGrade
    decision: str
    recommendation: str
    confidence: float

class RepaymentRecord(BaseModel):
    payment_id: str
    amount: float
    payment_date: datetime
    due_date: datetime
    status: str
    late_fee: float = 0

class LoanDetails(BaseModel):
    loan_id: str
    user_id: str
    bank_id: str
    application_data: LoanApplication
    default_probability: float
    credit_score_at_application: float
    credit_grade: CreditGrade
    decision: str
    status: LoanStatus
    amount_remaining: float
    next_payment_date: Optional[datetime]
    repayment_history: List[RepaymentRecord]
    created_at: datetime
    updated_at: datetime

class RepaymentRequest(BaseModel):
    amount: float = Field(gt=0)
    payment_method: str = "bank_transfer"