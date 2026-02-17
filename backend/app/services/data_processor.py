# backend/app/services/data_processor.py
"""
Data Processor - ETL Pipeline
==============================

Complete ETL (Extract, Transform, Load) pipeline for data processing
with support for multiple data sources and transformations.

ETL Stages:
    1. Extract: Load data from various sources
    2. Transform: Clean, validate, and transform data
    3. Load: Save processed data to destination

Features:
    - Multiple data source support (CSV, Excel, JSON, databases)
    - Data validation and quality checks
    - Data cleaning and preprocessing
    - Feature engineering
    - Data aggregation and summarization
    - Error handling and logging
    - Progress tracking
    - Batch processing

Transformations:
    - Missing value handling
    - Outlier detection and treatment
    - Data type conversion
    - Feature encoding
    - Data normalization
    - Duplicate removal
    - Data validation

Use Cases:
    - Automated data pipelines
    - Data preparation for ML
    - Report data preparation
    - Data migration
    - Data quality assurance

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Dict, Any, List, Optional, Tuple, Union, Callable
import pandas as pd
import numpy as np
from pathlib import Path
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class DataProcessor:
    """
    Main data processing class with ETL capabilities.
    
    Handles data extraction, transformation, and loading with
    support for various data sources and formats.
    
    Example:
        >>> processor = DataProcessor()
        >>> data = processor.extract(source='data.csv')
        >>> data_clean = processor.transform(data)
        >>> processor.load(data_clean, destination='processed_data.csv')
    """
    
    def __init__(
        self,
        validate_data: bool = True,
        handle_missing: bool = True,
        remove_duplicates: bool = True,
        verbose: bool = True
    ):
        """
        Initialize Data Processor.
        
        Args:
            validate_data: Whether to validate data quality
            handle_missing: Whether to handle missing values
            remove_duplicates: Whether to remove duplicate rows
            verbose: Enable verbose logging
        """
        self.validate_data = validate_data
        self.handle_missing = handle_missing
        self.remove_duplicates = remove_duplicates
        self.verbose = verbose
        
        # Processing metadata
        self.processing_stats: Dict[str, Any] = {}
        
        logger.info("🔄 DataProcessor initialized")
    
    # ==================== EXTRACT ====================
    
    def extract(
        self,
        source: Union[str, Path, pd.DataFrame],
        source_type: Optional[str] = None,
        **kwargs
    ) -> pd.DataFrame:
        """
        Extract data from source.
        
        Args:
            source: Data source (file path or DataFrame)
            source_type: Type of source (csv, excel, json, sql)
            **kwargs: Additional arguments for reading
            
        Returns:
            DataFrame with extracted data
        """
        logger.info("=" * 60)
        logger.info("📥 EXTRACTING DATA")
        logger.info("=" * 60)
        
        # If already a DataFrame, return as is
        if isinstance(source, pd.DataFrame):
            logger.info("   Source: DataFrame")
            logger.info(f"   Shape: {source.shape}")
            return source
        
        # Convert to Path
        source = Path(source)
        
        # Auto-detect source type from extension
        if source_type is None:
            source_type = source.suffix.lower().lstrip('.')
        
        logger.info(f"   Source: {source}")
        logger.info(f"   Type: {source_type}")
        
        # Extract based on type
        if source_type in ['csv', 'tsv', 'txt']:
            separator = '\t' if source_type == 'tsv' else ','
            data = pd.read_csv(source, sep=separator, **kwargs)
        
        elif source_type in ['xlsx', 'xls', 'excel']:
            data = pd.read_excel(source, **kwargs)
        
        elif source_type == 'json':
            data = pd.read_json(source, **kwargs)
        
        elif source_type == 'parquet':
            data = pd.read_parquet(source, **kwargs)
        
        else:
            raise ValueError(f"Unsupported source type: {source_type}")
        
        logger.info(f"   ✅ Extracted {len(data):,} rows, {len(data.columns)} columns")
        
        return data
    
    # ==================== TRANSFORM ====================
    
    def transform(
        self,
        data: pd.DataFrame,
        transformations: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """
        Transform data with cleaning and preprocessing.
        
        Args:
            data: Input DataFrame
            transformations: List of transformations to apply
            
        Returns:
            Transformed DataFrame
        """
        logger.info("\n" + "=" * 60)
        logger.info("🔧 TRANSFORMING DATA")
        logger.info("=" * 60)
        
        data = data.copy()
        original_shape = data.shape
        
        # Default transformations
        if transformations is None:
            transformations = ['validate', 'missing', 'duplicates', 'types']
        
        # Apply transformations
        if 'validate' in transformations and self.validate_data:
            self._validate_data_quality(data)
        
        if 'missing' in transformations and self.handle_missing:
            data = self._handle_missing_values(data)
        
        if 'duplicates' in transformations and self.remove_duplicates:
            data = self._remove_duplicates(data)
        
        if 'types' in transformations:
            data = self._convert_data_types(data)
        
        if 'outliers' in transformations:
            data = self._handle_outliers(data)
        
        # Log transformation summary
        logger.info(f"\n   Original shape: {original_shape}")
        logger.info(f"   Final shape: {data.shape}")
        logger.info(f"   Rows removed: {original_shape[0] - data.shape[0]}")
        
        return data
    
    def _validate_data_quality(self, data: pd.DataFrame):
        """Validate data quality"""
        logger.info("\n   ✓ Validating data quality...")
        
        # Check for completely empty columns
        empty_cols = data.columns[data.isnull().all()].tolist()
        if empty_cols:
            logger.warning(f"      Empty columns: {empty_cols}")
        
        # Check for high missing percentage
        missing_pct = (data.isnull().sum() / len(data) * 100)
        high_missing = missing_pct[missing_pct > 50].to_dict()
        if high_missing:
            logger.warning(f"      High missing (>50%): {high_missing}")
        
        # Check for single-value columns
        single_value_cols = [col for col in data.columns if data[col].nunique() == 1]
        if single_value_cols:
            logger.warning(f"      Single-value columns: {single_value_cols}")
        
        logger.info("      ✅ Validation complete")
    
    def _handle_missing_values(self, data: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values"""
        logger.info("\n   ✓ Handling missing values...")
        
        missing_before = data.isnull().sum().sum()
        
        if missing_before == 0:
            logger.info("      No missing values found")
            return data
        
        logger.info(f"      Missing values: {missing_before:,}")
        
        # Numerical columns: fill with median
        numerical_cols = data.select_dtypes(include=[np.number]).columns
        for col in numerical_cols:
            if data[col].isnull().any():
                data[col].fillna(data[col].median(), inplace=True)
        
        # Categorical columns: fill with mode
        categorical_cols = data.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            if data[col].isnull().any():
                mode_value = data[col].mode()[0] if len(data[col].mode()) > 0 else 'Unknown'
                data[col].fillna(mode_value, inplace=True)
        
        missing_after = data.isnull().sum().sum()
        logger.info(f"      Filled {missing_before - missing_after:,} missing values")
        
        return data
    
    def _remove_duplicates(self, data: pd.DataFrame) -> pd.DataFrame:
        """Remove duplicate rows"""
        logger.info("\n   ✓ Removing duplicates...")
        
        duplicates_count = data.duplicated().sum()
        
        if duplicates_count == 0:
            logger.info("      No duplicates found")
            return data
        
        logger.info(f"      Duplicates found: {duplicates_count:,}")
        
        data = data.drop_duplicates()
        
        logger.info(f"      ✅ Removed {duplicates_count:,} duplicate rows")
        
        return data
    
    def _convert_data_types(self, data: pd.DataFrame) -> pd.DataFrame:
        """Convert data types appropriately"""
        logger.info("\n   ✓ Converting data types...")
        
        conversions = 0
        
        for col in data.columns:
            # Try to convert to numeric if possible
            if data[col].dtype == 'object':
                try:
                    # Check if all non-null values are numeric
                    pd.to_numeric(data[col], errors='raise')
                    data[col] = pd.to_numeric(data[col])
                    conversions += 1
                except (ValueError, TypeError):
                    pass
        
        if conversions > 0:
            logger.info(f"      Converted {conversions} columns to numeric")
        else:
            logger.info("      No type conversions needed")
        
        return data
    
    def _handle_outliers(self, data: pd.DataFrame) -> pd.DataFrame:
        """Handle outliers using IQR method"""
        logger.info("\n   ✓ Handling outliers...")
        
        numerical_cols = data.select_dtypes(include=[np.number]).columns
        outliers_removed = 0
        
        for col in numerical_cols:
            Q1 = data[col].quantile(0.25)
            Q3 = data[col].quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            # Clip outliers
            outliers = ((data[col] < lower_bound) | (data[col] > upper_bound)).sum()
            if outliers > 0:
                data[col] = data[col].clip(lower_bound, upper_bound)
                outliers_removed += outliers
        
        if outliers_removed > 0:
            logger.info(f"      Clipped {outliers_removed:,} outlier values")
        else:
            logger.info("      No outliers found")
        
        return data
    
    # ==================== LOAD ====================
    
    def load(
        self,
        data: pd.DataFrame,
        destination: Union[str, Path],
        format: Optional[str] = None,
        **kwargs
    ):
        """
        Load data to destination.
        
        Args:
            data: DataFrame to save
            destination: Destination path
            format: Output format (csv, excel, json, parquet)
            **kwargs: Additional arguments for writing
        """
        logger.info("\n" + "=" * 60)
        logger.info("💾 LOADING DATA")
        logger.info("=" * 60)
        
        destination = Path(destination)
        destination.parent.mkdir(parents=True, exist_ok=True)
        
        # Auto-detect format
        if format is None:
            format = destination.suffix.lower().lstrip('.')
        
        logger.info(f"   Destination: {destination}")
        logger.info(f"   Format: {format}")
        logger.info(f"   Shape: {data.shape}")
        
        # Save based on format
        if format in ['csv', 'tsv']:
            separator = '\t' if format == 'tsv' else ','
            data.to_csv(destination, sep=separator, index=False, **kwargs)
        
        elif format in ['xlsx', 'xls', 'excel']:
            data.to_excel(destination, index=False, **kwargs)
        
        elif format == 'json':
            data.to_json(destination, **kwargs)
        
        elif format == 'parquet':
            data.to_parquet(destination, **kwargs)
        
        else:
            raise ValueError(f"Unsupported format: {format}")
        
        file_size = destination.stat().st_size / (1024 * 1024)  # MB
        logger.info(f"   ✅ Data saved ({file_size:.2f} MB)")
    
    # ==================== ETL PIPELINE ====================
    
    def run_etl(
        self,
        source: Union[str, Path],
        destination: Union[str, Path],
        transformations: Optional[List[str]] = None,
        **kwargs
    ) -> pd.DataFrame:
        """
        Run complete ETL pipeline.
        
        Args:
            source: Data source
            destination: Data destination
            transformations: List of transformations
            **kwargs: Additional arguments
            
        Returns:
            Processed DataFrame
        """
        logger.info("\n" + "=" * 60)
        logger.info("🚀 RUNNING ETL PIPELINE")
        logger.info("=" * 60)
        
        start_time = datetime.now()
        
        # Extract
        data = self.extract(source, **kwargs)
        
        # Transform
        data = self.transform(data, transformations)
        
        # Load
        self.load(data, destination, **kwargs)
        
        # Summary
        elapsed = (datetime.now() - start_time).total_seconds()
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ ETL PIPELINE COMPLETE")
        logger.info("=" * 60)
        logger.info(f"   Duration: {elapsed:.2f}s")
        logger.info(f"   Rows processed: {len(data):,}")
        logger.info(f"   Columns: {len(data.columns)}")
        logger.info("=" * 60)
        
        return data


