# backend/app/schemas/ml.py
"""
ML Schemas
==========

Pydantic schemas for ML predictions and model info.

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class PredictionType(str, Enum):
    """Prediction types"""
    CHURN = "churn"
    CLASSIFICATION = "classification"
    REGRESSION = "regression"


class RiskLevel(str, Enum):
    """Risk levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# ==================== REQUEST SCHEMAS ====================

class PredictionRequest(BaseModel):
    """Schema for prediction request"""
    model_name: str = Field(default="churn_predictor_v1", description="Model to use")
    input_data: Dict[str, Any] = Field(..., description="Input features")
    include_explanation: bool = Field(default=False, description="Include SHAP/LIME explanation")
    
    class Config:
        schema_extra = {
            "example": {
                "model_name": "churn_predictor_v1",
                "input_data": {
                    "tenure": 12,
                    "monthly_charges": 65.50,
                    "contract": "Month-to-month",
                    "internet_service": "Fiber optic",
                    "payment_method": "Electronic check"
                },
                "include_explanation": True
            }
        }


class PredictionBatch(BaseModel):
    """Schema for batch prediction request"""
    model_name: str = Field(default="churn_predictor_v1")
    dataset_id: str = Field(..., description="Dataset UUID to predict on")
    include_explanations: bool = Field(default=False)


# ==================== RESPONSE SCHEMAS ====================

class FeatureImportance(BaseModel):
    """Feature importance scores"""
    features: Dict[str, float] = Field(..., description="Feature importance mapping")
    
    class Config:
        schema_extra = {
            "example": {
                "features": {
                    "tenure": 0.35,
                    "contract": 0.28,
                    "monthly_charges": 0.22,
                    "internet_service": 0.15
                }
            }
        }


class ExplanationResponse(BaseModel):
    """SHAP/LIME explanation"""
    method: str = Field(..., description="Explanation method (shap/lime)")
    values: Dict[str, float] = Field(..., description="Feature contribution values")
    
    class Config:
        schema_extra = {
            "example": {
                "method": "shap",
                "values": {
                    "tenure": -0.15,
                    "contract": 0.28,
                    "monthly_charges": 0.12
                }
            }
        }


class PredictionResponse(BaseModel):
    """Schema for prediction response"""
    id: str = Field(..., description="Prediction UUID")
    prediction_type: PredictionType
    model_name: str
    model_version: str
    prediction_result: float = Field(..., description="Prediction value (0/1 for classification)")
    probability: Optional[float] = Field(None, ge=0, le=1, description="Prediction probability")
    confidence_score: Optional[float] = Field(None, ge=0, le=1, description="Confidence score")
    risk_level: Optional[RiskLevel] = None
    predicted_churn: Optional[bool] = Field(None, description="Churn prediction (boolean)")
    churn_probability_percent: Optional[float] = Field(None, description="Churn probability %")
    feature_importance: Optional[FeatureImportance] = None
    explanation: Optional[ExplanationResponse] = None
    processing_time_ms: Optional[int] = None
    created_at: datetime
    
    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": "770e8400-e29b-41d4-a716-446655440000",
                "prediction_type": "churn",
                "model_name": "churn_predictor_v1",
                "model_version": "1.0.0",
                "prediction_result": 1.0,
                "probability": 0.78,
                "confidence_score": 0.85,
                "risk_level": "high",
                "predicted_churn": True,
                "churn_probability_percent": 78.0,
                "feature_importance": {
                    "features": {
                        "tenure": 0.35,
                        "contract": 0.28
                    }
                },
                "processing_time_ms": 125,
                "created_at": "2024-02-13T14:22:00"
            }
        }


class ModelInfo(BaseModel):
    """Model metadata information"""
    name: str = Field(..., description="Model name")
    version: str = Field(..., description="Model version")
    type: str = Field(..., description="Model type (classification/regression)")
    description: Optional[str] = None
    accuracy: Optional[float] = Field(None, ge=0, le=1)
    precision: Optional[float] = Field(None, ge=0, le=1)
    recall: Optional[float] = Field(None, ge=0, le=1)
    f1_score: Optional[float] = Field(None, ge=0, le=1)
    roc_auc: Optional[float] = Field(None, ge=0, le=1)
    
    class Config:
        schema_extra = {
            "example": {
                "name": "churn_predictor_v1",
                "version": "1.0.0",
                "type": "classification",
                "description": "Random Forest churn predictor",
                "accuracy": 0.87,
                "precision": 0.85,
                "recall": 0.81,
                "f1_score": 0.83,
                "roc_auc": 0.89
            }
        }
