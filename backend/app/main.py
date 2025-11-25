from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from app.firebase_admin import db
from app.auth_utils import verify_token
from app.user_utils import create_user, update_credit_score, update_dti
from app.model_utils import model, preprocess_input
import pandas as pd
from datetime import datetime
import numpy as np

# Features for model
SELECTED_FEATURES = [
    "Income",
    "InterestRate",
    "LoanAmount",
    "Age",
    "CreditScore",
    "MonthsEmployed",
    "DTIRatio"
]

DEFAULT_CREDIT_SCORE = 650

app = FastAPI(title="Adaptive Loan System", version="1.0")

# -----------------------------
# Pydantic Models
# -----------------------------
class UserRegistration(BaseModel):
    name: str
    email: str
    role: str  # 'customer' or 'bank'
    Income: float
    Age: int
    MonthsEmployed: int

class LoanApplication(BaseModel):
    Income: float
    InterestRate: float
    LoanAmount: float
    Age: float
    CreditScore: float
    MonthsEmployed: float
    DTIRatio: float

# -----------------------------
# User Endpoints
# -----------------------------
@app.post("/register")
def register_user(user: UserRegistration, authorization: str = Header(None)):
    """
    Register a new user.
    Admin creates banks; customers can self-register.
    """
    # Verify if admin is creating a bank user
    if user.role == "bank":
        if not authorization:
            raise HTTPException(status_code=401, detail="Admin token required to create bank")
        admin_uid = verify_token(authorization)
        # Optionally: check admin role in Firestore
    # Create user in Firestore
    # Start with median credit score
    uid = user.email.replace("@","_").replace(".","_")  # simple UID placeholder
    create_user(uid, user.name, user.email, user.role, user.Income, user.Age, user.MonthsEmployed)
    return {"uid": uid, "message": f"{user.role} created successfully", "CreditScore": DEFAULT_CREDIT_SCORE}

@app.get("/users/{uid}")
def get_user(uid: str, authorization: str = Header(...)):
    """
    Get user info (customer or bank)
    """
    verify_token(authorization)
    doc = db.collection("users").document(uid).get()
    if doc.exists:
        return doc.to_dict()
    raise HTTPException(status_code=404, detail="User not found")

# -----------------------------
# Loan Endpoints
# -----------------------------
@app.post("/apply_loan")
def apply_loan(application: LoanApplication, authorization: str = Header(...)):
    """
    Customer applies for a loan.
    Predict default, update CreditScore, Debt, DTIRatio
    """
    uid = verify_token(authorization)
    
    # 1️⃣ Predict default probability using CNN
    X_input = preprocess_input(application.dict(), SELECTED_FEATURES)
    pred_prob = float(model.predict(X_input)[0][0])
    
    # 2️⃣ Update CreditScore
    new_credit_score = update_credit_score(uid, pred_prob)
    
    # 3️⃣ Update Debt and DTIRatio
    new_debt, new_dti = update_dti(uid, application.LoanAmount)
    
    # 4️⃣ Store loan in Firestore
    loan_doc = {
        **application.dict(),
        "user_uid": uid,
        "Pred_Probability": pred_prob,
        "Updated_CreditScore": new_credit_score,
        "DTIRatio": new_dti,
        "created_at": datetime.utcnow(),
        "actual_default": None
    }
    loan_ref = db.collection("loans").document()
    loan_ref.set(loan_doc)
    
    return {
        "loan_id": loan_ref.id,
        "Pred_Probability": pred_prob,
        "Updated_CreditScore": new_credit_score,
        "DTIRatio": new_dti
    }

@app.get("/my_loans")
def my_loans(authorization: str = Header(...)):
    """
    Get all loans for the current user
    """
    uid = verify_token(authorization)
    loans = db.collection("loans").where("user_uid","==",uid).stream()
    return {"loans": [l.to_dict() for l in loans]}

# -----------------------------
# Prediction Endpoint
# -----------------------------
@app.post("/predict")
def predict(applicant: LoanApplication):
    """
    Predict default probability for arbitrary input
    """
    X_input = preprocess_input(applicant.dict(), SELECTED_FEATURES)
    pred_prob = float(model.predict(X_input)[0][0])
    pred_class = int(pred_prob > 0.5)
    return {"Pred_Probability": pred_prob, "Pred_Class": pred_class}
