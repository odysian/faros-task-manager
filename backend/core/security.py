from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from core.settings import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
BCRYPT_ROUNDS = settings.bcrypt_rounds


# Configure bcrypt for password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=BCRYPT_ROUNDS
)


def hash_password(password: str) -> str:
    """
    Has a plain password using bcrypt.
    Args:
        password: Plain text password from user
    Returns:
        Hashed password string (safe to store in db)
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    Args:
        plain_password: Password provided by user during login
        hashed_password: Hashed password from database
    Returns:
        True if passwords match, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    """
    Create a JWT access token.
    Args:
        data: Dictionary containing user information (usually {"sub": username})
    Returns:
        Encoded JWT token string
    """

    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_access_token(token: str) -> dict | None:
    """
    Verify and decode a JWT access token.
    Args:
        token: JWT token string
    Returns:
        Decoded token payload if valid, None if invalid/expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
