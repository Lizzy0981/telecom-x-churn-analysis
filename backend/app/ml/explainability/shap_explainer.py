# backend/app/ml/explainability/shap_explainer.py
"""
SHAP Explainer
==============

SHAP (SHapley Additive exPlanations) implementation for model interpretability.
Based on game theory to provide consistent and accurate feature attributions.

SHAP Values Properties:
    - Consistency: Matches feature importance
    - Local accuracy: Sums to prediction
    - Missingness: Zero impact = zero SHAP
    - Additivity: Individual contributions sum

SHAP Variants:
    - TreeSHAP: Fast for tree-based models (RF, XGBoost, LightGBM)
    - KernelSHAP: Model-agnostic (works with any model)
    - DeepSHAP: Optimized for neural networks
    - LinearSHAP: For linear models

Use Cases:
    - Explain individual predictions
    - Identify key features
    - Compare feature impacts
    - Generate customer insights
    - Regulatory compliance
    - Model debugging

References:
    - Lundberg & Lee (2017): "A Unified Approach to Interpreting Model Predictions"
    - https://github.com/slundberg/shap

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Dict, Any, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class SHAPExplainer:
    """
    Main SHAP explainer class with automatic backend selection.
    
    Automatically selects the best SHAP variant based on model type:
    - TreeSHAP for tree-based models
    - KernelSHAP for other models
    
    Example:
        >>> explainer = SHAPExplainer(model, X_train)
        >>> shap_values = explainer.explain(X_test)
        >>> explainer.plot_summary()
    """
    
    def __init__(
        self,
        model: Any,
        background_data: Union[pd.DataFrame, np.ndarray],
        feature_names: Optional[List[str]] = None,
        model_type: Optional[str] = None  # tree, linear, kernel
    ):
        """
        Initialize SHAP Explainer.
        
        Args:
            model: Trained model to explain
            background_data: Representative sample of training data
            feature_names: Names of features
            model_type: Force specific SHAP variant (None for auto)
        """
        self.model = model
        self.background_data = background_data
        self.feature_names = feature_names
        
        # Convert to numpy if needed
        if isinstance(background_data, pd.DataFrame):
            if feature_names is None:
                self.feature_names = list(background_data.columns)
            self.background_data = background_data.values
        
        # Auto-detect model type if not specified
        if model_type is None:
            model_type = self._detect_model_type(model)
        
        self.model_type = model_type
        
        # Initialize appropriate explainer
        self.explainer = None
        self._initialize_explainer()
        
        # Storage for computed values
        self.shap_values_cache: Optional[np.ndarray] = None
        self.base_value: Optional[float] = None
        
        logger.info(f"🎯 SHAP Explainer initialized: {model_type}")
        logger.info(f"   Background samples: {len(self.background_data)}")
    
    def _detect_model_type(self, model: Any) -> str:
        """Auto-detect model type for SHAP variant selection"""
        
        # Check for tree-based models
        if isinstance(model, (RandomForestClassifier, GradientBoostingClassifier)):
            return 'tree'
        
        # Check for XGBoost/LightGBM (by class name to avoid import dependency)
        model_name = type(model).__name__
        if 'XGB' in model_name or 'LGB' in model_name:
            return 'tree'
        
        # Check for linear models
        if 'Linear' in model_name or 'Logistic' in model_name:
            return 'linear'
        
        # Default to kernel (model-agnostic)
        return 'kernel'
    
    def _initialize_explainer(self):
        """Initialize the appropriate SHAP explainer"""
        
        if self.model_type == 'tree':
            logger.info("   Using TreeSHAP (optimized for tree models)")
            # In production: import shap; self.explainer = shap.TreeExplainer(self.model)
            self.explainer = "TreeSHAP"  # Mock for now
        
        elif self.model_type == 'linear':
            logger.info("   Using LinearSHAP (optimized for linear models)")
            # In production: import shap; self.explainer = shap.LinearExplainer(self.model, self.background_data)
            self.explainer = "LinearSHAP"  # Mock
        
        else:  # kernel
            logger.info("   Using KernelSHAP (model-agnostic)")
            # In production: import shap; self.explainer = shap.KernelExplainer(self.model.predict_proba, self.background_data)
            self.explainer = "KernelSHAP"  # Mock
    
    def explain(
        self,
        X: Union[pd.DataFrame, np.ndarray],
        check_additivity: bool = False
    ) -> np.ndarray:
        """
        Calculate SHAP values for given instances.
        
        Args:
            X: Instances to explain
            check_additivity: Verify SHAP values sum to prediction
            
        Returns:
            np.ndarray: SHAP values (shape: [n_samples, n_features])
            
        Example:
            >>> shap_values = explainer.explain(X_test[:10])
            >>> print(shap_values.shape)  # (10, n_features)
        """
        logger.info(f"📊 Calculating SHAP values for {len(X)} instances...")
        
        # Convert to numpy
        if isinstance(X, pd.DataFrame):
            X = X.values
        
        # In production: shap_values = self.explainer.shap_values(X)
        # For now, generate mock SHAP values
        shap_values = self._generate_mock_shap_values(X)
        
        # Calculate base value (average prediction)
        if self.base_value is None:
            # In production: self.base_value = self.explainer.expected_value
            self.base_value = 0.3  # Mock
        
        # Verify additivity if requested
        if check_additivity:
            self._verify_additivity(X, shap_values)
        
        self.shap_values_cache = shap_values
        
        logger.info("✅ SHAP values calculated!")
        
        return shap_values
    
    def _generate_mock_shap_values(self, X: np.ndarray) -> np.ndarray:
        """
        Generate mock SHAP values for demonstration.
        
        In production, this is replaced by actual SHAP computation.
        """
        n_samples, n_features = X.shape
        
        # Generate realistic SHAP values
        # Higher values for important features, lower for others
        shap_values = np.random.randn(n_samples, n_features) * 0.1
        
        # Make some features more important
        if n_features > 0:
            shap_values[:, 0] *= 3.0  # First feature very important
        if n_features > 1:
            shap_values[:, 1] *= 2.0  # Second feature important
        if n_features > 2:
            shap_values[:, 2] *= 1.5  # Third feature moderately important
        
        return shap_values
    
    def _verify_additivity(self, X: np.ndarray, shap_values: np.ndarray):
        """
        Verify that SHAP values sum to prediction difference.
        
        SHAP property: base_value + sum(shap_values) = prediction
        """
        logger.info("   Verifying additivity property...")
        
        # Get model predictions
        if hasattr(self.model, 'predict_proba'):
            predictions = self.model.predict_proba(X)[:, 1]
        else:
            predictions = self.model.predict(X)
        
        # Calculate reconstructed predictions
        reconstructed = self.base_value + shap_values.sum(axis=1)
        
        # Check difference
        max_error = np.max(np.abs(predictions - reconstructed))
        
        if max_error > 0.01:
            logger.warning(f"   Additivity check: max error = {max_error:.6f}")
        else:
            logger.info(f"   ✅ Additivity verified (max error: {max_error:.6f})")
    
    def explain_instance(
        self,
        instance: Union[pd.Series, np.ndarray],
        top_n: int = 10
    ) -> Dict[str, Any]:
        """
        Explain a single instance with detailed breakdown.
        
        Args:
            instance: Single instance to explain
            top_n: Number of top features to return
            
        Returns:
            Dict containing explanation details
            
        Example:
            >>> explanation = explainer.explain_instance(X_test[0])
            >>> print(explanation['prediction'])
            >>> print(explanation['top_features'])
        """
        # Convert to 2D array
        if isinstance(instance, pd.Series):
            instance = instance.values
        if instance.ndim == 1:
            instance = instance.reshape(1, -1)
        
        # Calculate SHAP values
        shap_vals = self.explain(instance)[0]
        
        # Get prediction
        if hasattr(self.model, 'predict_proba'):
            prediction = float(self.model.predict_proba(instance)[0, 1])
        else:
            prediction = float(self.model.predict(instance)[0])
        
        # Get feature names
        feature_names = self.feature_names or [f"Feature_{i}" for i in range(len(shap_vals))]
        
        # Create feature contributions
        contributions = [
            {
                'feature': name,
                'value': float(instance[0, i]),
                'shap_value': float(shap_vals[i]),
                'abs_shap': abs(float(shap_vals[i]))
            }
            for i, name in enumerate(feature_names)
        ]
        
        # Sort by absolute SHAP value
        contributions.sort(key=lambda x: x['abs_shap'], reverse=True)
        
        # Build explanation
        explanation = {
            'prediction': prediction,
            'base_value': self.base_value,
            'shap_sum': float(shap_vals.sum()),
            'top_features': contributions[:top_n],
            'all_contributions': contributions
        }
        
        return explanation
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Get global feature importance based on mean absolute SHAP values.
        
        Returns:
            Dict mapping feature names to importance scores
            
        Example:
            >>> importance = explainer.get_feature_importance()
            >>> for feature, score in importance.items():
            ...     print(f"{feature}: {score:.4f}")
        """
        if self.shap_values_cache is None:
            raise ValueError("No SHAP values computed. Call explain() first.")
        
        # Calculate mean absolute SHAP value per feature
        mean_abs_shap = np.abs(self.shap_values_cache).mean(axis=0)
        
        # Get feature names
        feature_names = self.feature_names or [f"Feature_{i}" for i in range(len(mean_abs_shap))]
        
        # Create importance dictionary
        importance = {
            name: float(score)
            for name, score in zip(feature_names, mean_abs_shap)
        }
        
        # Sort by importance
        importance = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))
        
        return importance
    
    def get_summary_stats(self) -> Dict[str, Any]:
        """
        Get summary statistics of SHAP values.
        
        Returns:
            Dict containing summary statistics
        """
        if self.shap_values_cache is None:
            raise ValueError("No SHAP values computed. Call explain() first.")
        
        feature_names = self.feature_names or [f"Feature_{i}" for i in range(self.shap_values_cache.shape[1])]
        
        summary = {
            'base_value': self.base_value,
            'n_samples': len(self.shap_values_cache),
            'n_features': self.shap_values_cache.shape[1],
            'feature_stats': {}
        }
        
        # Calculate stats per feature
        for i, name in enumerate(feature_names):
            vals = self.shap_values_cache[:, i]
            
            summary['feature_stats'][name] = {
                'mean_shap': float(np.mean(vals)),
                'mean_abs_shap': float(np.mean(np.abs(vals))),
                'std_shap': float(np.std(vals)),
                'min_shap': float(np.min(vals)),
                'max_shap': float(np.max(vals))
            }
        
        return summary
    
    def generate_explanation_text(
        self,
        instance: Union[pd.Series, np.ndarray],
        prediction_threshold: float = 0.5
    ) -> str:
        """
        Generate human-readable explanation text.
        
        Args:
            instance: Instance to explain
            prediction_threshold: Threshold for churn classification
            
        Returns:
            str: Natural language explanation
            
        Example:
            >>> text = explainer.generate_explanation_text(X_test[0])
            >>> print(text)
        """
        explanation = self.explain_instance(instance, top_n=3)
        
        prediction = explanation['prediction']
        top_features = explanation['top_features']
        
        # Determine prediction
        if prediction >= prediction_threshold:
            pred_text = f"WILL CHURN (probability: {prediction:.1%})"
        else:
            pred_text = f"will NOT churn (probability: {prediction:.1%})"
        
        # Build explanation
        text = f"Prediction: Customer {pred_text}\n\n"
        text += "Key factors:\n"
        
        for i, contrib in enumerate(top_features, 1):
            direction = "increases" if contrib['shap_value'] > 0 else "decreases"
            text += f"{i}. {contrib['feature']} = {contrib['value']:.2f} "
            text += f"({direction} churn risk by {abs(contrib['shap_value']):.3f})\n"
        
        return text


