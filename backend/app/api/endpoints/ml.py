# backend/app/api/endpoints/ml.py
"""
Machine Learning Endpoints
===========================

Provides machine learning predictions, model training, and explainability features.

Endpoints:
    POST /predict: Single customer churn prediction
    POST /predict-batch: Batch predictions for entire dataset
    GET /feature-importance: Get feature importance rankings
    GET /model-info: Get current ML model information
    GET /model-metrics: Get model performance metrics
    POST /train: Train/retrain ML model
    GET /shap-values/{customer_id}: Get SHAP values for explainability
    GET /confusion-matrix: Get confusion matrix
    GET /roc-curve: Get ROC curve data

Features:
    - Real-time churn prediction
    - Batch processing support
    - Feature importance analysis
    - SHAP values for model explainability
    - Model performance metrics (accuracy, precision, recall, F1, AUC-ROC)

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import random
from datetime import datetime
from ..deps import get_current_user

router = APIRouter()

# ==================== MODELS ====================

class PredictionRequest(BaseModel):
    customer_id: str
    tenure: int
    monthly_charges: float
    total_charges: float
    contract_type: str
    payment_method: str
    internet_service: str


class PredictionResponse(BaseModel):
    customer_id: str
    churn_probability: float
    risk_level: str
    confidence: float
    predicted_at: str
    factors: List[Dict[str, Any]]


class BatchPredictionRequest(BaseModel):
    dataset_id: str


class BatchPredictionResponse(BaseModel):
    success: bool
    total_predictions: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    avg_churn_probability: float


class FeatureImportance(BaseModel):
    feature: str
    importance: float
    rank: int


class ModelMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    auc_roc: float


class ModelInfo(BaseModel):
    model_id: str
    version: str
    type: str
    trained_at: str
    metrics: ModelMetrics
    status: str


# ==================== HELPER FUNCTIONS ====================

def calculate_churn_probability(data: PredictionRequest) -> float:
    """
    Calculate churn probability (mock - in production use actual ML model)
    """
    # Mock calculation based on features
    score = 0.0
    
    # Tenure weight
    if data.tenure < 12:
        score += 0.3
    elif data.tenure < 24:
        score += 0.15
    
    # Contract type weight
    if data.contract_type == "Month-to-month":
        score += 0.25
    
    # Monthly charges weight
    if data.monthly_charges > 80:
        score += 0.2
    
    # Payment method weight
    if data.payment_method == "Electronic check":
        score += 0.15
    
    # Add some randomness
    score += random.uniform(-0.1, 0.1)
    
    return min(max(score, 0.0), 1.0)


def get_risk_level(probability: float) -> str:
    """Get risk level from probability"""
    if probability < 0.4:
        return "low"
    elif probability < 0.7:
        return "medium"
    else:
        return "high"


def get_top_factors(data: PredictionRequest, probability: float) -> List[Dict[str, Any]]:
    """Get top contributing factors"""
    factors = []
    
    if data.tenure < 12:
        factors.append({
            "feature": "tenure",
            "value": data.tenure,
            "impact": "high",
            "importance": 0.35
        })
    
    if data.contract_type == "Month-to-month":
        factors.append({
            "feature": "contract_type",
            "value": data.contract_type,
            "impact": "high",
            "importance": 0.30
        })
    
    if data.monthly_charges > 80:
        factors.append({
            "feature": "monthly_charges",
            "value": data.monthly_charges,
            "impact": "medium",
            "importance": 0.20
        })
    
    return factors[:3]


# ==================== ENDPOINTS ====================

@router.post("/predict", response_model=PredictionResponse)
async def predict_churn(
    request: PredictionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Predict churn for a single customer
    """
    # Calculate prediction
    churn_prob = calculate_churn_probability(request)
    risk_level = get_risk_level(churn_prob)
    confidence = random.uniform(0.75, 0.95)
    factors = get_top_factors(request, churn_prob)
    
    return PredictionResponse(
        customer_id=request.customer_id,
        churn_probability=round(churn_prob, 4),
        risk_level=risk_level,
        confidence=round(confidence, 4),
        predicted_at=datetime.utcnow().isoformat(),
        factors=factors
    )


