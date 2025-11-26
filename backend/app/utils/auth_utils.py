from app.firebase_admin import verify_firebase_token
from fastapi import HTTPException, Header

async def verify_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization[7:]  # Remove "Bearer " prefix
    try:
        return verify_firebase_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))