class ETLPipeline:
    """
    Advanced ETL pipeline with custom transformations.
    
    Supports chaining multiple transformations and
    custom transformation functions.
    """
    
    def __init__(self):
        """Initialize ETL Pipeline"""
        self.transformations: List[Callable] = []
        self.processor = DataProcessor()
        
        logger.info("🔧 ETLPipeline initialized")
    
    def add_transformation(self, func: Callable, name: Optional[str] = None):
        """
        Add custom transformation function.
        
        Args:
            func: Transformation function (takes DataFrame, returns DataFrame)
            name: Optional name for logging
        """
        self.transformations.append((name or func.__name__, func))
        logger.info(f"   Added transformation: {name or func.__name__}")
    
    def run(
        self,
        source: Union[str, Path, pd.DataFrame],
        destination: Optional[Union[str, Path]] = None
    ) -> pd.DataFrame:
        """
        Run ETL pipeline with custom transformations.
        
        Args:
            source: Data source
            destination: Optional destination
            
        Returns:
            Processed DataFrame
        """
        logger.info("🔧 Running ETL pipeline with custom transformations...")
        
        # Extract
        data = self.processor.extract(source)
        
        # Apply custom transformations
        for name, func in self.transformations:
            logger.info(f"   Applying: {name}")
            data = func(data)
        
        # Load if destination provided
        if destination:
            self.processor.load(data, destination)
        
        return data


# ==================== UTILITY FUNCTIONS ====================

def quick_etl(
    source: Union[str, Path],
    destination: Union[str, Path],
    clean: bool = True
) -> pd.DataFrame:
    """
    Quick ETL function for simple data processing.
    
    Args:
        source: Data source
        destination: Data destination
        clean: Whether to apply cleaning transformations
        
    Returns:
        Processed DataFrame
    """
    processor = DataProcessor(
        validate_data=clean,
        handle_missing=clean,
        remove_duplicates=clean
    )
    
    return processor.run_etl(source, destination)