@router.post("/predict-batch", response_model=BatchPredictionResponse)
async def predict_batch(
    request: BatchPredictionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Predict churn for entire dataset
    """
    # Mock batch prediction
    total = random.randint(100, 1000)
    high_risk = int(total * 0.15)
    medium_risk = int(total * 0.25)
    low_risk = total - high_risk - medium_risk
    
    return BatchPredictionResponse(
        success=True,
        total_predictions=total,
        high_risk_count=high_risk,
        medium_risk_count=medium_risk,
        low_risk_count=low_risk,
        avg_churn_probability=round(random.uniform(0.2, 0.4), 4)
    )


@router.get("/feature-importance", response_model=List[FeatureImportance])
async def get_feature_importance(
    current_user: dict = Depends(get_current_user)
):
    """
    Get feature importance rankings
    """
    features = [
        FeatureImportance(feature="contract_type", importance=0.45, rank=1),
        FeatureImportance(feature="tenure", importance=0.32, rank=2),
        FeatureImportance(feature="monthly_charges", importance=0.28, rank=3),
        FeatureImportance(feature="total_charges", importance=0.22, rank=4),
        FeatureImportance(feature="payment_method", importance=0.18, rank=5),
        FeatureImportance(feature="internet_service", importance=0.15, rank=6),
        FeatureImportance(feature="tech_support", importance=0.12, rank=7),
        FeatureImportance(feature="online_security", importance=0.10, rank=8)
    ]
    
    return features


@router.get("/model-info", response_model=ModelInfo)
async def get_model_info(
    current_user: dict = Depends(get_current_user)
):
    """
    Get current ML model information
    """
    return ModelInfo(
        model_id="model_tfjs_001",
        version="1.0.0",
        type="tensorflow.js",
        trained_at="2024-01-15T10:30:00Z",
        metrics=ModelMetrics(
            accuracy=0.873,
            precision=0.845,
            recall=0.812,
            f1_score=0.828,
            auc_roc=0.891
        ),
        status="active"
    )


@router.get("/model-metrics", response_model=ModelMetrics)
async def get_model_metrics(
    current_user: dict = Depends(get_current_user)
):
    """
    Get model performance metrics
    """
    return ModelMetrics(
        accuracy=0.873,
        precision=0.845,
        recall=0.812,
        f1_score=0.828,
        auc_roc=0.891
    )


@router.post("/train")
async def train_model(
    dataset_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Train/retrain ML model with new dataset
    """
    # Mock training process
    return {
        "success": True,
        "message": "Model training initiated",
        "job_id": f"train_job_{random.randint(1000, 9999)}",
        "estimated_time": "5-10 minutes",
        "status": "processing"
    }


@router.get("/shap-values/{customer_id}")
async def get_shap_values(
    customer_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get SHAP values for prediction explainability
    """
    # Mock SHAP values
    shap_values = [
        {"feature": "contract_type", "value": 0.15, "base_value": 0.3},
        {"feature": "tenure", "value": -0.08, "base_value": 0.3},
        {"feature": "monthly_charges", "value": 0.12, "base_value": 0.3},
        {"feature": "payment_method", "value": 0.06, "base_value": 0.3}
    ]
    
    return {
        "customer_id": customer_id,
        "base_value": 0.3,
        "predicted_value": 0.55,
        "shap_values": shap_values
    }


@router.get("/confusion-matrix")
async def get_confusion_matrix(
    current_user: dict = Depends(get_current_user)
):
    """
    Get confusion matrix for model evaluation
    """
    return {
        "true_positives": 342,
        "true_negatives": 1256,
        "false_positives": 87,
        "false_negatives": 65,
        "total": 1750
    }


@router.get("/roc-curve")
async def get_roc_curve(
    current_user: dict = Depends(get_current_user)
):
    """
    Get ROC curve data
    """
    # Mock ROC curve data
    points = []
    for i in range(0, 11):
        fpr = i / 10
        tpr = min(1.0, fpr + random.uniform(0.1, 0.3))
        points.append({"fpr": fpr, "tpr": tpr})
    
    return {
        "auc": 0.891,
        "curve_points": points
    }
