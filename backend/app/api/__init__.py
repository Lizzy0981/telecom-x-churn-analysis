# backend/app/api/__init__.py
"""
API Package - Main Entry Point
================================

This module serves as the main entry point for the Telecom X API.
It exposes the main API router and all commonly used dependencies
for authentication, database access, and utilities.

Exports:
    - api_router: Main FastAPI router combining all endpoints
    - Authentication dependencies for securing endpoints
    - Database and pagination utilities
    - File validation helpers

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from .router import api_router
from .deps import (
    # Authentication & Authorization
    get_current_user,
    get_current_active_user,
    get_current_admin_user,
    create_access_token,
    decode_token,
    verify_api_key,
    
    # Database
    get_db,
    
    # Utilities
    rate_limit_check,
    get_pagination_params,
    validate_file_upload,
    PaginationParams,
    
    # Constants
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    MAX_FILE_SIZE,
    ALLOWED_EXTENSIONS
)

__all__ = [
    # Main Router
    "api_router",
    
    # Authentication & Authorization
    "get_current_user",
    "get_current_active_user",
    "get_current_admin_user",
    "create_access_token",
    "decode_token",
    "verify_api_key",
    
    # Database
    "get_db",
    
    # Utilities
    "rate_limit_check",
    "get_pagination_params",
    "validate_file_upload",
    "PaginationParams",
    
    # Constants
    "SECRET_KEY",
    "ALGORITHM",
    "ACCESS_TOKEN_EXPIRE_MINUTES",
    "MAX_FILE_SIZE",
    "ALLOWED_EXTENSIONS"
]
