from app.firebase_admin import db
import numpy as np

# Default median credit score
DEFAULT_CREDIT_SCORE = 650

def create_user(uid: str, name: str, email: str, role: str, income: float, age: int, months_employed: int):
    """
    Create a new user in Firestore
    """
    db.collection("users").document(uid).set({
        "name": name,
        "email": email,
        "role": role,
        "Income": income,
        "Age": age,
        "MonthsEmployed": months_employed,
        "CreditScore": DEFAULT_CREDIT_SCORE,
        "Debt": 0.0,
        "DTIRatio": 0.0
    })

def update_credit_score(uid: str, default_prob: float):
    """
    Update CreditScore after each loan based on default probability
    Lower default_prob → increase credit score
    """
    doc_ref = db.collection("users").document(uid)
    doc = doc_ref.get()
    if doc.exists:
        user = doc.to_dict()
        current_score = user.get("CreditScore", DEFAULT_CREDIT_SCORE)
        # Simple formula: decrease score proportional to default probability
        new_score = max(300, min(850, current_score * (1 - 0.2*default_prob)))
        doc_ref.update({"CreditScore": new_score})
        return new_score
    return DEFAULT_CREDIT_SCORE

def update_dti(uid: str, loan_amount: float):
    """
    Update user's Debt and Debt-to-Income ratio when a new loan is taken
    """
    doc_ref = db.collection("users").document(uid)
    doc = doc_ref.get()
    if doc.exists:
        user = doc.to_dict()
        current_debt = user.get("Debt", 0.0)
        income = user.get("Income", 1.0)  # avoid division by zero
        new_debt = current_debt + loan_amount
        new_dti = new_debt / income
        doc_ref.update({
            "Debt": new_debt,
            "DTIRatio": new_dti
        })
        return new_debt, new_dti
    return loan_amount, 0.0
