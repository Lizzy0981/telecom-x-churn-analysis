# backend/app/ml/explainability/__init__.py
"""
Model Explainability Module
============================

Advanced model interpretation and explanation tools for understanding
machine learning predictions and building trust in AI systems.

This module provides:
    - SHAP (SHapley Additive exPlanations) - Game theory based
    - LIME (Local Interpretable Model-agnostic Explanations)
    - Feature importance analysis
    - Partial dependence plots
    - Individual prediction explanations
    - Global model explanations

Why Explainability Matters:
    - Build trust in AI systems
    - Regulatory compliance (GDPR, Fair Lending)
    - Debug model behavior
    - Identify biases
    - Improve model performance
    - Business insights

Supported Models:
    - Tree-based (Random Forest, XGBoost, LightGBM)
    - Linear models (Logistic Regression)
    - Neural Networks (with approximations)
    - Any scikit-learn compatible model

Use Cases:
    - Explain individual churn predictions
    - Understand feature contributions
    - Identify key drivers
    - Validate model fairness
    - Generate business insights
    - Regulatory reporting

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from .shap_explainer import SHAPExplainer, TreeSHAPExplainer, KernelSHAPExplainer
from .lime_explainer import LIMEExplainer, LIMETabularExplainer
from .feature_importance import (
    FeatureImportanceAnalyzer,
    PermutationImportance,
    get_feature_importance
)

__version__ = "1.0.0"
__author__ = "Elizabeth Díaz Familia"

__all__ = [
    # SHAP
    "SHAPExplainer",
    "TreeSHAPExplainer",
    "KernelSHAPExplainer",
    
    # LIME
    "LIMEExplainer",
    "LIMETabularExplainer",
    
    # Feature Importance
    "FeatureImportanceAnalyzer",
    "PermutationImportance",
    "get_feature_importance"
]
