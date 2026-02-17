# backend/app/api/deps.py
"""
API Dependencies
================

Common dependencies and utilities for API endpoints.

This module provides:
    - JWT authentication and authorization
    - Database session management
    - Rate limiting
    - File upload validation
    - Pagination utilities

Security:
    JWT tokens are used for authentication with configurable expiration.
    Role-based access control is implemented for admin operations.
    API key verification is available for machine-to-machine communication.

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta

# Security
security = HTTPBearer()

# JWT Configuration
SECRET_KEY = "your-secret-key-change-in-production"  # TODO: Move to env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ==================== TOKEN FUNCTIONS ====================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

# ==================== DEPENDENCIES ====================

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Get current authenticated user from JWT token
    """
    token = credentials.credentials
    payload = decode_token(token)
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    # In production, fetch user from database
    return {
        "id": user_id,
        "email": payload.get("email"),
        "role": payload.get("role", "user")
    }


async def get_current_active_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Get current active user (not disabled)
    """
    # In production, check if user is active in database
    return current_user


async def get_current_admin_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Verify current user is admin
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


async def verify_api_key(
    x_api_key: Optional[str] = Header(None)
) -> bool:
    """
    Verify API key from header
    """
    # TODO: Implement proper API key verification
    valid_keys = ["demo-api-key", "test-key"]
    
    if x_api_key and x_api_key in valid_keys:
        return True
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing API key"
    )


def get_db() -> Generator:
    """
    Database dependency (placeholder)
    In production, this would yield a database session
    """
    # TODO: Implement actual database connection
    try:
        db = {}  # Placeholder
        yield db
    finally:
        pass  # Close database connection


async def rate_limit_check(
    x_forwarded_for: Optional[str] = Header(None)
) -> bool:
    """
    Rate limiting check (placeholder)
    """
    # TODO: Implement actual rate limiting with Redis
    return True


# ==================== PAGINATION ====================

class PaginationParams:
    """
    Pagination parameters
    """
    def __init__(
        self,
        skip: int = 0,
        limit: int = 100,
        max_limit: int = 1000
    ):
        if limit > max_limit:
            limit = max_limit
        self.skip = skip
        self.limit = limit


def get_pagination_params(
    skip: int = 0,
    limit: int = 100
) -> PaginationParams:
    """
    Get pagination parameters
    """
    return PaginationParams(skip=skip, limit=limit)


# ==================== FILE UPLOAD ====================

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls", ".json", ".pdf", ".xml", ".tsv", ".txt"}


async def validate_file_upload(file) -> bool:
    """
    Validate uploaded file
    """
    # Check file extension
    filename = file.filename.lower()
    if not any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    # Note: This is a simplified check
    # In production, implement proper file size validation
    
    return True
