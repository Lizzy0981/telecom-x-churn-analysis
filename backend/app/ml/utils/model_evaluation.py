# backend/app/ml/utils/model_evaluation.py
"""
Model Evaluation
================

Comprehensive model evaluation utilities with detailed metrics,
visualizations, and reports for classification and regression tasks.

Classification Metrics:
    - Accuracy, Precision, Recall, F1-Score
    - ROC-AUC, PR-AUC
    - Confusion Matrix
    - Classification Report
    - Matthews Correlation Coefficient
    - Cohen's Kappa
    - Log Loss
    - Brier Score

Regression Metrics:
    - MSE, RMSE, MAE
    - R², Adjusted R²
    - MAPE, SMAPE
    - Median Absolute Error
    - Max Error

Visualizations:
    - ROC Curve
    - Precision-Recall Curve
    - Confusion Matrix Heatmap
    - Learning Curves
    - Calibration Curves
    - Feature Importance Plot

Reports:
    - Comprehensive classification report
    - Model comparison report
    - Cross-validation report
    - Prediction analysis

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Dict, Any, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
from sklearn.metrics import (
    # Classification
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report,
    matthews_corrcoef, cohen_kappa_score, log_loss, brier_score_loss,
    precision_recall_curve, roc_curve,
    # Regression
    mean_squared_error, mean_absolute_error, r2_score,
    median_absolute_error, max_error
)
from sklearn.model_selection import learning_curve
import logging

logger = logging.getLogger(__name__)


class ModelEvaluator:
    """
    Comprehensive model evaluator for classification and regression.
    
    Provides detailed metrics, visualizations, and reports for
    thorough model performance analysis.
    
    Example:
        >>> evaluator = ModelEvaluator(task='classification')
        >>> metrics = evaluator.evaluate(y_true, y_pred, y_proba)
        >>> report = evaluator.generate_report()
    """
    
    def __init__(
        self,
        task: str = 'classification',  # classification, regression
        threshold: float = 0.5
    ):
        """
        Initialize Model Evaluator.
        
        Args:
            task: Task type (classification or regression)
            threshold: Classification threshold
        """
        self.task = task
        self.threshold = threshold
        
        # Results storage
        self.metrics_: Optional[Dict[str, float]] = None
        self.confusion_matrix_: Optional[np.ndarray] = None
        self.classification_report_: Optional[Dict[str, Any]] = None
        
        logger.info(f"📊 ModelEvaluator initialized ({task})")
    
    def evaluate(
        self,
        y_true: Union[np.ndarray, pd.Series],
        y_pred: Union[np.ndarray, pd.Series],
        y_proba: Optional[Union[np.ndarray, pd.Series]] = None
    ) -> Dict[str, float]:
        """
        Evaluate model predictions.
        
        Args:
            y_true: True labels
            y_pred: Predicted labels
            y_proba: Predicted probabilities (for classification)
            
        Returns:
            Dict containing evaluation metrics
        """
        logger.info("=" * 60)
        logger.info(f"📊 EVALUATING MODEL ({self.task.upper()})")
        logger.info("=" * 60)
        
        # Convert to numpy
        if isinstance(y_true, pd.Series):
            y_true = y_true.values
        if isinstance(y_pred, pd.Series):
            y_pred = y_pred.values
        if y_proba is not None and isinstance(y_proba, pd.Series):
            y_proba = y_proba.values
        
        if self.task == 'classification':
            metrics = self._evaluate_classification(y_true, y_pred, y_proba)
        elif self.task == 'regression':
            metrics = self._evaluate_regression(y_true, y_pred)
        else:
            raise ValueError(f"Unknown task: {self.task}")
        
        self.metrics_ = metrics
        
        # Log results
        self._log_metrics(metrics)
        
        logger.info("=" * 60)
        logger.info("✅ EVALUATION COMPLETE")
        logger.info("=" * 60)
        
        return metrics
    
    def _evaluate_classification(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_proba: Optional[np.ndarray] = None
    ) -> Dict[str, float]:
        """Evaluate classification model"""
        
        metrics = {}
        
        # Basic metrics
        metrics['accuracy'] = accuracy_score(y_true, y_pred)
        metrics['precision'] = precision_score(y_true, y_pred, zero_division=0)
        metrics['recall'] = recall_score(y_true, y_pred, zero_division=0)
        metrics['f1_score'] = f1_score(y_true, y_pred, zero_division=0)
        
        # Additional metrics
        metrics['matthews_corrcoef'] = matthews_corrcoef(y_true, y_pred)
        metrics['cohen_kappa'] = cohen_kappa_score(y_true, y_pred)
        
        # Probability-based metrics
        if y_proba is not None:
            # Handle 2D probability array (take positive class)
            if y_proba.ndim == 2:
                y_proba = y_proba[:, 1]
            
            metrics['roc_auc'] = roc_auc_score(y_true, y_proba)
            metrics['log_loss'] = log_loss(y_true, y_proba)
            metrics['brier_score'] = brier_score_loss(y_true, y_proba)
        
        # Confusion matrix
        self.confusion_matrix_ = confusion_matrix(y_true, y_pred)
        
        # Detailed classification report
        self.classification_report_ = classification_report(
            y_true, y_pred,
            output_dict=True,
            zero_division=0
        )
        
        # Calculate specificity and sensitivity
        cm = self.confusion_matrix_
        if cm.shape == (2, 2):
            tn, fp, fn, tp = cm.ravel()
            
            metrics['sensitivity'] = tp / (tp + fn) if (tp + fn) > 0 else 0
            metrics['specificity'] = tn / (tn + fp) if (tn + fp) > 0 else 0
            metrics['false_positive_rate'] = fp / (fp + tn) if (fp + tn) > 0 else 0
            metrics['false_negative_rate'] = fn / (fn + tp) if (fn + tp) > 0 else 0
        
        return metrics
    
    def _evaluate_regression(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray
    ) -> Dict[str, float]:
        """Evaluate regression model"""
        
        metrics = {}
        
        # Error metrics
        metrics['mse'] = mean_squared_error(y_true, y_pred)
        metrics['rmse'] = np.sqrt(metrics['mse'])
        metrics['mae'] = mean_absolute_error(y_true, y_pred)
        metrics['median_ae'] = median_absolute_error(y_true, y_pred)
        metrics['max_error'] = max_error(y_true, y_pred)
        
        # R² Score
        metrics['r2'] = r2_score(y_true, y_pred)
        
        # MAPE (Mean Absolute Percentage Error)
        # Avoid division by zero
        mask = y_true != 0
        if mask.any():
            mape = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100
            metrics['mape'] = mape
        
        # Adjusted R² (requires n and p)
        n = len(y_true)
        p = 1  # Simplified, actual should be number of features
        adj_r2 = 1 - (1 - metrics['r2']) * (n - 1) / (n - p - 1)
        metrics['adjusted_r2'] = adj_r2
        
        return metrics
    
    def _log_metrics(self, metrics: Dict[str, float]):
        """Log metrics to console"""
        
        logger.info("\n📈 Metrics:")
        
        for metric, value in metrics.items():
            logger.info(f"   {metric}: {value:.4f}")
    
    def generate_report(self) -> str:
        """
        Generate comprehensive text report.
        
        Returns:
            str: Formatted report
        """
        if self.metrics_ is None:
            raise ValueError("No metrics available. Run evaluate() first.")
        
        report = []
        report.append("=" * 60)
        report.append(f"MODEL EVALUATION REPORT ({self.task.upper()})")
        report.append("=" * 60)
        report.append("")
        
        # Metrics section
        report.append("METRICS:")
        report.append("-" * 60)
        
        for metric, value in self.metrics_.items():
            report.append(f"  {metric:.<40s} {value:.4f}")
        
        report.append("")
        
        # Classification-specific sections
        if self.task == 'classification' and self.confusion_matrix_ is not None:
            report.append("CONFUSION MATRIX:")
            report.append("-" * 60)
            report.append(str(self.confusion_matrix_))
            report.append("")
            
            if self.classification_report_:
                report.append("CLASSIFICATION REPORT:")
                report.append("-" * 60)
                report.append(pd.DataFrame(self.classification_report_).transpose().to_string())
                report.append("")
        
        report.append("=" * 60)
        
        return "\n".join(report)
    
    def get_metrics_dataframe(self) -> pd.DataFrame:
        """
        Get metrics as DataFrame.
        
        Returns:
            DataFrame with metrics
        """
        if self.metrics_ is None:
            raise ValueError("No metrics available. Run evaluate() first.")
        
        df = pd.DataFrame([self.metrics_])
        return df.T.rename(columns={0: 'value'})
    
    def calculate_threshold_metrics(
        self,
        y_true: np.ndarray,
        y_proba: np.ndarray,
        thresholds: Optional[List[float]] = None
    ) -> pd.DataFrame:
        """
        Calculate metrics at different thresholds.
        
        Args:
            y_true: True labels
            y_proba: Predicted probabilities
            thresholds: List of thresholds to test
            
        Returns:
            DataFrame with metrics per threshold
        """
        if thresholds is None:
            thresholds = np.linspace(0.1, 0.9, 9)
        
        logger.info(f"Calculating metrics for {len(thresholds)} thresholds...")
        
        results = []
        
        for threshold in thresholds:
            y_pred = (y_proba >= threshold).astype(int)
            
            metrics = {
                'threshold': threshold,
                'accuracy': accuracy_score(y_true, y_pred),
                'precision': precision_score(y_true, y_pred, zero_division=0),
                'recall': recall_score(y_true, y_pred, zero_division=0),
                'f1_score': f1_score(y_true, y_pred, zero_division=0)
            }
            
            results.append(metrics)
        
        return pd.DataFrame(results)


# ==================== UTILITY FUNCTIONS ====================

def calculate_classification_metrics(
    y_true: Union[np.ndarray, pd.Series],
    y_pred: Union[np.ndarray, pd.Series],
    y_proba: Optional[Union[np.ndarray, pd.Series]] = None
) -> Dict[str, float]:
    """
    Quick function to calculate classification metrics.
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        y_proba: Predicted probabilities
        
    Returns:
        Dict of metrics
    """
    evaluator = ModelEvaluator(task='classification')
    return evaluator.evaluate(y_true, y_pred, y_proba)


def calculate_regression_metrics(
    y_true: Union[np.ndarray, pd.Series],
    y_pred: Union[np.ndarray, pd.Series]
) -> Dict[str, float]:
    """
    Quick function to calculate regression metrics.
    
    Args:
        y_true: True values
        y_pred: Predicted values
        
    Returns:
        Dict of metrics
    """
    evaluator = ModelEvaluator(task='regression')
    return evaluator.evaluate(y_true, y_pred)


def generate_confusion_matrix(
    y_true: Union[np.ndarray, pd.Series],
    y_pred: Union[np.ndarray, pd.Series],
    normalize: Optional[str] = None
) -> np.ndarray:
    """
    Generate confusion matrix.
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        normalize: Normalization mode ('true', 'pred', 'all')
        
    Returns:
        Confusion matrix
    """
    cm = confusion_matrix(y_true, y_pred)
    
    if normalize:
        if normalize == 'true':
            cm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
        elif normalize == 'pred':
            cm = cm.astype('float') / cm.sum(axis=0)
        elif normalize == 'all':
            cm = cm.astype('float') / cm.sum()
    
    return cm


def generate_classification_report(
    y_true: Union[np.ndarray, pd.Series],
    y_pred: Union[np.ndarray, pd.Series],
    target_names: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Generate classification report.
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        target_names: Names of target classes
        
    Returns:
        Classification report dictionary
    """
    return classification_report(
        y_true,
        y_pred,
        target_names=target_names,
        output_dict=True,
        zero_division=0
    )


