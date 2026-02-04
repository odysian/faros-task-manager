import logging
import os

from dotenv import load_dotenv
from sqlalchemy import MetaData, create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

logger = logging.getLogger(__name__)

# Database connection URL
# Format: postgresql://username:password@host:port/database
# For Supabase with schema isolation, include: ?options=-c%20search_path=faros,public

# Smart DATABASE_URL selection:
# - If DATABASE_URL is explicitly set, use it (allows override)
# - If running locally (ENVIRONMENT=development/local or not set), default to local database
# - In production, DATABASE_URL should be set explicitly (Supabase)
ENVIRONMENT = os.getenv("ENVIRONMENT", "").lower()
DATABASE_URL_ENV = os.getenv("DATABASE_URL")

if DATABASE_URL_ENV:
    # Use explicitly set DATABASE_URL (highest priority)
    DATABASE_URL = DATABASE_URL_ENV
    logger.debug(f"Using DATABASE_URL from environment")
elif ENVIRONMENT in ("development", "local") or not ENVIRONMENT:
    # Local development - default to local database (docker-compose port 5433)
    DATABASE_URL = "postgresql://task_user:dev_password@localhost:5433/task_manager"
    logger.info("Using local database for development (localhost:5433)")
else:
    # Production - should have DATABASE_URL set
    DATABASE_URL = (
        DATABASE_URL_ENV
        or "postgresql://task_user:dev_password@localhost:5432/task_manager"
    )
    if not DATABASE_URL_ENV:
        logger.warning(
            "DATABASE_URL not set in production, using default localhost:5432"
        )

# Create engine (handles connection pool)
# Set echo based on environment variable (default: False for production)
# Set SQLALCHEMY_ECHO=true in .env for development to see all SQL queries
echo_sql = os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true"
engine = create_engine(DATABASE_URL, echo=echo_sql)

# Session factory (creates database sessions)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All Faros tables live in the "faros" schema (same Supabase DB as other apps, isolated by schema)
# For local development without schema, this will default to "public"
metadata = MetaData(schema="faros")


# Base class for ORM models
class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy models.

    SQLAlchemy 2.0+ uses DeclarativeBase. Metadata uses schema="faros"
    for deployment (e.g. Supabase + Render, same DB as other projects).
    """

    metadata = metadata


# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
