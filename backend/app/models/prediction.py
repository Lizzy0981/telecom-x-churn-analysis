# backend/app/models/prediction.py
"""
Prediction Model
================

Prediction model for ML prediction results and history.

Features:
    - Prediction results storage
    - Confidence scores
    - Feature importance
    - Model metadata
    - Batch predictions
    - Prediction status tracking
    - Automatic timestamps
    - Audit trail

Prediction Types:
    - CHURN: Customer churn prediction
    - CLASSIFICATION: Generic classification
    - REGRESSION: Regression prediction
    - CLUSTERING: Cluster assignment
    - ANOMALY: Anomaly detection

Prediction Status:
    - PENDING: Prediction queued
    - PROCESSING: Model running
    - COMPLETED: Prediction complete
    - FAILED: Prediction failed

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from sqlalchemy import (
    Column, String, Float, Boolean, DateTime, Enum,
    ForeignKey, Text, Integer
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from typing import Optional, Dict, Any, List

from . import Base
from .user import TimestampMixin


# ==================== ENUMS ====================

class PredictionType(str, enum.Enum):
    """Type of prediction"""
    CHURN = "churn"
    CLASSIFICATION = "classification"
    REGRESSION = "regression"
    CLUSTERING = "clustering"
    ANOMALY = "anomaly"


class PredictionStatus(str, enum.Enum):
    """Prediction status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class RiskLevel(str, enum.Enum):
    """Risk level for churn predictions"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# ==================== PREDICTION MODEL ====================

class Prediction(Base, TimestampMixin):
    """
    Prediction model for ML predictions and results.
    
    Attributes:
        id: UUID primary key
        user_id: Foreign key to User
        dataset_id: Foreign key to Dataset
        prediction_type: Type of prediction
        status: Prediction status
        model_name: Name of model used
        model_version: Model version
        input_data: Input features (JSON)
        prediction_result: Prediction output
        probability: Prediction probability (0-1)
        confidence_score: Confidence score
        risk_level: Risk level (for churn)
        feature_importance: Feature importance scores (JSON)
        explanation: SHAP/LIME explanation (JSON)
        metadata: Additional metadata (JSON)
        processing_time_ms: Processing time in milliseconds
        error_message: Error message if failed
        
    Relationships:
        user: User who requested prediction
        dataset: Source dataset (if applicable)
        
    Example:
        >>> prediction = Prediction(
        ...     user_id=user.id,
        ...     dataset_id=dataset.id,
        ...     prediction_type=PredictionType.CHURN,
        ...     model_name="churn_predictor_v1",
        ...     input_data={"tenure": 12, "monthly_charges": 65.5}
        ... )
        >>> prediction.set_result(
        ...     result=1,
        ...     probability=0.78,
        ...     risk_level=RiskLevel.HIGH
        ... )
    """
    
    __tablename__ = "predictions"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey('datasets.id'), nullable=True, index=True)
    
    # Prediction Info
    prediction_type = Column(Enum(PredictionType), nullable=False, index=True)
    status = Column(Enum(PredictionStatus), default=PredictionStatus.PENDING, nullable=False, index=True)
    
    # Model Info
    model_name = Column(String(100), nullable=False)
    model_version = Column(String(50), nullable=False)
    
    # Input
    input_data = Column(JSONB, nullable=False)  # Features used for prediction
    
    # Output
    prediction_result = Column(Float, nullable=True)  # 0 or 1 for classification, float for regression
    probability = Column(Float, nullable=True)  # Probability score (0-1)
    confidence_score = Column(Float, nullable=True)  # Model confidence
    
    # Churn-specific
    risk_level = Column(Enum(RiskLevel), nullable=True)
    
    # Explainability
    feature_importance = Column(JSONB, nullable=True)  # Feature importance scores
    explanation = Column(JSONB, nullable=True)  # SHAP/LIME explanation
    
    # Metadata
    metadata = Column(JSONB, nullable=True)  # Additional information
    
    # Performance
    processing_time_ms = Column(Integer, nullable=True)
    
    # Error Handling
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    failed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="predictions")
    dataset = relationship("Dataset", back_populates="predictions")
    
    def __repr__(self) -> str:
        """String representation"""
        return f"<Prediction(id={self.id}, type={self.prediction_type}, status={self.status})>"
    
    # ==================== STATUS MANAGEMENT ====================
    
    def mark_processing(self):
        """Mark prediction as processing"""
        self.status = PredictionStatus.PROCESSING
        self.started_at = datetime.utcnow()
    
    def mark_completed(self):
        """Mark prediction as completed"""
        self.status = PredictionStatus.COMPLETED
        self.completed_at = datetime.utcnow()
        
        # Calculate processing time
        if self.started_at:
            delta = self.completed_at - self.started_at
            self.processing_time_ms = int(delta.total_seconds() * 1000)
    
    def mark_failed(self, error_message: str):
        """
        Mark prediction as failed.
        
        Args:
            error_message: Error description
        """
        self.status = PredictionStatus.FAILED
        self.failed_at = datetime.utcnow()
        self.error_message = error_message
    
    # ==================== RESULT METHODS ====================
    
    def set_result(
        self,
        result: float,
        probability: Optional[float] = None,
        confidence_score: Optional[float] = None,
        risk_level: Optional[RiskLevel] = None
    ):
        """
        Set prediction result.
        
        Args:
            result: Prediction result
            probability: Probability score
            confidence_score: Confidence score
            risk_level: Risk level (for churn)
        """
        self.prediction_result = result
        self.probability = probability
        self.confidence_score = confidence_score
        self.risk_level = risk_level
    
    def set_feature_importance(self, importance: Dict[str, float]):
        """
        Set feature importance scores.
        
        Args:
            importance: Dict mapping features to importance scores
        """
        self.feature_importance = importance
    
    def set_explanation(self, explanation: Dict[str, Any]):
        """
        Set SHAP/LIME explanation.
        
        Args:
            explanation: Explanation data
        """
        self.explanation = explanation
    
    def set_metadata(self, metadata: Dict[str, Any]):
        """
        Set additional metadata.
        
        Args:
            metadata: Metadata dict
        """
        self.metadata = metadata
    
    # ==================== UTILITY METHODS ====================
    
    @property
    def is_completed(self) -> bool:
        """Check if prediction is completed"""
        return self.status == PredictionStatus.COMPLETED
    
    @property
    def is_failed(self) -> bool:
        """Check if prediction failed"""
        return self.status == PredictionStatus.FAILED
    
    @property
    def is_churn_prediction(self) -> bool:
        """Check if this is a churn prediction"""
        return self.prediction_type == PredictionType.CHURN
    
    @property
    def predicted_churn(self) -> Optional[bool]:
        """Get churn prediction as boolean"""
        if self.prediction_result is not None:
            return bool(round(self.prediction_result))
        return None
    
    @property
    def churn_probability_percent(self) -> Optional[float]:
        """Get churn probability as percentage"""
        if self.probability is not None:
            return round(self.probability * 100, 2)
        return None
    
    def to_dict(self, include_input: bool = False) -> dict:
        """
        Convert to dictionary.
        
        Args:
            include_input: Whether to include input data
            
        Returns:
            dict: Prediction data
        """
        data = {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'dataset_id': str(self.dataset_id) if self.dataset_id else None,
            'prediction_type': self.prediction_type.value,
            'status': self.status.value,
            'model_name': self.model_name,
            'model_version': self.model_version,
            'prediction_result': self.prediction_result,
            'probability': self.probability,
            'confidence_score': self.confidence_score,
            'risk_level': self.risk_level.value if self.risk_level else None,
            'processing_time_ms': self.processing_time_ms,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
        
        # Churn-specific fields
        if self.is_churn_prediction:
            data['predicted_churn'] = self.predicted_churn
            data['churn_probability_percent'] = self.churn_probability_percent
        
        if include_input:
            data['input_data'] = self.input_data
            data['feature_importance'] = self.feature_importance
            data['explanation'] = self.explanation
        
        return data
    
    @classmethod
    def create_churn_prediction(
        cls,
        user_id: uuid.UUID,
        model_name: str,
        model_version: str,
        input_data: Dict[str, Any],
        dataset_id: Optional[uuid.UUID] = None
    ) -> 'Prediction':
        """
        Create churn prediction.
        
        Args:
            user_id: User ID
            model_name: Model name
            model_version: Model version
            input_data: Input features
            dataset_id: Optional dataset ID
            
        Returns:
            Prediction: New prediction instance
        """
        return cls(
            user_id=user_id,
            dataset_id=dataset_id,
            prediction_type=PredictionType.CHURN,
            model_name=model_name,
            model_version=model_version,
            input_data=input_data
        )
    
    @classmethod
    def create_batch_predictions(
        cls,
        user_id: uuid.UUID,
        dataset_id: uuid.UUID,
        model_name: str,
        model_version: str,
        predictions_data: List[Dict[str, Any]]
    ) -> List['Prediction']:
        """
        Create batch predictions.
        
        Args:
            user_id: User ID
            dataset_id: Dataset ID
            model_name: Model name
            model_version: Model version
            predictions_data: List of prediction data dicts
            
        Returns:
            List[Prediction]: List of predictions
        """
        predictions = []
        
        for data in predictions_data:
            prediction = cls(
                user_id=user_id,
                dataset_id=dataset_id,
                prediction_type=data.get('type', PredictionType.CHURN),
                model_name=model_name,
                model_version=model_version,
                input_data=data.get('input', {}),
                prediction_result=data.get('result'),
                probability=data.get('probability'),
                confidence_score=data.get('confidence'),
                risk_level=data.get('risk_level')
            )
            prediction.mark_completed()
            predictions.append(prediction)
        
        return predictions


# ==================== INDEXES ====================

from sqlalchemy import Index

Index('idx_prediction_user_type', Prediction.user_id, Prediction.prediction_type)
Index('idx_prediction_dataset', Prediction.dataset_id)
Index('idx_prediction_status', Prediction.status)
Index('idx_prediction_created_at', Prediction.created_at.desc())
Index('idx_prediction_type_status', Prediction.prediction_type, Prediction.status)
