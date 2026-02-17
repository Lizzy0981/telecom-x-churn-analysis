# backend/app/core/__init__.py
"""
Core Module
===========

Core functionality for the Telecom X platform including configuration,
security, and machine learning engine.

This module provides:
    - Application configuration and settings
    - JWT authentication and security utilities
    - ML engine for churn predictions
    - CORS configuration
    - Environment variable management

Modules:
    - config: Application settings and configuration
    - security: JWT tokens, password hashing, security utilities
    - ml_engine: Machine learning core engine for predictions

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from .config import settings, Settings
from .security import (
    create_access_token,
    verify_password,
    get_password_hash,
    decode_access_token,
    SecurityUtils
)
from .ml_engine import MLEngine, get_ml_engine

__all__ = [
    # Configuration
    "settings",
    "Settings",
    
    # Security
    "create_access_token",
    "verify_password",
    "get_password_hash",
    "decode_access_token",
    "SecurityUtils",
    
    # ML Engine
    "MLEngine",
    "get_ml_engine"
]
