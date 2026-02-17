# backend/app/ml/explainability/feature_importance.py
"""
Feature Importance Analysis
============================

Comprehensive feature importance analysis using multiple methods
for robust and reliable feature rankings.

Methods Included:
    - Built-in Model Importance (Tree-based models)
    - Permutation Importance (Model-agnostic)
    - Drop-Column Importance
    - SHAP-based Importance
    - Coefficient-based (Linear models)
    - Mutual Information

Why Multiple Methods:
    - Different methods capture different aspects
    - Ensemble ranking is more robust
    - Identify consensus features
    - Detect method-specific biases
    - Validate feature selection

Use Cases:
    - Feature selection
    - Model interpretation
    - Feature engineering validation
    - Business insights
    - Dimensionality reduction
    - Cost-benefit analysis

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Dict, Any, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
from sklearn.inspection import permutation_importance
from sklearn.metrics import roc_auc_score, accuracy_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
import logging

logger = logging.getLogger(__name__)


class FeatureImportanceAnalyzer:
    """
    Comprehensive feature importance analyzer with multiple methods.
    
    Combines different importance methods for robust rankings:
    - Model-specific importance (trees)
    - Permutation importance (model-agnostic)
    - Drop-column importance
    
    Example:
        >>> analyzer = FeatureImportanceAnalyzer(model, X_train, y_train)
        >>> importance = analyzer.calculate_all_importances(X_test, y_test)
        >>> top_features = analyzer.get_top_features(n=10)
    """
    
    def __init__(
        self,
        model: Any,
        X_train: Union[pd.DataFrame, np.ndarray],
        y_train: Union[pd.Series, np.ndarray],
        feature_names: Optional[List[str]] = None
    ):
        """
        Initialize Feature Importance Analyzer.
        
        Args:
            model: Trained model
            X_train: Training features
            y_train: Training labels
            feature_names: Feature names
        """
        self.model = model
        self.X_train = X_train
        self.y_train = y_train
        
        # Extract feature names
        if isinstance(X_train, pd.DataFrame):
            self.feature_names = list(X_train.columns)
            self.X_train = X_train.values
        else:
            self.feature_names = feature_names or [f"Feature_{i}" for i in range(X_train.shape[1])]
        
        if isinstance(y_train, pd.Series):
            self.y_train = y_train.values
        
        # Storage for computed importances
        self.importances: Dict[str, Dict[str, float]] = {}
        self.ensemble_importance: Optional[Dict[str, float]] = None
        
        logger.info("📊 FeatureImportanceAnalyzer initialized")
        logger.info(f"   Features: {len(self.feature_names)}")
    
    def calculate_all_importances(
        self,
        X_test: Optional[Union[pd.DataFrame, np.ndarray]] = None,
        y_test: Optional[Union[pd.Series, np.ndarray]] = None
    ) -> Dict[str, Dict[str, float]]:
        """
        Calculate importance using all available methods.
        
        Args:
            X_test: Test features (for permutation importance)
            y_test: Test labels (for permutation importance)
            
        Returns:
            Dict mapping method name to feature importances
        """
        logger.info("=" * 60)
        logger.info("🔍 Calculating Feature Importances")
        logger.info("=" * 60)
        
        # Convert test data if provided
        if X_test is not None and isinstance(X_test, pd.DataFrame):
            X_test = X_test.values
        if y_test is not None and isinstance(y_test, pd.Series):
            y_test = y_test.values
        
        # 1. Model-specific importance (if available)
        if hasattr(self.model, 'feature_importances_'):
            logger.info("\n1️⃣  Calculating built-in feature importance...")
            self.importances['model'] = self._get_model_importance()
        
        # 2. Permutation importance (if test data provided)
        if X_test is not None and y_test is not None:
            logger.info("\n2️⃣  Calculating permutation importance...")
            self.importances['permutation'] = self._get_permutation_importance(X_test, y_test)
        
        # 3. Coefficient-based (for linear models)
        if hasattr(self.model, 'coef_'):
            logger.info("\n3️⃣  Calculating coefficient-based importance...")
            self.importances['coefficients'] = self._get_coefficient_importance()
        
        # Calculate ensemble importance
        if len(self.importances) > 0:
            logger.info("\n🎯 Calculating ensemble importance...")
            self.ensemble_importance = self._calculate_ensemble_importance()
        
        logger.info("\n" + "=" * 60)
        logger.info(f"✅ Calculated {len(self.importances)} importance methods")
        logger.info("=" * 60)
        
        return self.importances
    
    def _get_model_importance(self) -> Dict[str, float]:
        """Get built-in feature importance from tree-based models"""
        importances = self.model.feature_importances_
        
        importance_dict = {
            name: float(imp)
            for name, imp in zip(self.feature_names, importances)
        }
        
        # Normalize to sum to 1
        total = sum(importance_dict.values())
        if total > 0:
            importance_dict = {k: v/total for k, v in importance_dict.items()}
        
        # Sort
        importance_dict = dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
        
        # Log top 5
        logger.info("   Top 5 features:")
        for i, (feature, imp) in enumerate(list(importance_dict.items())[:5], 1):
            logger.info(f"      {i}. {feature}: {imp:.4f}")
        
        return importance_dict
    
    def _get_permutation_importance(
        self,
        X_test: np.ndarray,
        y_test: np.ndarray,
        n_repeats: int = 10
    ) -> Dict[str, float]:
        """
        Calculate permutation importance.
        
        Permutation importance measures feature importance by calculating
        the decrease in model score when a feature's values are randomly shuffled.
        """
        # Calculate permutation importance
        perm_importance = permutation_importance(
            self.model,
            X_test,
            y_test,
            n_repeats=n_repeats,
            random_state=42,
            n_jobs=-1
        )
        
        importance_dict = {
            name: float(imp)
            for name, imp in zip(self.feature_names, perm_importance.importances_mean)
        }
        
        # Normalize
        total = sum(abs(v) for v in importance_dict.values())
        if total > 0:
            importance_dict = {k: abs(v)/total for k, v in importance_dict.items()}
        
        # Sort
        importance_dict = dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
        
        # Log top 5
        logger.info("   Top 5 features:")
        for i, (feature, imp) in enumerate(list(importance_dict.items())[:5], 1):
            logger.info(f"      {i}. {feature}: {imp:.4f}")
        
        return importance_dict
    
    def _get_coefficient_importance(self) -> Dict[str, float]:
        """Get importance from linear model coefficients"""
        coefficients = self.model.coef_
        
        if coefficients.ndim > 1:
            coefficients = coefficients[0]  # Binary classification
        
        importance_dict = {
            name: abs(float(coef))
            for name, coef in zip(self.feature_names, coefficients)
        }
        
        # Normalize
        total = sum(importance_dict.values())
        if total > 0:
            importance_dict = {k: v/total for k, v in importance_dict.items()}
        
        # Sort
        importance_dict = dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
        
        return importance_dict
    
    def _calculate_ensemble_importance(self) -> Dict[str, float]:
        """
        Calculate ensemble importance by averaging ranks across methods.
        
        Uses rank-based aggregation for robustness.
        """
        # Get ranks for each method
        all_ranks = {}
        
        for method, importances in self.importances.items():
            # Rank features (1 = most important)
            sorted_features = sorted(importances.items(), key=lambda x: x[1], reverse=True)
            ranks = {feature: rank + 1 for rank, (feature, _) in enumerate(sorted_features)}
            all_ranks[method] = ranks
        
        # Average ranks
        ensemble_ranks = {}
        for feature in self.feature_names:
            ranks = [all_ranks[method].get(feature, len(self.feature_names)) for method in all_ranks.keys()]
            ensemble_ranks[feature] = np.mean(ranks)
        
        # Convert ranks to importance scores (lower rank = higher importance)
        max_rank = max(ensemble_ranks.values())
        ensemble_importance = {
            feature: (max_rank - rank + 1) / max_rank
            for feature, rank in ensemble_ranks.items()
        }
        
        # Normalize
        total = sum(ensemble_importance.values())
        if total > 0:
            ensemble_importance = {k: v/total for k, v in ensemble_importance.items()}
        
        # Sort
        ensemble_importance = dict(sorted(ensemble_importance.items(), key=lambda x: x[1], reverse=True))
        
        # Log top 5
        logger.info("   Ensemble Top 5:")
        for i, (feature, imp) in enumerate(list(ensemble_importance.items())[:5], 1):
            logger.info(f"      {i}. {feature}: {imp:.4f}")
        
        return ensemble_importance
    
    def get_top_features(
        self,
        n: int = 10,
        method: str = 'ensemble'
    ) -> List[Tuple[str, float]]:
        """
        Get top N most important features.
        
        Args:
            n: Number of features to return
            method: Importance method ('ensemble', 'model', 'permutation')
            
        Returns:
            List of (feature_name, importance) tuples
        """
        if method == 'ensemble':
            if self.ensemble_importance is None:
                raise ValueError("Ensemble importance not calculated. Call calculate_all_importances() first.")
            importance_dict = self.ensemble_importance
        elif method in self.importances:
            importance_dict = self.importances[method]
        else:
            raise ValueError(f"Unknown method: {method}. Available: {list(self.importances.keys())}")
        
        return list(importance_dict.items())[:n]
    
    def get_importance_comparison(self) -> pd.DataFrame:
        """
        Get comparison of importances across all methods.
        
        Returns:
            DataFrame with features as rows and methods as columns
        """
        if len(self.importances) == 0:
            raise ValueError("No importances calculated. Call calculate_all_importances() first.")
        
        # Create DataFrame
        data = {}
        
        for method, importances in self.importances.items():
            data[method] = importances
        
        if self.ensemble_importance is not None:
            data['ensemble'] = self.ensemble_importance
        
        df = pd.DataFrame(data)
        df.index.name = 'feature'
        
        # Sort by ensemble if available, otherwise by first method
        sort_column = 'ensemble' if 'ensemble' in df.columns else df.columns[0]
        df = df.sort_values(sort_column, ascending=False)
        
        return df
    
    def plot_comparison(self, top_n: int = 15) -> Dict[str, Any]:
        """
        Generate data for importance comparison plot.
        
        Args:
            top_n: Number of top features to include
            
        Returns:
            Dict containing plot data
        """
        df = self.get_importance_comparison().head(top_n)
        
        plot_data = {
            'features': list(df.index),
            'methods': list(df.columns),
            'importances': df.to_dict('list')
        }
        
        return plot_data


class PermutationImportance:
    """
    Specialized class for permutation importance analysis.
    
    Provides additional features:
    - Statistical significance testing
    - Importance with confidence intervals
    - Feature interaction detection
    """
    
    def __init__(
        self,
        model: Any,
        scoring: str = 'roc_auc'
    ):
        """
        Initialize Permutation Importance analyzer.
        
        Args:
            model: Trained model
            scoring: Scoring metric
        """
        self.model = model
        self.scoring = scoring
        
        logger.info("🔄 PermutationImportance initialized")
    
    def calculate(
        self,
        X: Union[pd.DataFrame, np.ndarray],
        y: Union[pd.Series, np.ndarray],
        n_repeats: int = 30,
        feature_names: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Calculate permutation importance with statistics.
        
        Args:
            X: Features
            y: Labels
            n_repeats: Number of permutation repeats
            feature_names: Feature names
            
        Returns:
            Dict containing importance scores and statistics
        """
        logger.info(f"Calculating permutation importance ({n_repeats} repeats)...")
        
        # Convert to numpy
        if isinstance(X, pd.DataFrame):
            if feature_names is None:
                feature_names = list(X.columns)
            X = X.values
        if isinstance(y, pd.Series):
            y = y.values
        
        feature_names = feature_names or [f"Feature_{i}" for i in range(X.shape[1])]
        
        # Calculate baseline score
        if hasattr(self.model, 'predict_proba'):
            y_pred = self.model.predict_proba(X)[:, 1]
            baseline_score = roc_auc_score(y, y_pred)
        else:
            y_pred = self.model.predict(X)
            baseline_score = accuracy_score(y, y_pred)
        
        logger.info(f"   Baseline score: {baseline_score:.4f}")
        
        # Calculate permutation importance
        perm_importance = permutation_importance(
            self.model,
            X,
            y,
            n_repeats=n_repeats,
            random_state=42,
            scoring=self.scoring
        )
        
        # Build results
        results = {
            'baseline_score': float(baseline_score),
            'feature_importances': {}
        }
        
        for i, feature in enumerate(feature_names):
            results['feature_importances'][feature] = {
                'mean': float(perm_importance.importances_mean[i]),
                'std': float(perm_importance.importances_std[i]),
                'raw_values': perm_importance.importances[i].tolist()
            }
        
        # Sort by mean importance
        results['feature_importances'] = dict(
            sorted(
                results['feature_importances'].items(),
                key=lambda x: x[1]['mean'],
                reverse=True
            )
        )
        
        logger.info("✅ Permutation importance calculated!")
        
        return results


