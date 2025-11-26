from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.firebase_admin import verify_firebase_token
from app.utils.firestore_utils import get_user_by_uid

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        decoded_token = verify_firebase_token(credentials.credentials)
        user = get_user_by_uid(decoded_token['uid'])
        if not user:
            raise HTTPException(status_code=404, detail="User not found in database")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

def require_role(required_role: str):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get('role') != required_role:
            raise HTTPException(
                status_code=403, 
                detail=f"Access denied. Required role: {required_role}"
            )
        return current_user
    return role_checker

# Role-specific dependencies
get_current_customer = require_role("customer")
get_current_bank = require_role("bank") 
get_current_admin = require_role("admin")