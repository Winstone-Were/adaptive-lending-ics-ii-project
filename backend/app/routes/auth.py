from fastapi import APIRouter, Depends, HTTPException, Header
from app.middleware.auth_middleware import get_current_user
from app.utils.auth_utils import verify_token
from app.services.user_service import UserService
from app.models.user_models import UserCreate
from app.firebase_admin import auth as firebase_auth

router = APIRouter()

@router.post("/register")
async def register_user(
    user_data: UserCreate,
    authorization: str = Header(...)
):
    """
    Register a user in Firestore after Firebase Auth registration
    Requires Firebase Authentication token
    """
    try:
        # Verify Firebase token
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header")
        
        token = authorization[7:]  # Remove "Bearer " prefix
        
        # Verify the Firebase token
        decoded_token = firebase_auth.verify_id_token(token)
        firebase_uid = decoded_token['uid']
        firebase_email = decoded_token.get('email')
        
        # Ensure the email matches
        if firebase_email != user_data.email:
            raise HTTPException(status_code=400, detail="Email does not match Firebase authentication")
        
        # Create user in Firestore
        user = await UserService.create_user(user_data, firebase_uid)
        return {"message": "User registered successfully", "user": user}
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post("/verify-token")
async def verify_firebase_token(authorization: str = Header(...)):
    """
    Verify a Firebase token and return user info
    Useful for testing authentication
    """
    try:
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header")
        
        token = authorization[7:]
        decoded_token = firebase_auth.verify_id_token(token)
        
        return {
            "valid": True,
            "user_id": decoded_token['uid'],
            "email": decoded_token.get('email'),
            "email_verified": decoded_token.get('email_verified', False)
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")