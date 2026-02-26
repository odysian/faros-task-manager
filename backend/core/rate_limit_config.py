import logging

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from core.settings import settings

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
TESTING = settings.TESTING

# Smart Redis URL selection (same logic as redis_config.py)
ENVIRONMENT = settings.normalized_environment
REDIS_URL_ENV = settings.REDIS_URL
REDIS_URL = settings.redis_url

if TESTING:
    # Create a disabled limiter for tests
    limiter = Limiter(
        key_func=get_user_id_or_ip, enabled=False  # Disable rate limiting in tests
    )
    logger.info("Rate limiting DISABLED for testing")
else:
    # Try to use Redis if available, fall back to memory storage
    # In production, if REDIS_URL is not set, skip Redis entirely
    if not REDIS_URL_ENV and ENVIRONMENT == "production":
        # Production without Redis - use in-memory (single instance only)
        logger.info("No REDIS_URL set in production, using in-memory rate limiting")
        limiter = Limiter(
            key_func=get_user_id_or_ip,
            default_limits=["1000/hour"],
            # No storage_uri = in-memory storage
            strategy="fixed-window",
        )
        logger.info(
            "Rate limiting ENABLED with in-memory storage (single instance only)"
        )
    else:
        # Try Redis connection - but be defensive about it
        # If Redis is unreliable, use in-memory instead
        use_redis = False
        redis_error = None

        try:
            import urllib.parse

            import redis

            # Test Redis connection with proper SSL handling for Upstash
            parsed = urllib.parse.urlparse(REDIS_URL)
            hostname = parsed.hostname or "localhost"
            use_ssl = hostname.endswith(".upstash.io")

            # Get password from URL if present
            password = parsed.password or None

            test_client = redis.Redis(
                host=hostname,
                port=parsed.port or 6379,
                password=password,
                ssl=use_ssl,
                ssl_cert_reqs=None,  # type: ignore[arg-type]  # Upstash uses self-signed certs
                socket_connect_timeout=3,  # Fast timeout for connection test
                socket_timeout=3,
                retry_on_timeout=False,  # Don't retry during test
            )
            # Test connection - try multiple times to ensure it's stable
            test_client.ping()
            # Test a second time to ensure connection is stable
            test_client.ping()
            test_client.close()
            use_redis = True
        except Exception as e:
            # Redis unavailable or unreliable
            redis_error = str(e)
            logger.warning(f"Redis connection test failed: {redis_error}")

        if use_redis:
            # Redis is available - use it
            try:
                limiter = Limiter(
                    key_func=get_user_id_or_ip,
                    default_limits=["1000/hour"],  # Default limit for all endpoints
                    storage_uri=REDIS_URL,
                    strategy="fixed-window",
                )
                logger.info(
                    f"Rate limiting ENABLED with Redis storage: {REDIS_URL.split('@')[-1] if '@' in REDIS_URL else REDIS_URL}"
                )
            except Exception as e:
                # Even if connection test passed, Limiter init might fail
                logger.error(
                    f"Failed to initialize Redis rate limiter: {e}, falling back to in-memory"
                )
                use_redis = False

        if not use_redis:
            # Redis unavailable or unreliable - use in-memory storage (works for single instance)
            logger.warning(
                f"Using in-memory rate limiting (Redis unavailable: {redis_error or 'initialization failed'})"
            )
            limiter = Limiter(
                key_func=get_user_id_or_ip,
                default_limits=["1000/hour"],
                # No storage_uri = in-memory storage
                strategy="fixed-window",
            )
            logger.info(
                "Rate limiting ENABLED with in-memory storage (single instance only)"
            )
