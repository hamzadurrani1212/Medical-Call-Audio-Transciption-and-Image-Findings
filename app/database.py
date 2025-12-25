"""
MedAI - Database Connection Module
"""
import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

logger = logging.getLogger("MedAI.Database")


class Database:
    """MongoDB Database Manager with connection pooling and retry logic"""
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    
    @classmethod
    async def connect(cls, max_retries: int = 5, retry_delay: float = 3.0):
        """Initialize MongoDB connection with retry logic"""
        import asyncio
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Connecting to MongoDB (attempt {attempt + 1}/{max_retries})...")
                
                cls.client = AsyncIOMotorClient(
                    settings.MONGO_URI,
                    serverSelectionTimeoutMS=10000,
                    connectTimeoutMS=15000,
                    socketTimeoutMS=15000,
                    maxPoolSize=50,
                    retryWrites=True
                )
                
                # Test connection
                await cls.client.admin.command('ping')
                cls.db = cls.client[settings.DATABASE_NAME]
                
                logger.info("✅ MongoDB connected successfully")
                return True
                
            except Exception as e:
                logger.warning(f"MongoDB connection attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    logger.info(f"Retrying in {retry_delay} seconds...")
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 1.5
                else:
                    logger.error("❌ All MongoDB connection attempts failed")
                    return False
        
        return False
    
    @classmethod
    async def disconnect(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            cls.client = None
            cls.db = None
            logger.info("MongoDB connection closed")
    
    @classmethod
    def get_db(cls) -> Optional[AsyncIOMotorDatabase]:
        """Get database instance"""
        return cls.db
    
    @classmethod
    def is_connected(cls) -> bool:
        """Check if database is connected"""
        return cls.client is not None and cls.db is not None


# Collection accessors
def get_users_collection():
    """Get users collection"""
    db = Database.get_db()
    return db.users if db else None


def get_reports_collection():
    """Get medical reports collection"""
    db = Database.get_db()
    return db.medical_reports if db else None


def get_image_analyses_collection():
    """Get image analyses collection"""
    db = Database.get_db()
    return db.image_analyses if db else None


def get_sessions_collection():
    """Get conversation sessions collection"""
    db = Database.get_db()
    return db.conversation_sessions if db else None


def get_refresh_tokens_collection():
    """Get refresh tokens collection"""
    db = Database.get_db()
    return db.refresh_tokens if db else None


def get_patients_collection():
    """Get patient records collection"""
    db = Database.get_db()
    return db.patient_records if db else None


async def create_indexes():
    """Create database indexes for performance"""
    db = Database.get_db()
    if not db:
        return
    
    try:
        # Users indexes
        await db.users.create_index("username", unique=True)
        await db.users.create_index("role")
        
        # Medical reports indexes
        await db.medical_reports.create_index("doctor_id")
        await db.medical_reports.create_index("patient_id")
        await db.medical_reports.create_index("created_at")
        await db.medical_reports.create_index([("doctor_id", 1), ("created_at", -1)])
        
        # Image analyses indexes
        await db.image_analyses.create_index("patient_id")
        await db.image_analyses.create_index("image_type")
        await db.image_analyses.create_index("created_at")
        
        # Refresh tokens with TTL
        await db.refresh_tokens.create_index("token", unique=True)
        await db.refresh_tokens.create_index("expires_at", expireAfterSeconds=0)
        
        # Patient records
        await db.patient_records.create_index("patient_id", unique=True)
        
        logger.info("✅ Database indexes created")
        
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