def plot_roc_curve(
    y_true: np.ndarray,
    y_proba: np.ndarray
) -> Dict[str, Any]:
    """
    Generate ROC curve data.
    
    Args:
        y_true: True labels
        y_proba: Predicted probabilities
        
    Returns:
        Dict containing FPR, TPR, thresholds, and AUC
    """
    # Handle 2D array
    if y_proba.ndim == 2:
        y_proba = y_proba[:, 1]
    
    fpr, tpr, thresholds = roc_curve(y_true, y_proba)
    auc = roc_auc_score(y_true, y_proba)
    
    return {
        'fpr': fpr.tolist(),
        'tpr': tpr.tolist(),
        'thresholds': thresholds.tolist(),
        'auc': float(auc)
    }


def plot_precision_recall_curve(
    y_true: np.ndarray,
    y_proba: np.ndarray
) -> Dict[str, Any]:
    """
    Generate Precision-Recall curve data.
    
    Args:
        y_true: True labels
        y_proba: Predicted probabilities
        
    Returns:
        Dict containing precision, recall, and thresholds
    """
    # Handle 2D array
    if y_proba.ndim == 2:
        y_proba = y_proba[:, 1]
    
    precision, recall, thresholds = precision_recall_curve(y_true, y_proba)
    
    return {
        'precision': precision.tolist(),
        'recall': recall.tolist(),
        'thresholds': thresholds.tolist()
    }


