# backend/app/schemas/export.py
"""
Export Schemas
==============

Pydantic schemas for data export and BI integration.

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from enum import Enum


class ExportFormat(str, Enum):
    """Export formats"""
    CSV = "csv"
    EXCEL = "excel"
    JSON = "json"
    PDF = "pdf"
    POWERBI = "powerbi"
    TABLEAU = "tableau"


class ExportStatus(str, Enum):
    """Export status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ==================== REQUEST SCHEMAS ====================

class ExportRequest(BaseModel):
    """Schema for export request"""
    dataset_id: str = Field(..., description="Dataset UUID to export")
    format: ExportFormat = Field(..., description="Export format")
    include_predictions: bool = Field(default=False, description="Include predictions")
    filters: Optional[Dict[str, Any]] = Field(None, description="Data filters")
    
    class Config:
        schema_extra = {
            "example": {
                "dataset_id": "660e8400-e29b-41d4-a716-446655440000",
                "format": "excel",
                "include_predictions": True,
                "filters": {
                    "churn": True,
                    "risk_level": "high"
                }
            }
        }


class ExportConfig(BaseModel):
    """Export configuration"""
    filename: Optional[str] = Field(None, description="Custom filename")
    sheet_name: Optional[str] = Field(None, description="Excel sheet name")
    include_charts: bool = Field(default=False, description="Include charts (Excel/PDF)")
    include_summary: bool = Field(default=True, description="Include summary statistics")


class PowerBIConfig(BaseModel):
    """Power BI export configuration"""
    dataset_name: str = Field(..., description="Power BI dataset name")
    table_name: str = Field(default="ChurnData", description="Table name in Power BI")
    refresh_mode: str = Field(default="replace", description="Refresh mode (replace/append)")
    
    class Config:
        schema_extra = {
            "example": {
                "dataset_name": "Telecom Churn Analysis",
                "table_name": "CustomerData",
                "refresh_mode": "replace"
            }
        }


class TableauConfig(BaseModel):
    """Tableau export configuration"""
    extract_name: str = Field(..., description="Tableau extract name")
    extract_type: str = Field(default="tde", description="Extract type (tde/hyper)")
    
    class Config:
        schema_extra = {
            "example": {
                "extract_name": "churn_analysis",
                "extract_type": "hyper"
            }
        }


# ==================== RESPONSE SCHEMAS ====================

class ExportResponse(BaseModel):
    """Schema for export response"""
    id: str = Field(..., description="Export job UUID")
    dataset_id: str
    format: ExportFormat
    status: ExportStatus
    filename: Optional[str] = None
    file_size_bytes: Optional[int] = None
    download_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "id": "880e8400-e29b-41d4-a716-446655440000",
                "dataset_id": "660e8400-e29b-41d4-a716-446655440000",
                "format": "excel",
                "status": "completed",
                "filename": "churn_analysis_2024-02-13.xlsx",
                "file_size_bytes": 2048576,
                "download_url": "/api/v1/exports/880e8400.../download",
                "created_at": "2024-02-13T14:22:00",
                "completed_at": "2024-02-13T14:23:15"
            }
        }
