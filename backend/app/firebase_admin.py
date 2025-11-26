import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
from app.config import settings

# Initialize Firebase
cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
firebase_app = firebase_admin.initialize_app(cred)

db = firestore.client()

# Collection references for easy access
users_ref = db.collection("users")
loans_ref = db.collection("loans")
repayments_ref = db.collection("repayments")
system_metrics_ref = db.collection("system_metrics")
bank_analytics_ref = db.collection("bank_analytics")

def verify_firebase_token(id_token: str):
    """Verify Firebase ID token"""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid authentication token: {str(e)}")