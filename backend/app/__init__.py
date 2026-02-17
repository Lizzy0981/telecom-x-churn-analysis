# backend/app/__init__.py
"""
Telecom X Application Package
==============================

Main application package for the Telecom X Customer Churn Analysis Platform.

This package contains:
    - main: FastAPI application and configuration
    - api: API routes and endpoints (52+ endpoints)
    - models: Database models (SQLAlchemy ORM)
    - schemas: Pydantic schemas for validation
    - services: Business logic services
    - core: Core utilities, config, and security
    - utils: Helper functions and utilities
    - ml: Machine learning models and services

Structure:
    backend/app/
    ├── main.py                 # FastAPI application
    ├── api/                    # API routes
    │   ├── endpoints/          # Endpoint modules
    │   ├── deps.py             # Dependencies
    │   └── router.py           # Main router
    ├── models/                 # Database models
    ├── schemas/                # Pydantic schemas
    ├── services/               # Business logic
    ├── core/                   # Core utilities
    ├── utils/                  # Helper functions
    └── ml/                     # ML models & services

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

__version__ = "0.9.0-beta"
__author__ = "Elizabeth Díaz Familia"
__email__ = "lizzyfamilia@gmail.com"
__project__ = "Telecom X - Customer Churn Analysis Platform"

# Import main app for convenience
from .main import app

__all__ = ["app"]