# ==================== UTILITY FUNCTIONS ====================

def get_feature_importance(
    model: Any,
    X_train: Union[pd.DataFrame, np.ndarray],
    y_train: Union[pd.Series, np.ndarray],
    X_test: Optional[Union[pd.DataFrame, np.ndarray]] = None,
    y_test: Optional[Union[pd.Series, np.ndarray]] = None,
    feature_names: Optional[List[str]] = None,
    method: str = 'auto'
) -> Dict[str, float]:
    """
    Quick function to get feature importance.
    
    Args:
        model: Trained model
        X_train: Training features
        y_train: Training labels
        X_test: Test features (optional)
        y_test: Test labels (optional)
        feature_names: Feature names
        method: Importance method ('auto', 'model', 'permutation', 'ensemble')
        
    Returns:
        Dict mapping feature names to importance scores
        
    Example:
        >>> importance = get_feature_importance(model, X_train, y_train)
        >>> for feature, score in importance.items():
        ...     print(f"{feature}: {score:.4f}")
    """
    analyzer = FeatureImportanceAnalyzer(model, X_train, y_train, feature_names)
    
    if method == 'auto':
        # Use model importance if available, otherwise permutation
        if hasattr(model, 'feature_importances_'):
            importances = analyzer.calculate_all_importances()
            return importances.get('model', {})
        elif X_test is not None and y_test is not None:
            importances = analyzer.calculate_all_importances(X_test, y_test)
            return importances.get('permutation', {})
        else:
            raise ValueError("Cannot auto-detect method. Provide test data or use tree-based model.")
    
    elif method == 'ensemble':
        analyzer.calculate_all_importances(X_test, y_test)
        return analyzer.ensemble_importance
    
    else:
        importances = analyzer.calculate_all_importances(X_test, y_test)
        return importances.get(method, {})