class TreeSHAPExplainer(SHAPExplainer):
    """
    Specialized SHAP explainer for tree-based models.
    
    Optimized for Random Forest, Gradient Boosting, XGBoost, LightGBM.
    Much faster than KernelSHAP for tree models.
    """
    
    def __init__(
        self,
        model: Any,
        background_data: Union[pd.DataFrame, np.ndarray],
        feature_names: Optional[List[str]] = None
    ):
        """Initialize TreeSHAP explainer"""
        super().__init__(
            model=model,
            background_data=background_data,
            feature_names=feature_names,
            model_type='tree'
        )
        
        logger.info("   TreeSHAP: Fast explanations for tree models")


class KernelSHAPExplainer(SHAPExplainer):
    """
    Kernel SHAP explainer - model-agnostic approach.
    
    Works with any model but slower than TreeSHAP.
    Uses weighted linear regression with coalitions.
    """
    
    def __init__(
        self,
        model: Any,
        background_data: Union[pd.DataFrame, np.ndarray],
        feature_names: Optional[List[str]] = None,
        n_samples: int = 100
    ):
        """
        Initialize KernelSHAP explainer.
        
        Args:
            model: Any model with predict or predict_proba
            background_data: Background dataset
            feature_names: Feature names
            n_samples: Number of samples for kernel approximation
        """
        super().__init__(
            model=model,
            background_data=background_data,
            feature_names=feature_names,
            model_type='kernel'
        )
        
        self.n_samples = n_samples
        
        logger.info(f"   KernelSHAP: Model-agnostic ({n_samples} samples)")


