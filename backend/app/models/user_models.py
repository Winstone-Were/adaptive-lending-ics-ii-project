from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    CUSTOMER = "customer"
    BANK = "bank"
    ADMIN = "admin"

class LoanStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ACTIVE = "active"
    PAID = "paid"
    DEFAULTED = "defaulted"

class CreditGrade(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    HIGH_RISK = "high_risk"

class RepaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    PARTIAL = "partial"

# Auth Models
class FirebaseUser(BaseModel):
    uid: str
    email: str
    email_verified: bool

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    role: UserRole
    income: Optional[float] = None
    age: Optional[int] = None
    months_employed: Optional[int] = None
    bank_name: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    income: Optional[float] = None
    age: Optional[int] = None
    months_employed: Optional[int] = None
    current_employment: Optional[str] = None
    address: Optional[str] = None

class CustomerProfile(BaseModel):
    user_id: str
    income: float
    age: int
    months_employed: int
    current_credit_score: float
    total_debt: float
    current_dti: float
    employment_status: str
    address: Optional[str] = None

class BankProfile(BaseModel):
    user_id: str
    bank_name: str
    max_dti_threshold: float = 0.45
    total_loans_approved: int = 0
    total_loans_rejected: int = 0
    total_loans_under_management: int = 0