# backend/app/api/endpoints/data.py
"""
Data Management Endpoints
==========================

Handles dataset upload, processing, validation, and management operations.

Endpoints:
    POST /upload: Upload single dataset file
    POST /upload-multiple: Upload multiple files (max 10)
    GET /datasets: List all uploaded datasets
    GET /datasets/{id}: Get specific dataset information
    GET /datasets/{id}/stats: Get dataset statistics
    GET /datasets/{id}/preview: Preview dataset (first N rows)
    DELETE /datasets/{id}: Delete specific dataset
    POST /datasets/{id}/validate: Validate dataset for churn prediction
    DELETE /datasets/clear-all: Clear all datasets

Supported Formats:
    - CSV, Excel (.xlsx, .xls), JSON, TSV, TXT

Features:
    - Automatic format detection
    - Data validation and cleaning
    - Statistical analysis
    - Preview and exploration

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import pandas as pd
import io
import json
from datetime import datetime
from ..deps import get_current_user, validate_file_upload

router = APIRouter()

# ==================== MODELS ====================

class DatasetInfo(BaseModel):
    id: str
    name: str
    filename: str
    file_type: str
    rows: int
    columns: int
    size_mb: float
    uploaded_at: str
    uploaded_by: str
    status: str


class DatasetStats(BaseModel):
    total_rows: int
    total_columns: int
    numeric_columns: int
    text_columns: int
    missing_values: int
    duplicates: int
    memory_usage_mb: float


class UploadResponse(BaseModel):
    success: bool
    message: str
    dataset: DatasetInfo
    stats: DatasetStats


class ProcessResponse(BaseModel):
    success: bool
    message: str
    datasets_processed: int
    total_rows: int
    summary: Dict[str, Any]


# ==================== MOCK STORAGE ====================
# In production, use actual database

DATASETS_STORAGE = {}
DATASET_COUNTER = 1


# ==================== FILE PARSERS ====================

async def parse_file(file: UploadFile) -> pd.DataFrame:
    """Parse uploaded file based on type"""
    filename = file.filename.lower()
    content = await file.read()
    
    try:
        if filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content), encoding='utf-8')
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(content))
        elif filename.endswith('.json'):
            data = json.loads(content)
            if isinstance(data, list):
                df = pd.DataFrame(data)
            elif isinstance(data, dict):
                df = pd.DataFrame([data])
            else:
                raise ValueError("Unsupported JSON structure")
        elif filename.endswith('.tsv'):
            df = pd.read_csv(io.BytesIO(content), sep='\t')
        elif filename.endswith('.txt'):
            text = content.decode('utf-8')
            if ',' in text.split('\n')[0]:
                df = pd.read_csv(io.StringIO(text))
            else:
                df = pd.DataFrame({'text': text.split('\n')})
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {filename}"
            )
        
        return df
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error parsing file: {str(e)}"
        )


def calculate_stats(df: pd.DataFrame) -> DatasetStats:
    """Calculate dataset statistics"""
    return DatasetStats(
        total_rows=len(df),
        total_columns=len(df.columns),
        numeric_columns=len(df.select_dtypes(include=['number']).columns),
        text_columns=len(df.select_dtypes(include=['object']).columns),
        missing_values=int(df.isnull().sum().sum()),
        duplicates=int(df.duplicated().sum()),
        memory_usage_mb=round(df.memory_usage(deep=True).sum() / 1024**2, 2)
    )


# ==================== ENDPOINTS ====================

@router.post("/upload", response_model=UploadResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a single dataset file
    Supports: CSV, Excel, JSON, TSV, TXT
    """
    global DATASET_COUNTER
    
    # Validate file
    await validate_file_upload(file)
    
    # Parse file
    df = await parse_file(file)
    
    # Calculate stats
    stats = calculate_stats(df)
    
    # Create dataset info
    dataset_id = f"DS{DATASET_COUNTER:04d}"
    DATASET_COUNTER += 1
    
    dataset_info = DatasetInfo(
        id=dataset_id,
        name=file.filename.rsplit('.', 1)[0],
        filename=file.filename,
        file_type=file.filename.split('.')[-1].upper(),
        rows=len(df),
        columns=len(df.columns),
        size_mb=stats.memory_usage_mb,
        uploaded_at=datetime.utcnow().isoformat(),
        uploaded_by=current_user['email'],
        status="ready"
    )
    
    # Store dataset (in production, save to database)
    DATASETS_STORAGE[dataset_id] = {
        "info": dataset_info.dict(),
        "dataframe": df,
        "stats": stats.dict()
    }
    
    return UploadResponse(
        success=True,
        message=f"Dataset uploaded successfully: {file.filename}",
        dataset=dataset_info,
        stats=stats
    )


