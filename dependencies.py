from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from db_config import get_db
import db_models
from auth import verify_access_token
from typing import Optional


# Custom HTTPBearer that raises 401 instead of 403
class HTTPBearerAuth(HTTPBearer):
    async def __call__(self, request: Request) -> Optional[HTTPAuthorizationCredentials]:
        try:
            return await super().__call__(request)
        except HTTPException:
            # Override the default 403 with 401
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
                headers={"WWW-Authenticate": "Bearer"}
            )
 
# This tells FastAPI to look for "Authorization: Bearer <token>" header
security = HTTPBearerAuth()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db_session: Session = Depends(get_db)
) -> db_models.User: 
    """
    Dependency that extracts and verifies JWT token from request

    Returns the authenticated User object
    Raises 401 if token is missing, invalid, or user not found
    """
    # Extract token from credentials
    token = credentials.credentials

    # Verify and decode token
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Extract username from token payload
    username: str | None = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Look up user in database
    user = db_session.query(db_models.User).filter(
        db_models.User.username == username
    ).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return user