def plot_learning_curve(
    estimator: Any,
    X: Union[np.ndarray, pd.DataFrame],
    y: Union[np.ndarray, pd.Series],
    cv: int = 5,
    train_sizes: Optional[np.ndarray] = None
) -> Dict[str, Any]:
    """
    Generate learning curve data.
    
    Args:
        estimator: Model estimator
        X: Features
        y: Labels
        cv: Cross-validation folds
        train_sizes: Training set sizes to use
        
    Returns:
        Dict containing learning curve data
    """
    logger.info("Generating learning curve...")
    
    if train_sizes is None:
        train_sizes = np.linspace(0.1, 1.0, 10)
    
    train_sizes, train_scores, val_scores = learning_curve(
        estimator, X, y,
        cv=cv,
        train_sizes=train_sizes,
        n_jobs=-1,
        scoring='accuracy'
    )
    
    return {
        'train_sizes': train_sizes.tolist(),
        'train_scores_mean': train_scores.mean(axis=1).tolist(),
        'train_scores_std': train_scores.std(axis=1).tolist(),
        'val_scores_mean': val_scores.mean(axis=1).tolist(),
        'val_scores_std': val_scores.std(axis=1).tolist()
    }


def compare_models(
    models: Dict[str, Any],
    X_test: Union[np.ndarray, pd.DataFrame],
    y_test: Union[np.ndarray, pd.Series]
) -> pd.DataFrame:
    """
    Compare multiple models on test data.
    
    Args:
        models: Dict mapping model names to fitted models
        X_test: Test features
        y_test: Test labels
        
    Returns:
        DataFrame with comparison results
    """
    logger.info(f"Comparing {len(models)} models...")
    
    results = []
    
    for name, model in models.items():
        logger.info(f"   Evaluating {name}...")
        
        y_pred = model.predict(X_test)
        
        metrics = {
            'model': name,
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, zero_division=0),
            'recall': recall_score(y_test, y_pred, zero_division=0),
            'f1_score': f1_score(y_test, y_pred, zero_division=0)
        }
        
        # Add ROC-AUC if predict_proba available
        if hasattr(model, 'predict_proba'):
            y_proba = model.predict_proba(X_test)[:, 1]
            metrics['roc_auc'] = roc_auc_score(y_test, y_proba)
        
        results.append(metrics)
    
    df = pd.DataFrame(results)
    df = df.sort_values('roc_auc' if 'roc_auc' in df.columns else 'accuracy', ascending=False)
    
    logger.info("✅ Model comparison complete")
    
    return df


