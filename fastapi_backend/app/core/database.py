from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URI)
        logging.info("Connected to MongoDB via Motor.")
    except Exception as e:
        logging.error(f"Could not connect to MongoDB: {e}")

async def close_mongo_connection():
    if db.client:
        db.client.close()
        logging.info("Closed MongoDB connection.")

def get_database():
    # Helper to get the correct database name from the URI
    return db.client.get_default_database("portfolio_dev")
