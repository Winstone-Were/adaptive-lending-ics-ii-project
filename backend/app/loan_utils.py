from app.firebase_admin import db
from datetime import datetime
from app.user_utils import update_credit_score, update_dti

def apply_loan(uid: str, loan_data: dict, default_prob: float):
    """
    Store a loan in Firestore, update user's credit score and DTI
    """
    # Update CreditScore
    new_credit_score = update_credit_score(uid, default_prob)
    
    # Update Debt and DTIRatio
    new_debt, new_dti = update_dti(uid, loan_data.get("LoanAmount", 0.0))
    
    # Store loan record
    loan_doc = {
        **loan_data,
        "user_uid": uid,
        "Pred_Probability": default_prob,
        "Updated_CreditScore": new_credit_score,
        "DTIRatio": new_dti,
        "created_at": datetime.utcnow(),
        "actual_default": None
    }
    loan_ref = db.collection("loans").document()
    loan_ref.set(loan_doc)
    return loan_ref.id
