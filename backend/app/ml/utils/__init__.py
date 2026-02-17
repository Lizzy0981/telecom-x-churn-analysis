# backend/app/ml/utils/__init__.py
"""
ML Utilities Module
===================

Essential utilities for machine learning workflows including feature engineering,
data preprocessing, and comprehensive model evaluation.

This module provides:
    - Feature engineering (creation, selection, transformation)
    - Data preprocessing (cleaning, encoding, scaling)
    - Model evaluation (metrics, visualizations, reports)
    - Pipeline utilities
    - Data quality checks
    - Statistical transformations

Feature Engineering:
    - Automated feature creation
    - Feature selection (filter, wrapper, embedded methods)
    - Polynomial features
    - Interaction features
    - Domain-specific features
    - Feature importance analysis

Data Preprocessing:
    - Missing value imputation
    - Outlier detection and treatment
    - Categorical encoding (one-hot, label, target)
    - Numerical scaling (standard, minmax, robust)
    - Data validation
    - Type conversion

Model Evaluation:
    - Classification metrics (accuracy, precision, recall, F1, ROC-AUC)
    - Regression metrics (MSE, RMSE, MAE, R²)
    - Confusion matrix analysis
    - ROC curves and PR curves
    - Calibration curves
    - Learning curves
    - Comprehensive reports

Use Cases:
    - Data preparation pipelines
    - Feature engineering workflows
    - Model evaluation and comparison
    - Production data validation
    - Automated data cleaning
    - Quality assurance

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from .feature_engineering import (
    FeatureEngineer,
    create_interaction_features,
    create_polynomial_features,
    select_features_by_correlation,
    select_features_by_importance
)
from .preprocessing import (
    DataPreprocessor,
    handle_missing_values,
    encode_categorical_features,
    scale_numerical_features,
    detect_outliers,
    remove_outliers
)
from .model_evaluation import (
    ModelEvaluator,
    calculate_classification_metrics,
    calculate_regression_metrics,
    generate_confusion_matrix,
    generate_classification_report,
    plot_roc_curve,
    plot_learning_curve
)

__version__ = "1.0.0"
__author__ = "Elizabeth Díaz Familia"

__all__ = [
    # Feature Engineering
    "FeatureEngineer",
    "create_interaction_features",
    "create_polynomial_features",
    "select_features_by_correlation",
    "select_features_by_importance",
    
    # Preprocessing
    "DataPreprocessor",
    "handle_missing_values",
    "encode_categorical_features",
    "scale_numerical_features",
    "detect_outliers",
    "remove_outliers",
    
    # Model Evaluation
    "ModelEvaluator",
    "calculate_classification_metrics",
    "calculate_regression_metrics",
    "generate_confusion_matrix",
    "generate_classification_report",
    "plot_roc_curve",
    "plot_learning_curve"
]
