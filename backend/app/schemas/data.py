# backend/app/schemas/data.py
"""
Data Schemas
============

Pydantic schemas for dataset management.

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class DatasetStatus(str, Enum):
    """Dataset status"""
    UPLOADED = "uploaded"
    VALIDATING = "validating"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class FileFormat(str, Enum):
    """File formats"""
    CSV = "csv"
    EXCEL = "excel"
    JSON = "json"
    TSV = "tsv"
    PARQUET = "parquet"


# ==================== BASE SCHEMAS ====================

class DatasetBase(BaseModel):
    """Base dataset schema"""
    name: str = Field(..., min_length=1, max_length=255, description="Dataset name")
    description: Optional[str] = Field(None, max_length=1000, description="Dataset description")


# ==================== REQUEST SCHEMAS ====================

class DatasetCreate(DatasetBase):
    """Schema for dataset creation"""
    file_format: FileFormat = Field(..., description="File format")
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Customer Churn Q1 2024",
                "description": "Q1 customer churn data for analysis",
                "file_format": "csv"
            }
        }


class DatasetUpdate(BaseModel):
    """Schema for dataset update"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_public: Optional[bool] = None


class FileUpload(BaseModel):
    """Schema for file upload metadata"""
    filename: str = Field(..., description="Original filename")
    file_size_bytes: int = Field(..., gt=0, description="File size in bytes")
    content_type: str = Field(..., description="MIME type")


# ==================== RESPONSE SCHEMAS ====================

class SchemaInfo(BaseModel):
    """Dataset schema information"""
    columns: Dict[str, str] = Field(..., description="Column names and types")
    
    class Config:
        schema_extra = {
            "example": {
                "columns": {
                    "customer_id": "string",
                    "tenure": "int64",
                    "monthly_charges": "float64",
                    "churn": "bool"
                }
            }
        }


class DataQuality(BaseModel):
    """Data quality metrics"""
    total_rows: int = Field(..., description="Total number of rows")
    total_columns: int = Field(..., description="Total number of columns")
    missing_values: Dict[str, int] = Field(..., description="Missing values per column")
    duplicate_rows: int = Field(..., description="Number of duplicate rows")
    
    class Config:
        schema_extra = {
            "example": {
                "total_rows": 7043,
                "total_columns": 21,
                "missing_values": {
                    "total_charges": 11
                },
                "duplicate_rows": 0
            }
        }


class DatasetResponse(DatasetBase):
    """Schema for dataset response"""
    id: str = Field(..., description="Dataset UUID")
    user_id: str = Field(..., description="Owner user UUID")
    filename: str
    file_format: FileFormat
    file_size_bytes: int
    file_size_mb: float = Field(..., description="File size in MB")
    status: DatasetStatus
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    version: int
    is_public: bool
    download_count: int
    created_at: datetime
    processed_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": "660e8400-e29b-41d4-a716-446655440000",
                "user_id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "Customer Churn Q1 2024",
                "description": "Q1 customer data",
                "filename": "churn_data.csv",
                "file_format": "csv",
                "file_size_bytes": 1048576,
                "file_size_mb": 1.0,
                "status": "ready",
                "row_count": 7043,
                "column_count": 21,
                "version": 1,
                "is_public": False,
                "download_count": 5,
                "created_at": "2024-02-01T10:00:00",
                "processed_at": "2024-02-01T10:05:00"
            }
        }