# ==================== UTILITY FUNCTIONS ====================

def calculate_shap_interaction_values(
    explainer: SHAPExplainer,
    X: Union[pd.DataFrame, np.ndarray]
) -> np.ndarray:
    """
    Calculate SHAP interaction values (pairwise feature interactions).
    
    Args:
        explainer: SHAP explainer instance
        X: Data to explain
        
    Returns:
        np.ndarray: Interaction values (shape: [n_samples, n_features, n_features])
    """
    logger.info("Calculating SHAP interaction values...")
    
    # In production: interaction_values = explainer.explainer.shap_interaction_values(X)
    # Mock for now
    n_samples = len(X) if isinstance(X, np.ndarray) else len(X)
    n_features = explainer.shap_values_cache.shape[1] if explainer.shap_values_cache is not None else 10
    
    interaction_values = np.random.randn(n_samples, n_features, n_features) * 0.05
    
    return interaction_values


def compare_predictions(
    explainer: SHAPExplainer,
    instance1: np.ndarray,
    instance2: np.ndarray
) -> Dict[str, Any]:
    """
    Compare SHAP explanations between two instances.
    
    Args:
        explainer: SHAP explainer
        instance1: First instance
        instance2: Second instance
        
    Returns:
        Dict containing comparison
    """
    exp1 = explainer.explain_instance(instance1)
    exp2 = explainer.explain_instance(instance2)
    
    comparison = {
        'prediction_diff': exp1['prediction'] - exp2['prediction'],
        'instance1': exp1,
        'instance2': exp2,
        'feature_diffs': {}
    }
    
    # Calculate feature differences
    for contrib1, contrib2 in zip(exp1['all_contributions'], exp2['all_contributions']):
        feature = contrib1['feature']
        comparison['feature_diffs'][feature] = {
            'value_diff': contrib1['value'] - contrib2['value'],
            'shap_diff': contrib1['shap_value'] - contrib2['shap_value']
        }
    
    return comparison
