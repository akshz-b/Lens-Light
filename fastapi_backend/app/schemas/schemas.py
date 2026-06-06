from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class PhotoBase(BaseModel):
    caption: str = ""
    category: str = "Uncategorized"

class PhotoCreate(PhotoBase):
    url: str
    public_id: str

class PhotoResponse(PhotoBase):
    id: str = Field(alias="_id")
    url: str
    public_id: str
    created_at: datetime
    
    class Config:
        populate_by_name = True

class LoginRequest(BaseModel):
    password: str

class TokenResponse(BaseModel):
    token: str
