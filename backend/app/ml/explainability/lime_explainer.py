# backend/app/ml/explainability/lime_explainer.py
"""
LIME Explainer
==============

LIME (Local Interpretable Model-agnostic Explanations) implementation
for explaining individual predictions with interpretable local models.

How LIME Works:
    1. Generate perturbed samples around instance
    2. Get model predictions for perturbed samples
    3. Weight samples by proximity to original
    4. Fit interpretable model (linear) on weighted samples
    5. Extract feature coefficients as explanations

LIME Properties:
    - Model-agnostic: Works with any black-box model
    - Local: Explains individual predictions
    - Interpretable: Uses simple linear models
    - Perturbation-based: Samples around instance

Advantages:
    - Works with any model
    - Easy to understand
    - Visual explanations
    - Text and image support

Limitations:
    - Can be unstable (different perturbations = different explanations)
    - Slower than SHAP for multiple instances
    - Local only (doesn't give global insights)

Use Cases:
    - Explain individual predictions
    - Debug model behavior
    - Generate customer-facing explanations
    - Regulatory compliance
    - Build trust in predictions

References:
    - Ribeiro et al. (2016): "Why Should I Trust You?"
    - https://github.com/marcotcr/lime

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Dict, Any, List, Optional, Tuple, Union, Callable
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge, LinearRegression
from sklearn.preprocessing import StandardScaler
import logging

logger = logging.getLogger(__name__)


class LIMEExplainer:
    """
    Main LIME explainer class for tabular data.
    
    Generates local explanations by fitting interpretable models
    around individual predictions.
    
    Example:
        >>> lime = LIMEExplainer(model, training_data)
        >>> explanation = lime.explain_instance(test_instance)
        >>> print(explanation['feature_weights'])
    """
    
    def __init__(
        self,
        model: Any,
        training_data: Union[pd.DataFrame, np.ndarray],
        feature_names: Optional[List[str]] = None,
        categorical_features: Optional[List[int]] = None,
        kernel_width: float = 0.75
    ):
        """
        Initialize LIME Explainer.
        
        Args:
            model: Trained model to explain
            training_data: Training data for statistics
            feature_names: Names of features
            categorical_features: Indices of categorical features
            kernel_width: Width of exponential kernel
        """
        self.model = model
        self.training_data = training_data
        self.feature_names = feature_names
        self.categorical_features = categorical_features or []
        self.kernel_width = kernel_width
        
        # Convert to numpy
        if isinstance(training_data, pd.DataFrame):
            if feature_names is None:
                self.feature_names = list(training_data.columns)
            self.training_data = training_data.values
        
        # Calculate feature statistics
        self.feature_mean = np.mean(self.training_data, axis=0)
        self.feature_std = np.std(self.training_data, axis=0)
        
        # Scaler for distance calculation
        self.scaler = StandardScaler()
        self.scaler.fit(self.training_data)
        
        logger.info("🍋 LIME Explainer initialized")
        logger.info(f"   Features: {len(self.feature_names) if self.feature_names else self.training_data.shape[1]}")
        logger.info(f"   Kernel width: {kernel_width}")
    
    def explain_instance(
        self,
        instance: Union[pd.Series, np.ndarray],
        num_features: int = 10,
        num_samples: int = 5000
    ) -> Dict[str, Any]:
        """
        Explain a single instance using LIME.
        
        Args:
            instance: Instance to explain
            num_features: Number of top features to return
            num_samples: Number of perturbed samples
            
        Returns:
            Dict containing explanation
            
        Example:
            >>> explanation = lime.explain_instance(X_test[0], num_features=5)
            >>> for feature, weight in explanation['feature_weights']:
            ...     print(f"{feature}: {weight:.4f}")
        """
        logger.info(f"🔍 Explaining instance with {num_samples} samples...")
        
        # Convert to numpy
        if isinstance(instance, pd.Series):
            instance = instance.values
        if instance.ndim == 1:
            instance = instance.reshape(1, -1)
        
        # Generate perturbed samples
        perturbed_data = self._generate_perturbations(instance[0], num_samples)
        
        # Get model predictions for perturbed samples
        if hasattr(self.model, 'predict_proba'):
            predictions = self.model.predict_proba(perturbed_data)[:, 1]
        else:
            predictions = self.model.predict(perturbed_data)
        
        # Calculate distances and weights
        distances = self._calculate_distances(instance, perturbed_data)
        weights = self._kernel_function(distances)
        
        # Fit interpretable model
        linear_model = Ridge(alpha=1.0)
        linear_model.fit(perturbed_data, predictions, sample_weight=weights)
        
        # Get feature coefficients
        coefficients = linear_model.coef_
        intercept = linear_model.intercept_
        
        # Get feature names
        feature_names = self.feature_names or [f"Feature_{i}" for i in range(len(coefficients))]
        
        # Create feature weights
        feature_weights = [
            (name, float(coef))
            for name, coef in zip(feature_names, coefficients)
        ]
        
        # Sort by absolute weight
        feature_weights.sort(key=lambda x: abs(x[1]), reverse=True)
        
        # Get prediction
        if hasattr(self.model, 'predict_proba'):
            prediction = float(self.model.predict_proba(instance)[0, 1])
        else:
            prediction = float(self.model.predict(instance)[0])
        
        # Local model prediction
        local_prediction = float(linear_model.predict(instance)[0])
        
        # Build explanation
        explanation = {
            'prediction': prediction,
            'local_prediction': local_prediction,
            'intercept': float(intercept),
            'feature_weights': feature_weights[:num_features],
            'all_weights': feature_weights,
            'score': float(linear_model.score(perturbed_data, predictions, sample_weight=weights))
        }
        
        logger.info(f"✅ Explanation generated (R² = {explanation['score']:.4f})")
        
        return explanation
    
    def _generate_perturbations(
        self,
        instance: np.ndarray,
        num_samples: int
    ) -> np.ndarray:
        """
        Generate perturbed samples around instance.
        
        Args:
            instance: Original instance
            num_samples: Number of samples to generate
            
        Returns:
            np.ndarray: Perturbed samples
        """
        n_features = len(instance)
        perturbed = np.zeros((num_samples, n_features))
        
        for i in range(n_features):
            if i in self.categorical_features:
                # For categorical: randomly sample from training data
                perturbed[:, i] = np.random.choice(
                    self.training_data[:, i],
                    size=num_samples
                )
            else:
                # For numerical: sample from normal distribution
                perturbed[:, i] = np.random.normal(
                    loc=self.feature_mean[i],
                    scale=self.feature_std[i],
                    size=num_samples
                )
        
        # Include original instance
        perturbed[0] = instance
        
        return perturbed
    
    def _calculate_distances(
        self,
        instance: np.ndarray,
        perturbed_data: np.ndarray
    ) -> np.ndarray:
        """
        Calculate distances from instance to perturbed samples.
        
        Args:
            instance: Original instance
            perturbed_data: Perturbed samples
            
        Returns:
            np.ndarray: Distances
        """
        # Scale data
        instance_scaled = self.scaler.transform(instance)
        perturbed_scaled = self.scaler.transform(perturbed_data)
        
        # Euclidean distance
        distances = np.sqrt(np.sum((perturbed_scaled - instance_scaled) ** 2, axis=1))
        
        return distances
    
    def _kernel_function(self, distances: np.ndarray) -> np.ndarray:
        """
        Calculate kernel weights based on distances.
        
        Exponential kernel: exp(-(distance^2) / kernel_width^2)
        
        Args:
            distances: Distances from original instance
            
        Returns:
            np.ndarray: Sample weights
        """
        return np.exp(-(distances ** 2) / (self.kernel_width ** 2))
    
    def generate_explanation_text(
        self,
        instance: Union[pd.Series, np.ndarray],
        num_features: int = 5
    ) -> str:
        """
        Generate human-readable explanation.
        
        Args:
            instance: Instance to explain
            num_features: Number of features to include
            
        Returns:
            str: Natural language explanation
        """
        explanation = self.explain_instance(instance, num_features=num_features)
        
        prediction = explanation['prediction']
        
        # Determine churn prediction
        if prediction >= 0.5:
            pred_text = f"WILL CHURN (probability: {prediction:.1%})"
        else:
            pred_text = f"will NOT churn (probability: {prediction:.1%})"
        
        text = f"LIME Explanation:\n"
        text += f"Prediction: Customer {pred_text}\n\n"
        text += f"Local Model Accuracy: R² = {explanation['score']:.3f}\n\n"
        text += "Top Contributing Features:\n"
        
        for i, (feature, weight) in enumerate(explanation['feature_weights'], 1):
            direction = "increases" if weight > 0 else "decreases"
            text += f"{i}. {feature}: {direction} churn probability "
            text += f"(weight: {weight:+.4f})\n"
        
        return text
    
    def compare_instances(
        self,
        instance1: Union[pd.Series, np.ndarray],
        instance2: Union[pd.Series, np.ndarray],
        num_features: int = 5
    ) -> Dict[str, Any]:
        """
        Compare LIME explanations of two instances.
        
        Args:
            instance1: First instance
            instance2: Second instance
            num_features: Number of features to compare
            
        Returns:
            Dict containing comparison
        """
        exp1 = self.explain_instance(instance1, num_features=num_features)
        exp2 = self.explain_instance(instance2, num_features=num_features)
        
        comparison = {
            'instance1_prediction': exp1['prediction'],
            'instance2_prediction': exp2['prediction'],
            'prediction_diff': exp1['prediction'] - exp2['prediction'],
            'instance1_top_features': exp1['feature_weights'],
            'instance2_top_features': exp2['feature_weights'],
            'weight_differences': {}
        }
        
        # Calculate weight differences
        weights1 = dict(exp1['all_weights'])
        weights2 = dict(exp2['all_weights'])
        
        for feature in weights1.keys():
            comparison['weight_differences'][feature] = {
                'instance1_weight': weights1[feature],
                'instance2_weight': weights2.get(feature, 0.0),
                'difference': weights1[feature] - weights2.get(feature, 0.0)
            }
        
        return comparison


class LIMETabularExplainer(LIMEExplainer):
    """
    Specialized LIME explainer for tabular data with additional features.
    
    Adds support for:
    - Discretization of continuous features
    - Quartile-based explanations
    - Feature value ranges
    """
    
    def __init__(
        self,
        model: Any,
        training_data: Union[pd.DataFrame, np.ndarray],
        feature_names: Optional[List[str]] = None,
        categorical_features: Optional[List[int]] = None,
        discretize_continuous: bool = True
    ):
        """
        Initialize LIME Tabular Explainer.
        
        Args:
            model: Trained model
            training_data: Training data
            feature_names: Feature names
            categorical_features: Categorical feature indices
            discretize_continuous: Whether to discretize continuous features
        """
        super().__init__(
            model=model,
            training_data=training_data,
            feature_names=feature_names,
            categorical_features=categorical_features
        )
        
        self.discretize_continuous = discretize_continuous
        
        # Calculate quartiles for discretization
        if discretize_continuous:
            self.quartiles = self._calculate_quartiles()
        
        logger.info("   Tabular LIME: Enhanced for structured data")
    
    def _calculate_quartiles(self) -> Dict[int, np.ndarray]:
        """Calculate quartiles for each continuous feature"""
        quartiles = {}
        
        for i in range(self.training_data.shape[1]):
            if i not in self.categorical_features:
                quartiles[i] = np.percentile(
                    self.training_data[:, i],
                    [0, 25, 50, 75, 100]
                )
        
        return quartiles
    
    def explain_with_values(
        self,
        instance: Union[pd.Series, np.ndarray],
        num_features: int = 10
    ) -> Dict[str, Any]:
        """
        Explain instance with actual feature values and ranges.
        
        Returns explanation with quartile information.
        """
        # Get basic explanation
        explanation = self.explain_instance(instance, num_features=num_features)
        
        # Convert instance
        if isinstance(instance, pd.Series):
            instance = instance.values
        
        # Add feature values and quartile info
        feature_names = self.feature_names or [f"Feature_{i}" for i in range(len(instance))]
        
        value_info = []
        for i, (feature, weight) in enumerate(explanation['feature_weights']):
            idx = feature_names.index(feature)
            value = float(instance[idx])
            
            info = {
                'feature': feature,
                'weight': weight,
                'value': value
            }
            
            # Add quartile information for continuous features
            if idx in self.quartiles:
                q = self.quartiles[idx]
                if value <= q[1]:
                    info['quartile'] = 'Q1 (bottom 25%)'
                elif value <= q[2]:
                    info['quartile'] = 'Q2 (25-50%)'
                elif value <= q[3]:
                    info['quartile'] = 'Q3 (50-75%)'
                else:
                    info['quartile'] = 'Q4 (top 25%)'
                
                info['range'] = f"[{q[0]:.2f}, {q[4]:.2f}]"
            
            value_info.append(info)
        
        explanation['feature_value_info'] = value_info
        
        return explanation


# ==================== UTILITY FUNCTIONS ====================

def batch_explain(
    explainer: LIMEExplainer,
    instances: Union[pd.DataFrame, np.ndarray],
    num_features: int = 10,
    num_samples: int = 5000
) -> List[Dict[str, Any]]:
    """
    Explain multiple instances with LIME.
    
    Args:
        explainer: LIME explainer instance
        instances: Multiple instances to explain
        num_features: Number of features per explanation
        num_samples: Samples per explanation
        
    Returns:
        List of explanations
    """
    logger.info(f"Generating LIME explanations for {len(instances)} instances...")
    
    explanations = []
    
    for i, instance in enumerate(instances):
        if i % 10 == 0:
            logger.info(f"   Progress: {i}/{len(instances)}")
        
        exp = explainer.explain_instance(
            instance,
            num_features=num_features,
            num_samples=num_samples
        )
        explanations.append(exp)
    
    logger.info("✅ Batch explanations complete!")
    
    return explanations


def extract_common_features(
    explanations: List[Dict[str, Any]],
    top_n: int = 5
) -> Dict[str, float]:
    """
    Extract most common important features across explanations.
    
    Args:
        explanations: List of LIME explanations
        top_n: Number of top features to extract
        
    Returns:
        Dict of common features and average weights
    """
    feature_weights = {}
    feature_counts = {}
    
    # Aggregate weights
    for exp in explanations:
        for feature, weight in exp['feature_weights'][:top_n]:
            if feature not in feature_weights:
                feature_weights[feature] = 0.0
                feature_counts[feature] = 0
            
            feature_weights[feature] += abs(weight)
            feature_counts[feature] += 1
    
    # Calculate averages
    common_features = {
        feature: feature_weights[feature] / feature_counts[feature]
        for feature in feature_weights.keys()
    }
    
    # Sort by average weight
    common_features = dict(
        sorted(common_features.items(), key=lambda x: x[1], reverse=True)
    )
    
    return common_features