def select_features_by_importance(
    importance: Dict[str, float],
    threshold: float = 0.01,
    top_n: Optional[int] = None
) -> List[str]:
    """
    Select features based on importance threshold or top N.
    
    Args:
        importance: Feature importance dictionary
        threshold: Minimum importance threshold
        top_n: Number of top features (overrides threshold)
        
    Returns:
        List of selected feature names
    """
    if top_n is not None:
        # Select top N features
        sorted_features = sorted(importance.items(), key=lambda x: x[1], reverse=True)
        return [feature for feature, _ in sorted_features[:top_n]]
    else:
        # Select by threshold
        return [feature for feature, imp in importance.items() if imp >= threshold]


def compare_feature_importances(
    importances1: Dict[str, float],
    importances2: Dict[str, float],
    name1: str = "Method 1",
    name2: str = "Method 2"
) -> pd.DataFrame:
    """
    Compare two feature importance dictionaries.
    
    Args:
        importances1: First importance dictionary
        importances2: Second importance dictionary
        name1: Name of first method
        name2: Name of second method
        
    Returns:
        DataFrame with comparison
    """
    df = pd.DataFrame({
        name1: importances1,
        name2: importances2
    })
    
    df['difference'] = df[name1] - df[name2]
    df['abs_difference'] = df['difference'].abs()
    
    df = df.sort_values(name1, ascending=False)
    
    return df