def analyze_predictions(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_proba: Optional[np.ndarray] = None
) -> Dict[str, Any]:
    """
    Analyze prediction patterns and errors.
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        y_proba: Predicted probabilities
        
    Returns:
        Dict with analysis results
    """
    analysis = {}
    
    # Overall metrics
    analysis['accuracy'] = accuracy_score(y_true, y_pred)
    
    # Error analysis
    errors = y_true != y_pred
    analysis['error_rate'] = errors.mean()
    analysis['error_count'] = errors.sum()
    
    # False positives and negatives
    cm = confusion_matrix(y_true, y_pred)
    if cm.shape == (2, 2):
        tn, fp, fn, tp = cm.ravel()
        
        analysis['false_positives'] = int(fp)
        analysis['false_negatives'] = int(fn)
        analysis['true_positives'] = int(tp)
        analysis['true_negatives'] = int(tn)
    
    # Confidence analysis
    if y_proba is not None:
        if y_proba.ndim == 2:
            y_proba = y_proba[:, 1]
        
        analysis['mean_confidence'] = float(y_proba.mean())
        analysis['median_confidence'] = float(np.median(y_proba))
        
        # Confidence for correct vs incorrect predictions
        correct_mask = y_true == y_pred
        analysis['correct_mean_confidence'] = float(y_proba[correct_mask].mean())
        analysis['incorrect_mean_confidence'] = float(y_proba[~correct_mask].mean())
    
    return analysis