@router.post("/upload-multiple", response_model=ProcessResponse)
async def upload_multiple_datasets(
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload multiple dataset files (max 10)
    """
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 files allowed"
        )
    
    results = []
    total_rows = 0
    
    for file in files:
        try:
            await validate_file_upload(file)
            df = await parse_file(file)
            stats = calculate_stats(df)
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "rows": len(df),
                "columns": len(df.columns)
            })
            
            total_rows += len(df)
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "failed",
                "error": str(e)
            })
    
    successful = len([r for r in results if r['status'] == 'success'])
    
    return ProcessResponse(
        success=True,
        message=f"Processed {successful}/{len(files)} files successfully",
        datasets_processed=successful,
        total_rows=total_rows,
        summary={"files": results}
    )


@router.get("/datasets", response_model=List[DatasetInfo])
async def list_datasets(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    """
    List all uploaded datasets
    """
    datasets = [
        DatasetInfo(**data['info']) 
        for data in DATASETS_STORAGE.values()
    ]
    
    return datasets[skip:skip + limit]


@router.get("/datasets/{dataset_id}", response_model=DatasetInfo)
async def get_dataset(
    dataset_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get dataset information by ID
    """
    if dataset_id not in DATASETS_STORAGE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset not found: {dataset_id}"
        )
    
    return DatasetInfo(**DATASETS_STORAGE[dataset_id]['info'])


@router.get("/datasets/{dataset_id}/stats", response_model=DatasetStats)
async def get_dataset_stats(
    dataset_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get dataset statistics
    """
    if dataset_id not in DATASETS_STORAGE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset not found: {dataset_id}"
        )
    
    return DatasetStats(**DATASETS_STORAGE[dataset_id]['stats'])


@router.get("/datasets/{dataset_id}/preview")
async def preview_dataset(
    dataset_id: str,
    rows: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """
    Preview dataset (first N rows)
    """
    if dataset_id not in DATASETS_STORAGE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset not found: {dataset_id}"
        )
    
    df = DATASETS_STORAGE[dataset_id]['dataframe']
    preview = df.head(rows).to_dict('records')
    
    return {
        "dataset_id": dataset_id,
        "rows": len(preview),
        "columns": list(df.columns),
        "data": preview
    }


@router.delete("/datasets/{dataset_id}")
async def delete_dataset(
    dataset_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete dataset by ID
    """
    if dataset_id not in DATASETS_STORAGE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset not found: {dataset_id}"
        )
    
    del DATASETS_STORAGE[dataset_id]
    
    return {
        "success": True,
        "message": f"Dataset {dataset_id} deleted successfully"
    }


@router.post("/datasets/{dataset_id}/validate")
async def validate_dataset(
    dataset_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Validate dataset for churn prediction
    """
    if dataset_id not in DATASETS_STORAGE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset not found: {dataset_id}"
        )
    
    df = DATASETS_STORAGE[dataset_id]['dataframe']
    
    # Required columns for churn prediction
    required_columns = [
        'customerID', 'tenure', 'MonthlyCharges', 'TotalCharges'
    ]
    
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    validation = {
        "is_valid": len(missing_columns) == 0,
        "missing_columns": missing_columns,
        "total_columns": len(df.columns),
        "total_rows": len(df),
        "issues": []
    }
    
    # Check for missing values
    if df.isnull().sum().sum() > 0:
        validation['issues'].append("Dataset contains missing values")
    
    # Check for duplicates
    if df.duplicated().sum() > 0:
        validation['issues'].append("Dataset contains duplicate rows")
    
    return validation


@router.delete("/datasets/clear-all")
async def clear_all_datasets(
    current_user: dict = Depends(get_current_user)
):
    """
    Clear all datasets
    """
    count = len(DATASETS_STORAGE)
    DATASETS_STORAGE.clear()
    
    return {
        "success": True,
        "message": f"Cleared {count} datasets"
    }
