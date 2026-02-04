import logging
import os

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

logger = logging.getLogger(__name__)


def get_user_id_or_ip(request: Request) -> str:
    """
    Get a unique identifier for rate limiting
    Priority:
    1. User ID (if authenticated)
    2. IP address (if not authenticated)
    """
    # Try to get user from request state (set by auth dependency)
    if hasattr(request.state, "user"):
        user = request.state.user
        identifier = f"user_{user.id}"
        logger.debug(f"Rate limit key: {identifier}")
        return identifier

    # Fall back to IP address
    ip = get_remote_address(request)
    identifier = f"ip_{ip}"
    logger.debug(f"Rate limit key: {identifier}")
    return identifier


# Check if we're running tests
TESTING = os.getenv("TESTING", "false").lower() == "true"

# Smart Redis URL selection (same logic as redis_config.py)
ENVIRONMENT = os.getenv("ENVIRONMENT", "").lower()
REDIS_URL_ENV = os.getenv("REDIS_URL")

if REDIS_URL_ENV:
    # Use explicitly set Redis URL (highest priority)
    REDIS_URL = REDIS_URL_ENV
elif ENVIRONMENT in ("development", "local") or not ENVIRONMENT:
    # Local development - default to local Redis (docker-compose port 6380)
    REDIS_URL = "redis://localhost:6380/0"
else:
    # Production - should have REDIS_URL set, but fallback to standard port
    REDIS_URL = "redis://localhost:6379/0"

if TESTING:
    # Create a disabled limiter for tests
    limiter = Limiter(
        key_func=get_user_id_or_ip, enabled=False  # Disable rate limiting in tests
    )
    logger.info("Rate limiting DISABLED for testing")
else:
    # Try to use Redis if available, fall back to memory storage
    try:
        import redis
        import urllib.parse
        # Test Redis connection with proper SSL handling for Upstash
        parsed = urllib.parse.urlparse(REDIS_URL)
        use_ssl = parsed.hostname.endswith(".upstash.io") if parsed.hostname else False
        test_client = redis.Redis(
            host=parsed.hostname,
            port=parsed.port or 6379,
            password=parsed.password,
            ssl=use_ssl,
            ssl_cert_reqs=None,
        )
        test_client.ping()
        test_client.close()
        # Redis is available - use it
        limiter = Limiter(
            key_func=get_user_id_or_ip,
            default_limits=["1000/hour"],  # Default limit for all endpoints
            storage_uri=REDIS_URL,
            strategy="fixed-window",
        )
        logger.info(f"Rate limiting ENABLED with Redis storage: {REDIS_URL}")
    except Exception as e:
        # Redis unavailable - use in-memory storage (works for single instance)
        logger.warning(f"Redis unavailable ({e}), using in-memory rate limiting")
        limiter = Limiter(
            key_func=get_user_id_or_ip,
            default_limits=["1000/hour"],
            # No storage_uri = in-memory storage
            strategy="fixed-window",
        )
        logger.info("Rate limiting ENABLED with in-memory storage (single instance only)")
