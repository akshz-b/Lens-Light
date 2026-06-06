from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import connect_to_mongo, close_mongo_connection
from app.services.cloudinary_service import CloudinaryService
from app.api.routers import auth, photos

# Initialize services
CloudinaryService.initialize()

app = FastAPI(
    title="Lens & Light API",
    description="Backend for the photography portfolio.",
    version="1.0.0"
)

# CORS setup for decoupled frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup & Shutdown events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include Routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(photos.router, prefix="/api/photos", tags=["Photos"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}
