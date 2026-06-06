from fastapi import APIRouter, HTTPException, Depends
from datetime import timedelta
from app.schemas.schemas import LoginRequest, TokenResponse
from app.core.config import settings
from app.core.security import create_access_token

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    if req.password == settings.ADMIN_PASSWORD:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"role": "admin"}, expires_delta=access_token_expires
        )
        return {"token": access_token}
    
    raise HTTPException(status_code=401, detail="Invalid password")
