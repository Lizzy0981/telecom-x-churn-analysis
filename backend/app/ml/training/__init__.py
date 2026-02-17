# backend/app/ml/training/__init__.py
"""
Model Training Module
=====================

Comprehensive training pipeline and optimization tools for machine learning models.

This module provides:
    - Complete training pipelines with logging and checkpointing
    - Hyperparameter optimization (Grid Search, Random Search, Bayesian)
    - Cross-validation strategies (K-Fold, Stratified, Time Series)
    - Early stopping and regularization
    - Model checkpointing and versioning
    - Training history tracking
    - Performance monitoring

Training Pipeline Features:
    - Automatic preprocessing
    - Data splitting and validation
    - Class imbalance handling (SMOTE, class weights)
    - Feature scaling
    - Progress tracking
    - Metrics logging
    - Model persistence
    - Reproducibility (random seeds)

Hyperparameter Optimization:
    - Grid Search: Exhaustive search over parameter grid
    - Random Search: Efficient sampling of parameter space
    - Bayesian Optimization: Intelligent parameter search
    - Genetic Algorithms: Evolutionary optimization

Cross-Validation:
    - K-Fold: Standard k-fold cross-validation
    - Stratified K-Fold: Maintains class distribution
    - Time Series Split: Respects temporal ordering
    - Leave-One-Out: Maximum data usage
    - Custom splits: User-defined validation

Use Cases:
    - Model training and optimization
    - Hyperparameter search
    - Model comparison
    - Performance estimation
    - Production model selection
    - A/B testing preparation

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from .trainer import ModelTrainer, TrainingConfig, TrainingHistory
from .hyperparameter_tuning import (
    HyperparameterTuner,
    GridSearchTuner,
    RandomSearchTuner,
    BayesianOptimizer
)
from .cross_validation import (
    CrossValidator,
    StratifiedCrossValidator,
    TimeSeriesCrossValidator,
    cross_validate_model
)

__version__ = "1.0.0"
__author__ = "Elizabeth Díaz Familia"

__all__ = [
    # Training
    "ModelTrainer",
    "TrainingConfig",
    "TrainingHistory",
    
    # Hyperparameter Tuning
    "HyperparameterTuner",
    "GridSearchTuner",
    "RandomSearchTuner",
    "BayesianOptimizer",
    
    # Cross-Validation
    "CrossValidator",
    "StratifiedCrossValidator",
    "TimeSeriesCrossValidator",
    "cross_validate_model"
]
