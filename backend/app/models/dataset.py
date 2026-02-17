# backend/app/models/dataset.py
"""
Dataset Model
=============

Dataset model for uploaded files and data management.

Features:
    - File metadata (name, size, format)
    - Upload tracking
    - Processing status
    - Data quality metrics
    - Schema validation
    - Version control
    - Automatic timestamps
    - Soft delete support

Dataset Lifecycle:
    1. UPLOADED: File uploaded
    2. VALIDATING: Schema validation in progress
    3. PROCESSING: Data cleaning and transformation
    4. READY: Ready for analysis
    5. FAILED: Processing failed
    6. ARCHIVED: Archived/deprecated

File Formats:
    - CSV (Comma-Separated Values)
    - Excel (.xlsx, .xls)
    - JSON (JavaScript Object Notation)
    - TSV (Tab-Separated Values)
    - Parquet (Columnar format)

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Enum,
    ForeignKey, Text, BigInteger
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from typing import Optional, Dict, Any

from . import Base
from .user import TimestampMixin, SoftDeleteMixin


# ==================== ENUMS ====================

class DatasetStatus(str, enum.Enum):
    """Dataset processing status"""
    UPLOADED = "uploaded"
    VALIDATING = "validating"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"
    ARCHIVED = "archived"


class FileFormat(str, enum.Enum):
    """Supported file formats"""
    CSV = "csv"
    EXCEL = "excel"
    JSON = "json"
    TSV = "tsv"
    PARQUET = "parquet"
    TXT = "txt"


# ==================== DATASET MODEL ====================

class Dataset(Base, TimestampMixin, SoftDeleteMixin):
    """
    Dataset model for uploaded files and data management.
    
    Attributes:
        id: UUID primary key
        user_id: Foreign key to User
        name: Dataset name
        description: Dataset description
        filename: Original filename
        filepath: Storage path
        file_format: File format (csv, excel, json, etc.)
        file_size_bytes: File size in bytes
        status: Processing status
        row_count: Number of rows
        column_count: Number of columns
        schema: JSON schema definition
        quality_metrics: Data quality metrics (JSON)
        processing_errors: Processing errors (JSON)
        version: Dataset version
        is_public: Whether dataset is public
        download_count: Number of downloads
        
    Relationships:
        user: Dataset owner
        predictions: Predictions made on this dataset
        
    Example:
        >>> dataset = Dataset(
        ...     user_id=user.id,
        ...     name="Customer Churn Data Q1 2024",
        ...     filename="churn_data.csv",
        ...     file_format=FileFormat.CSV
        ... )
        >>> session.add(dataset)
        >>> session.commit()
    """
    
    __tablename__ = "datasets"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Owner
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    
    # Basic Info
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # File Info
    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=False)
    file_format = Column(Enum(FileFormat), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False)
    
    # Status
    status = Column(Enum(DatasetStatus), default=DatasetStatus.UPLOADED, nullable=False, index=True)
    
    # Data Metrics
    row_count = Column(Integer, nullable=True)
    column_count = Column(Integer, nullable=True)
    
    # Schema and Quality
    schema = Column(JSONB, nullable=True)  # Column names and types
    quality_metrics = Column(JSONB, nullable=True)  # Missing values, outliers, etc.
    processing_errors = Column(JSONB, nullable=True)  # Errors during processing
    
    # Metadata
    version = Column(Integer, default=1, nullable=False)
    is_public = Column(Boolean, default=False, nullable=False)
    download_count = Column(Integer, default=0, nullable=False)
    
    # Processing Timestamps
    validated_at = Column(DateTime, nullable=True)
    processed_at = Column(DateTime, nullable=True)
    failed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="datasets")
    predictions = relationship("Prediction", back_populates="dataset", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        """String representation"""
        return f"<Dataset(id={self.id}, name={self.name}, status={self.status})>"
    
    # ==================== STATUS MANAGEMENT ====================
    
    def mark_validating(self):
        """Mark dataset as validating"""
        self.status = DatasetStatus.VALIDATING
        self.updated_at = datetime.utcnow()
    
    def mark_processing(self):
        """Mark dataset as processing"""
        self.status = DatasetStatus.PROCESSING
        self.updated_at = datetime.utcnow()
    
    def mark_ready(self):
        """Mark dataset as ready"""
        self.status = DatasetStatus.READY
        self.processed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def mark_failed(self, errors: Optional[Dict[str, Any]] = None):
        """
        Mark dataset as failed.
        
        Args:
            errors: Error details
        """
        self.status = DatasetStatus.FAILED
        self.failed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        
        if errors:
            self.processing_errors = errors
    
    def archive(self):
        """Archive dataset"""
        self.status = DatasetStatus.ARCHIVED
        self.updated_at = datetime.utcnow()
    
    # ==================== DATA METHODS ====================
    
    def set_schema(self, schema: Dict[str, str]):
        """
        Set dataset schema.
        
        Args:
            schema: Dict mapping column names to types
        """
        self.schema = schema
        self.column_count = len(schema)
    
    def set_quality_metrics(self, metrics: Dict[str, Any]):
        """
        Set quality metrics.
        
        Args:
            metrics: Quality metrics dict
        """
        self.quality_metrics = metrics
    
    def update_row_count(self, count: int):
        """Update row count"""
        self.row_count = count
    
    def increment_downloads(self):
        """Increment download counter"""
        self.download_count += 1
    
    # ==================== UTILITY METHODS ====================
    
    @property
    def file_size_mb(self) -> float:
        """Get file size in MB"""
        return round(self.file_size_bytes / (1024 * 1024), 2)
    
    @property
    def file_size_readable(self) -> str:
        """Get human-readable file size"""
        size = self.file_size_bytes
        
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.2f} {unit}"
            size /= 1024.0
        
        return f"{size:.2f} TB"
    
    @property
    def is_processed(self) -> bool:
        """Check if dataset is processed"""
        return self.status == DatasetStatus.READY
    
    @property
    def has_errors(self) -> bool:
        """Check if dataset has errors"""
        return self.status == DatasetStatus.FAILED and self.processing_errors is not None
    
    def to_dict(self, include_schema: bool = False) -> dict:
        """
        Convert to dictionary.
        
        Args:
            include_schema: Whether to include schema
            
        Returns:
            dict: Dataset data
        """
        data = {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'name': self.name,
            'description': self.description,
            'filename': self.filename,
            'file_format': self.file_format.value,
            'file_size_bytes': self.file_size_bytes,
            'file_size_mb': self.file_size_mb,
            'file_size_readable': self.file_size_readable,
            'status': self.status.value,
            'row_count': self.row_count,
            'column_count': self.column_count,
            'version': self.version,
            'is_public': self.is_public,
            'download_count': self.download_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None
        }
        
        if include_schema:
            data['schema'] = self.schema
            data['quality_metrics'] = self.quality_metrics
        
        return data
    
    @classmethod
    def create(
        cls,
        user_id: uuid.UUID,
        name: str,
        filename: str,
        filepath: str,
        file_format: FileFormat,
        file_size_bytes: int,
        description: Optional[str] = None
    ) -> 'Dataset':
        """
        Create new dataset.
        
        Args:
            user_id: User ID
            name: Dataset name
            filename: Original filename
            filepath: Storage path
            file_format: File format
            file_size_bytes: File size
            description: Optional description
            
        Returns:
            Dataset: New dataset instance
        """
        return cls(
            user_id=user_id,
            name=name,
            filename=filename,
            filepath=filepath,
            file_format=file_format,
            file_size_bytes=file_size_bytes,
            description=description
        )


# ==================== INDEXES ====================

from sqlalchemy import Index

Index('idx_dataset_user_status', Dataset.user_id, Dataset.status)
Index('idx_dataset_status', Dataset.status)
Index('idx_dataset_created_at', Dataset.created_at.desc())
Index('idx_dataset_is_public', Dataset.is_public)
