# backend/app/models/__init__.py
"""
Database Models
===============

SQLAlchemy ORM models for database tables with relationships,
constraints, and business logic.

Models:
    - User: Authentication and user management
    - Dataset: Uploaded datasets and metadata
    - Prediction: ML prediction results and history

Architecture:
    - Base declarative class
    - TimestampMixin for created_at/updated_at
    - Soft delete support
    - Indexing for performance
    - Foreign key relationships
    - Cascade operations

Database Features:
    - Automatic timestamps
    - UUID primary keys
    - Composite indexes
    - Unique constraints
    - Check constraints
    - Audit trails
    - Soft deletes

Best Practices:
    - Type hints for IDE support
    - Comprehensive docstrings
    - Business logic in models
    - Proper relationships
    - Database migrations ready

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Base class for all models
Base = declarative_base()

# Import models
from .user import User, UserRole
from .dataset import Dataset, DatasetStatus
from .prediction import Prediction, PredictionStatus

__version__ = "1.0.0"
__author__ = "Elizabeth Díaz Familia"

__all__ = [
    # Base
    "Base",
    
    # User
    "User",
    "UserRole",
    
    # Dataset
    "Dataset",
    "DatasetStatus",
    
    # Prediction
    "Prediction",
    "PredictionStatus"
]


# ==================== DATABASE UTILITIES ====================

def init_db(database_url: str):
    """
    Initialize database and create tables.
    
    Args:
        database_url: Database connection string
    """
    engine = create_engine(database_url)
    Base.metadata.create_all(bind=engine)
    return engine


def get_session(engine):
    """
    Get database session.
    
    Args:
        engine: SQLAlchemy engine
        
    Returns:
        Session: Database session
    """
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()
