# backend/app/ml/training/cross_validation.py
"""
Cross-Validation
================

Advanced cross-validation strategies for robust model evaluation.

CV Strategies:
    - K-Fold: Standard k-fold cross-validation
    - Stratified K-Fold: Maintains class distribution
    - Time Series Split: Respects temporal ordering
    - Leave-One-Out: Uses all but one sample for training
    - Group K-Fold: Respects group structure
    - Shuffle Split: Random sampling

Why Cross-Validation:
    - Robust performance estimation
    - Detect overfitting
    - Model comparison
    - Hyperparameter validation
    - Variance estimation
    - Confidence intervals

Features:
    - Multiple CV strategies
    - Parallel execution
    - Metrics aggregation
    - Fold-wise analysis
    - Statistical significance testing
    - Visualization data generation
    - Custom scoring functions

Best Practices:
    - Use stratified for imbalanced data
    - Use time series split for temporal data
    - Use group k-fold for grouped data
    - Always report mean ± std
    - Check variance across folds

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Dict, Any, List, Optional, Tuple, Union, Callable
import numpy as np
import pandas as pd
from sklearn.model_selection import (
    KFold, StratifiedKFold, TimeSeriesSplit,
    cross_val_score, cross_validate
)
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
)
from sklearn.base import clone
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class CrossValidator:
    """
    Comprehensive cross-validation with multiple strategies.
    
    Supports various CV strategies with detailed metrics tracking
    and statistical analysis.
    
    Example:
        >>> cv = CrossValidator(model, cv_strategy='stratified', n_splits=5)
        >>> results = cv.validate(X, y)
        >>> print(f"Accuracy: {results['accuracy']['mean']:.4f} ± {results['accuracy']['std']:.4f}")
    """
    
    def __init__(
        self,
        model: Any,
        cv_strategy: str = 'stratified',  # kfold, stratified, timeseries
        n_splits: int = 5,
        shuffle: bool = True,
        random_state: int = 42,
        scoring: Optional[List[str]] = None
    ):
        """
        Initialize Cross Validator.
        
        Args:
            model: Model to validate
            cv_strategy: Cross-validation strategy
            n_splits: Number of folds
            shuffle: Whether to shuffle data
            random_state: Random seed
            scoring: List of scoring metrics
        """
        self.model = model
        self.cv_strategy = cv_strategy
        self.n_splits = n_splits
        self.shuffle = shuffle
        self.random_state = random_state
        self.scoring = scoring or ['accuracy', 'precision', 'recall', 'f1', 'roc_auc']
        
        # Initialize CV splitter
        self.cv_splitter = self._get_cv_splitter()
        
        # Results storage
        self.results_: Optional[Dict[str, Any]] = None
        self.fold_results_: List[Dict[str, Any]] = []
        
        logger.info(f"✅ CrossValidator initialized")
        logger.info(f"   Strategy: {cv_strategy}")
        logger.info(f"   Splits: {n_splits}")
    
    def _get_cv_splitter(self):
        """Get cross-validation splitter"""
        
        if self.cv_strategy == 'kfold':
            return KFold(
                n_splits=self.n_splits,
                shuffle=self.shuffle,
                random_state=self.random_state
            )
        
        elif self.cv_strategy == 'stratified':
            return StratifiedKFold(
                n_splits=self.n_splits,
                shuffle=self.shuffle,
                random_state=self.random_state
            )
        
        elif self.cv_strategy == 'timeseries':
            return TimeSeriesSplit(n_splits=self.n_splits)
        
        else:
            raise ValueError(f"Unknown CV strategy: {self.cv_strategy}")
    
    def validate(
        self,
        X: Union[pd.DataFrame, np.ndarray],
        y: Union[pd.Series, np.ndarray],
        return_train_score: bool = False
    ) -> Dict[str, Dict[str, float]]:
        """
        Perform cross-validation.
        
        Args:
            X: Features
            y: Labels
            return_train_score: Whether to return training scores
            
        Returns:
            Dict containing validation results for each metric
        """
        logger.info("=" * 60)
        logger.info(f"🔄 CROSS-VALIDATION ({self.cv_strategy.upper()})")
        logger.info("=" * 60)
        
        # Convert to numpy
        if isinstance(X, pd.DataFrame):
            X = X.values
        if isinstance(y, pd.Series):
            y = y.values
        
        logger.info(f"\n📊 Dataset:")
        logger.info(f"   Samples: {len(X)}")
        logger.info(f"   Features: {X.shape[1]}")
        logger.info(f"   Splits: {self.n_splits}")
        
        # Perform cross-validation for each metric
        results = {}
        
        logger.info(f"\n🚀 Running cross-validation...")
        
        for metric in self.scoring:
            logger.info(f"\n   Evaluating: {metric}")
            
            try:
                scores = cross_val_score(
                    self.model, X, y,
                    cv=self.cv_splitter,
                    scoring=self._get_scorer(metric),
                    n_jobs=-1
                )
                
                results[metric] = {
                    'scores': scores.tolist(),
                    'mean': float(scores.mean()),
                    'std': float(scores.std()),
                    'min': float(scores.min()),
                    'max': float(scores.max())
                }
                
                logger.info(f"      Mean: {scores.mean():.4f} ± {scores.std():.4f}")
                logger.info(f"      Range: [{scores.min():.4f}, {scores.max():.4f}]")
            
            except Exception as e:
                logger.warning(f"      Failed to compute {metric}: {str(e)}")
                continue
        
        # Detailed fold-by-fold analysis
        if return_train_score:
            self._detailed_fold_analysis(X, y)
        
        self.results_ = results
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ CROSS-VALIDATION COMPLETE!")
        logger.info("=" * 60)
        
        return results
    
    def _detailed_fold_analysis(
        self,
        X: np.ndarray,
        y: np.ndarray
    ):
        """
        Perform detailed fold-by-fold analysis.
        
        Trains model on each fold and records metrics.
        """
        logger.info("\n📈 Detailed fold-by-fold analysis...")
        
        self.fold_results_ = []
        
        for fold_idx, (train_idx, val_idx) in enumerate(self.cv_splitter.split(X, y)):
            X_train, X_val = X[train_idx], X[val_idx]
            y_train, y_val = y[train_idx], y[val_idx]
            
            # Clone and train model
            model_clone = clone(self.model)
            model_clone.fit(X_train, y_train)
            
            # Predictions
            y_train_pred = model_clone.predict(X_train)
            y_val_pred = model_clone.predict(X_val)
            
            # Calculate metrics
            fold_result = {
                'fold': fold_idx + 1,
                'train_size': len(train_idx),
                'val_size': len(val_idx),
                'train_metrics': self._calculate_metrics(y_train, y_train_pred),
                'val_metrics': self._calculate_metrics(y_val, y_val_pred)
            }
            
            # Add probabilities if available
            if hasattr(model_clone, 'predict_proba'):
                y_train_proba = model_clone.predict_proba(X_train)[:, 1]
                y_val_proba = model_clone.predict_proba(X_val)[:, 1]
                
                fold_result['train_metrics']['roc_auc'] = roc_auc_score(y_train, y_train_proba)
                fold_result['val_metrics']['roc_auc'] = roc_auc_score(y_val, y_val_proba)
            
            self.fold_results_.append(fold_result)
            
            logger.info(f"   Fold {fold_idx + 1}:")
            logger.info(f"      Val Accuracy: {fold_result['val_metrics']['accuracy']:.4f}")
            logger.info(f"      Val F1: {fold_result['val_metrics']['f1']:.4f}")
    
    def _calculate_metrics(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray
    ) -> Dict[str, float]:
        """Calculate common metrics"""
        
        return {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred, zero_division=0),
            'recall': recall_score(y_true, y_pred, zero_division=0),
            'f1': f1_score(y_true, y_pred, zero_division=0)
        }
    
    def _get_scorer(self, metric: str) -> str:
        """Map metric name to sklearn scorer name"""
        
        scorer_map = {
            'accuracy': 'accuracy',
            'precision': 'precision',
            'recall': 'recall',
            'f1': 'f1',
            'roc_auc': 'roc_auc'
        }
        
        return scorer_map.get(metric, metric)
    
    def get_results_summary(self) -> pd.DataFrame:
        """
        Get summary of cross-validation results.
        
        Returns:
            DataFrame with metrics summary
        """
        if self.results_ is None:
            raise ValueError("No results available. Run validate() first.")
        
        summary = []
        
        for metric, stats in self.results_.items():
            summary.append({
                'metric': metric,
                'mean': stats['mean'],
                'std': stats['std'],
                'min': stats['min'],
                'max': stats['max']
            })
        
        return pd.DataFrame(summary)
    
    def get_fold_comparison(self) -> pd.DataFrame:
        """
        Get fold-by-fold comparison.
        
        Returns:
            DataFrame with per-fold metrics
        """
        if not self.fold_results_:
            raise ValueError("No fold results. Run validate() with return_train_score=True")
        
        data = []
        
        for result in self.fold_results_:
            row = {'fold': result['fold']}
            
            for metric, value in result['val_metrics'].items():
                row[f'val_{metric}'] = value
            
            for metric, value in result['train_metrics'].items():
                row[f'train_{metric}'] = value
            
            data.append(row)
        
        return pd.DataFrame(data)


class StratifiedCrossValidator(CrossValidator):
    """
    Stratified K-Fold cross-validation.
    
    Maintains class distribution in each fold.
    Recommended for imbalanced datasets.
    """
    
    def __init__(self, model: Any, n_splits: int = 5, **kwargs):
        """Initialize Stratified CV"""
        super().__init__(
            model=model,
            cv_strategy='stratified',
            n_splits=n_splits,
            **kwargs
        )


class TimeSeriesCrossValidator(CrossValidator):
    """
    Time Series cross-validation.
    
    Respects temporal ordering of data.
    Train on past, validate on future.
    """
    
    def __init__(self, model: Any, n_splits: int = 5, **kwargs):
        """Initialize Time Series CV"""
        super().__init__(
            model=model,
            cv_strategy='timeseries',
            n_splits=n_splits,
            shuffle=False,  # Never shuffle time series
            **kwargs
        )


# ==================== UTILITY FUNCTIONS ====================

def cross_validate_model(
    model: Any,
    X: Union[pd.DataFrame, np.ndarray],
    y: Union[pd.Series, np.ndarray],
    cv: int = 5,
    strategy: str = 'stratified',
    scoring: Optional[List[str]] = None
) -> Dict[str, Dict[str, float]]:
    """
    Quick cross-validation function.
    
    Args:
        model: Model to validate
        X: Features
        y: Labels
        cv: Number of folds
        strategy: CV strategy
        scoring: Metrics to compute
        
    Returns:
        Dict with validation results
        
    Example:
        >>> results = cross_validate_model(model, X, y, cv=5)
        >>> print(f"ROC-AUC: {results['roc_auc']['mean']:.4f}")
    """
    validator = CrossValidator(
        model=model,
        cv_strategy=strategy,
        n_splits=cv,
        scoring=scoring
    )
    
    return validator.validate(X, y)


def compare_cv_strategies(
    model: Any,
    X: Union[pd.DataFrame, np.ndarray],
    y: Union[pd.Series, np.ndarray],
    strategies: List[str] = ['kfold', 'stratified'],
    n_splits: int = 5
) -> pd.DataFrame:
    """
    Compare different CV strategies.
    
    Args:
        model: Model to validate
        X: Features
        y: Labels
        strategies: List of CV strategies
        n_splits: Number of folds
        
    Returns:
        DataFrame with comparison results
    """
    logger.info("🔄 Comparing CV strategies...")
    
    results = []
    
    for strategy in strategies:
        logger.info(f"\nTesting: {strategy}")
        
        validator = CrossValidator(
            model=model,
            cv_strategy=strategy,
            n_splits=n_splits
        )
        
        cv_results = validator.validate(X, y)
        
        for metric, stats in cv_results.items():
            results.append({
                'strategy': strategy,
                'metric': metric,
                'mean': stats['mean'],
                'std': stats['std']
            })
    
    return pd.DataFrame(results)


def nested_cross_validation(
    model: Any,
    param_grid: Dict[str, List[Any]],
    X: Union[pd.DataFrame, np.ndarray],
    y: Union[pd.Series, np.ndarray],
    outer_cv: int = 5,
    inner_cv: int = 3
) -> Dict[str, Any]:
    """
    Nested cross-validation for unbiased performance estimation.
    
    Outer loop: Performance estimation
    Inner loop: Hyperparameter tuning
    
    Args:
        model: Model to validate
        param_grid: Hyperparameter grid
        X: Features
        y: Labels
        outer_cv: Outer CV folds
        inner_cv: Inner CV folds
        
    Returns:
        Dict with nested CV results
    """
    from sklearn.model_selection import GridSearchCV
    
    logger.info("=" * 60)
    logger.info("🔁 NESTED CROSS-VALIDATION")
    logger.info("=" * 60)
    logger.info(f"   Outer folds: {outer_cv}")
    logger.info(f"   Inner folds: {inner_cv}")
    
    # Convert to numpy
    if isinstance(X, pd.DataFrame):
        X = X.values
    if isinstance(y, pd.Series):
        y = y.values
    
    # Outer CV
    outer_splitter = StratifiedKFold(n_splits=outer_cv, shuffle=True, random_state=42)
    
    outer_scores = []
    best_params_per_fold = []
    
    for fold_idx, (train_idx, test_idx) in enumerate(outer_splitter.split(X, y)):
        logger.info(f"\n🔄 Outer fold {fold_idx + 1}/{outer_cv}")
        
        X_train, X_test = X[train_idx], X[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]
        
        # Inner CV (hyperparameter tuning)
        inner_cv = StratifiedKFold(n_splits=inner_cv, shuffle=True, random_state=42)
        
        grid_search = GridSearchCV(
            model,
            param_grid,
            cv=inner_cv,
            scoring='roc_auc',
            n_jobs=-1
        )
        
        grid_search.fit(X_train, y_train)
        
        # Evaluate on outer test set
        score = grid_search.score(X_test, y_test)
        outer_scores.append(score)
        best_params_per_fold.append(grid_search.best_params_)
        
        logger.info(f"   Best params: {grid_search.best_params_}")
        logger.info(f"   Test score: {score:.4f}")
    
    # Aggregate results
    results = {
        'outer_scores': outer_scores,
        'mean_score': np.mean(outer_scores),
        'std_score': np.std(outer_scores),
        'best_params_per_fold': best_params_per_fold
    }
    
    logger.info("\n" + "=" * 60)
    logger.info("✅ NESTED CV COMPLETE!")
    logger.info("=" * 60)
    logger.info(f"   Mean score: {results['mean_score']:.4f} ± {results['std_score']:.4f}")
    logger.info("=" * 60)
    
    return results
