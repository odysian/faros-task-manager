import logging
from sqlalchemy import MetaData, create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from core.settings import settings

logger = logging.getLogger(__name__)

# Database connection URL
# Format: postgresql://username:password@host:port/database
# For Supabase with schema isolation, include: ?options=-c%20search_path=faros,public

# Smart DATABASE_URL selection:
# - If DATABASE_URL is explicitly set, use it (allows override)
# - If running locally (ENVIRONMENT=development/local or not set), default to local database
# - In production, DATABASE_URL should be set explicitly (Supabase)
ENVIRONMENT = settings.normalized_environment
DATABASE_URL = settings.database_url

if settings.has_explicit_database_url:
    # Use explicitly set DATABASE_URL (highest priority)
    logger.debug(f"Using DATABASE_URL from environment")
elif ENVIRONMENT in ("development", "local"):
    # Local development - default to local database (docker-compose port 5433)
    logger.info("Using local database for development (localhost:5433)")
else:
    # Production - should have DATABASE_URL set
    logger.warning("DATABASE_URL not set in production, using default localhost:5432")

# Create engine (handles connection pool)
# Pool tuned for Render PostgreSQL (direct connection, shared across 3 apps):
# - pool_size=3: conservative for shared free-tier Postgres (max 97 connections)
# - max_overflow=5: allows bursts without exhausting connection limit
# - pool_pre_ping: detects dead connections before handing them out
# - pool_recycle=300: refresh connections periodically for connection hygiene
# Set SQLALCHEMY_ECHO=true in .env for development to see all SQL queries
echo_sql = settings.SQLALCHEMY_ECHO
engine = create_engine(
    DATABASE_URL,
    echo=echo_sql,
    pool_size=3,
    max_overflow=5,
    pool_recycle=300,
    pool_pre_ping=True,
)

# Session factory (creates database sessions)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All Faros tables live in the "faros" schema (shared Postgres DB with other apps, isolated by schema)
# Rostra uses "rostra" schema, Quaero uses "quaero" schema - all in same portfolio-db
metadata = MetaData(schema="faros")


# Base class for ORM models
class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy models.

    SQLAlchemy 2.0+ uses DeclarativeBase. Metadata uses schema="faros"
    for deployment (Render PostgreSQL, shared with other portfolio projects).
    """

    metadata = metadata


# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
