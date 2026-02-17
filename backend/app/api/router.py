# backend/app/api/router.py
"""
API Router - Main Application Router
=====================================

This module combines all endpoint routers into a single main router.
The main router is then included in the FastAPI application with the /api prefix.

Routers included:
    - /auth: Authentication and user management
    - /data: Dataset operations
    - /ml: Machine learning predictions
    - /analytics: Analytics and KPIs
    - /export: Data export functionality
    - /bi: Business Intelligence integrations

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from fastapi import APIRouter
from .endpoints import (
    auth_router,
    data_router,
    ml_router,
    analytics_router,
    export_router,
    bi_exports_router
)

# Create main API router
api_router = APIRouter()

# Include all endpoint routers with their respective prefixes and tags
api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["authentication"]
)

api_router.include_router(
    data_router,
    prefix="/data",
    tags=["data"]
)

api_router.include_router(
    ml_router,
    prefix="/ml",
    tags=["machine-learning"]
)

api_router.include_router(
    analytics_router,
    prefix="/analytics",
    tags=["analytics"]
)

api_router.include_router(
    export_router,
    prefix="/export",
    tags=["export"]
)

api_router.include_router(
    bi_exports_router,
    prefix="/bi",
    tags=["business-intelligence"]
)
