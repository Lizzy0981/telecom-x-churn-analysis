# backend/app/ml/__init__.py
"""
Machine Learning Module
=======================

Advanced machine learning models and utilities for customer churn prediction,
clustering, anomaly detection, time series forecasting, and AutoML.

This module provides:
    - Churn prediction models (Ensemble, Neural Networks)
    - Clustering algorithms (K-Means, DBSCAN, Hierarchical)
    - Anomaly detection (Isolation Forest, One-Class SVM)
    - Time series forecasting (LSTM, ARIMA, Prophet)
    - AutoML capabilities (Automated model selection)
    - Model evaluation and metrics
    - Feature engineering and preprocessing

Submodules:
    - models: Machine learning model implementations
    - preprocessing: Data preprocessing and feature engineering
    - evaluation: Model evaluation and metrics
    - explainability: SHAP, LIME for model interpretation

Supported Frameworks:
    - TensorFlow/Keras for deep learning
    - scikit-learn for classical ML
    - XGBoost for gradient boosting
    - Prophet for time series
    - Auto-sklearn for AutoML

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from .models import (
    ChurnPredictor,
    ClusteringModel,
    AnomalyDetector,
    TimeSeriesModel,
    AutoMLModel
)

__version__ = "1.0.0"
__author__ = "Elizabeth Díaz Familia"

__all__ = [
    "ChurnPredictor",
    "ClusteringModel",
    "AnomalyDetector",
    "TimeSeriesModel",
    "AutoMLModel"
]
