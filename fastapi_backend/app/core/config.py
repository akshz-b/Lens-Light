from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Lens & Light API"
    ENVIRONMENT: str = "development"
    
    # MongoDB
    MONGODB_URI: str
    
    # Security
    JWT_SECRET: str
    ADMIN_PASSWORD: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str

    class Config:
        env_file = "../.env"
        extra = "ignore"

settings = Settings()
