from fastapi import HTTPException
from firebase_admin import auth

def verify_token(id_token: str):
    """
    Verify Firebase JWT token.
    Returns Firebase UID if valid.
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        return uid
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def check_role(uid: str, role: str):
    """
    Ensure user has the correct role (customer, bank, admin)
    """
    user_doc = auth.get_user(uid)
    # For simplicity, store role in Firestore users collection
    from app.firebase_admin import db
    doc = db.collection("users").document(uid).get()
    if doc.exists and doc.to_dict().get("role") == role:
        return True
    raise HTTPException(status_code=403, detail=f"User not authorized as {role}")
