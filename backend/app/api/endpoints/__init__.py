# backend/app/api/endpoints/__init__.py
"""
API Endpoints Package
=====================

This module contains all API endpoint routers for the Telecom X platform.
Each module represents a different domain of functionality.

Modules:
    - auth: Authentication and user management
    - data: Dataset upload, processing, and validation
    - ml: Machine learning predictions and model management
    - analytics: KPIs, dashboards, and analytics
    - export: Data export in multiple formats (CSV, Excel, JSON, PDF)
    - bi_exports: Business Intelligence integrations (Power BI, Tableau)

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from .auth import router as auth_router
from .data import router as data_router
from .ml import router as ml_router
from .analytics import router as analytics_router
from .export import router as export_router
from .bi_exports import router as bi_exports_router

__all__ = [
    "auth_router",
    "data_router",
    "ml_router",
    "analytics_router",
    "export_router",
    "bi_exports_router"
]
