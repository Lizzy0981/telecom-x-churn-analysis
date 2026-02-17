# backend/app/ml/models/__init__.py
"""
ML Models Package
=================

Advanced machine learning models for various tasks:
    - Churn prediction (Ensemble, Neural Networks)
    - Customer clustering (K-Means, DBSCAN)
    - Anomaly detection (Isolation Forest)
    - Time series forecasting (LSTM, ARIMA)
    - AutoML (Automated model selection)

Each model class provides:
    - fit() method for training
    - predict() method for inference
    - evaluate() method for metrics
    - save() and load() methods for persistence
    - Feature importance analysis
    - Model explainability

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from .churn_predictor import ChurnPredictor, EnsembleChurnModel
from .clustering import ClusteringModel, KMeansClusterer, DBSCANClusterer
from .anomaly_detector import AnomalyDetector, IsolationForestDetector
from .time_series import TimeSeriesModel, LSTMForecaster, ARIMAForecaster
from .automl import AutoMLModel, AutoMLOptimizer

__all__ = [
    # Churn Prediction
    "ChurnPredictor",
    "EnsembleChurnModel",
    
    # Clustering
    "ClusteringModel",
    "KMeansClusterer",
    "DBSCANClusterer",
    
    # Anomaly Detection
    "AnomalyDetector",
    "IsolationForestDetector",
    
    # Time Series
    "TimeSeriesModel",
    "LSTMForecaster",
    "ARIMAForecaster",
    
    # AutoML
    "AutoMLModel",
    "AutoMLOptimizer"
]
