# backend/app/schemas/__init__.py
"""
Pydantic Schemas
================

Request and response schemas for API validation and documentation.

This module provides:
    - Request validation schemas
    - Response serialization schemas
    - Automatic API documentation (OpenAPI/Swagger)
    - Type safety and data validation
    - Custom validators
    - Nested schemas

Schema Types:
    - User schemas (authentication, registration)
    - Data schemas (dataset upload, metadata)
    - ML schemas (predictions, model info)
    - Export schemas (BI tools, reports)

Features:
    - Field validation (type, format, range)
    - Custom validators
    - Automatic coercion
    - Default values
    - Optional vs Required fields
    - Nested models
    - Config classes (orm_mode, aliases)
    - Examples for documentation

Best Practices:
    - Separate Create/Update/Response schemas
    - Use Field() for validation and docs
    - Provide examples for OpenAPI
    - Use validators for business logic
    - Enable orm_mode for ORM models

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

# User Schemas
from .user import (
    UserBase, UserCreate, UserLogin, UserResponse, UserUpdate,
    Token, TokenData, PasswordReset, EmailVerification
)

# Data Schemas
from .data import (
    DatasetBase, DatasetCreate, DatasetResponse, DatasetUpdate,
    FileUpload, DataQuality, SchemaInfo
)

# ML Schemas
from .ml import (
    PredictionRequest, PredictionResponse, PredictionBatch,
    ModelInfo, FeatureImportance, ExplanationResponse
)

# Export Schemas
from .export import (
    ExportRequest, ExportResponse, ExportConfig,
    PowerBIConfig, TableauConfig
)

__version__ = "1.0.0"
__author__ = "Elizabeth Díaz Familia"

__all__ = [
    # User
    "UserBase",
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "UserUpdate",
    "Token",
    "TokenData",
    "PasswordReset",
    "EmailVerification",
    
    # Data
    "DatasetBase",
    "DatasetCreate",
    "DatasetResponse",
    "DatasetUpdate",
    "FileUpload",
    "DataQuality",
    "SchemaInfo",
    
    # ML
    "PredictionRequest",
    "PredictionResponse",
    "PredictionBatch",
    "ModelInfo",
    "FeatureImportance",
    "ExplanationResponse",
    
    # Export
    "ExportRequest",
    "ExportResponse",
    "ExportConfig",
    "PowerBIConfig",
    "TableauConfig"
]
