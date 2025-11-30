from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request
import logging

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

# Create limiter instance
limiter = Limiter(
    key_func=get_user_id_or_ip,
    default_limits=["1000/hour"], # Default limit for all endpoints
    storage_uri="redis://localhost:6379",
    strategy="fixed-window"
)
