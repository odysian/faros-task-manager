import logging
import os
import urllib.parse
from typing import Optional

import redis

logger = logging.getLogger(__name__)

# Smart Redis URL selection:
# - If REDIS_URL is explicitly set, use it (allows override)
# - If running locally (ENVIRONMENT=development/local or not set), default to local Redis
# - In production, REDIS_URL should be set explicitly
ENVIRONMENT = os.getenv("ENVIRONMENT", "").lower()
REDIS_URL_ENV = os.getenv("REDIS_URL")

if REDIS_URL_ENV:
    # Use explicitly set Redis URL (highest priority)
    REDIS_URL = REDIS_URL_ENV
    logger.debug(f"Using Redis URL from environment: {REDIS_URL.split('@')[-1] if '@' in REDIS_URL else REDIS_URL}")
elif ENVIRONMENT in ("development", "local") or not ENVIRONMENT:
    # Local development - default to local Redis (docker-compose port 6380)
    REDIS_URL = "redis://localhost:6380/0"
    logger.info("Using local Redis for development (localhost:6380)")
else:
    # Production - should have REDIS_URL set, but fallback to standard port
    REDIS_URL = "redis://localhost:6379/0"
    logger.warning("REDIS_URL not set in production, using default localhost:6379")

# Parse the Redis URL to extract host, port, and database number


parsed = urllib.parse.urlparse(REDIS_URL)

# Redis connection settings
REDIS_HOST = parsed.hostname or "localhost"
REDIS_PORT = parsed.port or 6379
REDIS_DB = int(parsed.path.lstrip("/")) if parsed.path else 0

# Cache expiration times
STATS_CACHE_TTL = 300

# Create Redis client
redis_client: Optional[redis.Redis] = None

try:
    # Upstash Redis requires SSL/TLS - detect by checking if hostname ends with .upstash.io
    use_ssl = REDIS_HOST.endswith(".upstash.io") if REDIS_HOST else False

    # Get password from URL if present, otherwise from parsed URL
    password = parsed.password or None

    client = redis.Redis(  # pylint: disable=invalid-name
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=REDIS_DB,
        password=password,  # Explicitly set password
        decode_responses=True,  # Automatically decode bytes to strings
        ssl=use_ssl,  # Enable SSL for Upstash
        ssl_cert_reqs="none",  # Don't verify SSL cert (Upstash uses self-signed)
    )
    # Test connection
    client.ping()
    redis_client = client
    logger.info(f"Redis connected: {REDIS_HOST}:{REDIS_PORT}/{REDIS_DB} (SSL: {use_ssl})")
except (redis.ConnectionError, redis.AuthenticationError) as e:
    logger.error(f"Redis connection failed: {e}")
    redis_client = None


def get_cache(key: str) -> Optional[str]:
    """
    Get value from Redis cache.
    Returns None if key doesn't exist or Redis is unavailable
    """
    if not redis_client:
        return None

    try:
        value = redis_client.get(key)
        if value:
            logger.info(f"Cache HIT: {key}")
        else:
            logger.info(f"Cache MISS: {key}")
        return value  # type: ignore
    except Exception as e:
        logger.error(f"Redis GET error: {e}")
        return None


def set_cache(key: str, value: str, ttl: int = STATS_CACHE_TTL) -> bool:
    """
    Set value in Redis cache with expiration time.
    Returns True if successful, False otherwise.
    """
    if not redis_client:
        return False

    try:
        redis_client.setex(key, ttl, value)
        logger.info(f"Cache SET: {key} (TTL: {ttl}s)")
        return True
    except Exception as e:
        logger.error(f"Redis SET error: {e}")
        return False


def delete_cache(key: str) -> bool:
    """
    Delete value from Redis cache.
    Returns True if successful, False otherwise.
    """
    if not redis_client:
        return False

    try:
        redis_client.delete(key)
        logger.info(f"Cache DELETE: {key}")
        return True
    except Exception as e:
        logger.error(f"Redis DELETE error: {e}")
        return False


def invalidate_user_cache(user_id: int):
    """Invalidate all cache entries for a user.
    Called when user creates/updates/deletes tasks.
    """
    stats_key = f"stats:user_{user_id}"
    delete_cache(stats_key)
    logger.info(f"Invalidated cache for user_id={user_id}")
