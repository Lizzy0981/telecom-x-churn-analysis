# backend/app/ml/models/anomaly_detector.py
"""
Anomaly Detection Models
=========================

Advanced anomaly detection for identifying unusual customer behavior,
fraud detection, and outlier identification.

Algorithms Included:
    - Isolation Forest
    - One-Class SVM
    - Local Outlier Factor (LOF)
    - Autoencoder (Neural Network)
    - Statistical Methods (Z-score, IQR)

Use Cases:
    - Fraud detection
    - Unusual churn patterns
    - Service abuse detection
    - Payment anomalies
    - Usage pattern outliers
    - Network intrusion detection

Features:
    - Multiple detection methods
    - Ensemble anomaly scores
    - Configurable sensitivity
    - Anomaly explanations
    - Time-series anomalies
    - Real-time detection

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Dict, Any, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.svm import OneClassSVM
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import StandardScaler
from sklearn.covariance import EllipticEnvelope
import logging
from pathlib import Path
import pickle
from datetime import datetime

logger = logging.getLogger(__name__)


class AnomalyDetector:
    """
    Main anomaly detection class with multiple algorithms.
    
    Detects outliers and anomalies using ensemble of methods for
    robust detection with configurable sensitivity.
    
    Example:
        >>> detector = AnomalyDetector(contamination=0.05)
        >>> detector.fit(X_normal)
        >>> anomalies = detector.predict(X_test)
        >>> scores = detector.decision_function(X_test)
    """
    
    def __init__(
        self,
        algorithm: str = 'isolation_forest',  # isolation_forest, ocsvm, lof, ensemble
        contamination: float = 0.1,  # Expected proportion of outliers
        random_state: int = 42
    ):
        """
        Initialize Anomaly Detector.
        
        Args:
            algorithm: Detection algorithm to use
            contamination: Expected proportion of anomalies (0.0 to 0.5)
            random_state: Random seed
        """
        self.algorithm = algorithm
        self.contamination = contamination
        self.random_state = random_state
        
        self.model = None
        self.scaler = StandardScaler()
        self.is_fitted = False
        
        # Anomaly metadata
        self.anomaly_threshold = None
        self.feature_names: Optional[List[str]] = None
        
        logger.info(f"🔍 AnomalyDetector initialized: {algorithm}")
        logger.info(f"   Contamination: {contamination}")
    
    def fit(self, X: Union[pd.DataFrame, np.ndarray]) -> 'AnomalyDetector':
        """
        Fit anomaly detection model to normal data.
        
        Args:
            X: Normal (non-anomalous) training data
            
        Returns:
            self: Fitted model
            
        Note:
            Training data should contain mostly normal samples.
            Contamination parameter controls tolerance for outliers.
        """
        logger.info("📊 Fitting anomaly detector...")
        
        # Store feature names
        if isinstance(X, pd.DataFrame):
            self.feature_names = list(X.columns)
            X = X.values
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Initialize model based on algorithm
        if self.algorithm == 'isolation_forest':
            self.model = IsolationForest(
                contamination=self.contamination,
                random_state=self.random_state,
                n_estimators=100
            )
        
        elif self.algorithm == 'ocsvm':
            self.model = OneClassSVM(
                nu=self.contamination,
                kernel='rbf',
                gamma='auto'
            )
        
        elif self.algorithm == 'lof':
            self.model = LocalOutlierFactor(
                contamination=self.contamination,
                novelty=True
            )
        
        elif self.algorithm == 'ensemble':
            # Ensemble of methods
            logger.info("   Using ensemble of detectors")
            self._fit_ensemble(X_scaled)
            self.is_fitted = True
            return self
        
        else:
            raise ValueError(f"Unknown algorithm: {self.algorithm}")
        
        # Fit model
        self.model.fit(X_scaled)
        self.is_fitted = True
        
        logger.info("✅ Anomaly detector fitted!")
        
        return self
    
    def _fit_ensemble(self, X: np.ndarray):
        """Fit ensemble of anomaly detectors"""
        self.ensemble_models = {
            'isolation_forest': IsolationForest(
                contamination=self.contamination,
                random_state=self.random_state,
                n_estimators=100
            ),
            'ocsvm': OneClassSVM(
                nu=self.contamination,
                kernel='rbf',
                gamma='auto'
            )
        }
        
        for name, model in self.ensemble_models.items():
            logger.info(f"      Fitting {name}...")
            model.fit(X)
    
    def predict(self, X: Union[pd.DataFrame, np.ndarray]) -> np.ndarray:
        """
        Predict anomalies.
        
        Args:
            X: Data to check for anomalies
            
        Returns:
            np.ndarray: Binary labels (1=normal, -1=anomaly)
            
        Example:
            >>> predictions = detector.predict(X_test)
            >>> n_anomalies = np.sum(predictions == -1)
        """
        if not self.is_fitted:
            raise ValueError("Model not fitted. Call fit() first.")
        
        # Convert to numpy
        if isinstance(X, pd.DataFrame):
            X = X.values
        
        # Scale
        X_scaled = self.scaler.transform(X)
        
        # Predict
        if self.algorithm == 'ensemble':
            predictions = self._predict_ensemble(X_scaled)
        else:
            predictions = self.model.predict(X_scaled)
        
        return predictions
    
    def _predict_ensemble(self, X: np.ndarray) -> np.ndarray:
        """Predict using ensemble voting"""
        predictions = []
        
        for model in self.ensemble_models.values():
            pred = model.predict(X)
            predictions.append(pred)
        
        # Majority voting
        predictions = np.array(predictions)
        ensemble_pred = np.apply_along_axis(
            lambda x: 1 if np.sum(x == 1) > np.sum(x == -1) else -1,
            axis=0,
            arr=predictions
        )
        
        return ensemble_pred
    
    def decision_function(self, X: Union[pd.DataFrame, np.ndarray]) -> np.ndarray:
        """
        Calculate anomaly scores.
        
        Args:
            X: Data to score
            
        Returns:
            np.ndarray: Anomaly scores (lower = more anomalous)
            
        Example:
            >>> scores = detector.decision_function(X_test)
            >>> most_anomalous_idx = np.argmin(scores)
        """
        if not self.is_fitted:
            raise ValueError("Model not fitted. Call fit() first.")
        
        # Convert to numpy
        if isinstance(X, pd.DataFrame):
            X = X.values
        
        # Scale
        X_scaled = self.scaler.transform(X)
        
        # Get scores
        if hasattr(self.model, 'decision_function'):
            scores = self.model.decision_function(X_scaled)
        elif hasattr(self.model, 'score_samples'):
            scores = self.model.score_samples(X_scaled)
        else:
            # Fallback: convert predictions to scores
            predictions = self.model.predict(X_scaled)
            scores = predictions.astype(float)
        
        return scores
    
    def get_anomaly_details(
        self,
        X: Union[pd.DataFrame, np.ndarray],
        threshold_percentile: int = 5
    ) -> pd.DataFrame:
        """
        Get detailed anomaly report.
        
        Args:
            X: Data to analyze
            threshold_percentile: Percentile for anomaly threshold
            
        Returns:
            DataFrame with anomaly details
            
        Example:
            >>> details = detector.get_anomaly_details(X_test)
            >>> print(details[details['is_anomaly']])
        """
        # Convert to DataFrame
        if isinstance(X, np.ndarray):
            if self.feature_names:
                X = pd.DataFrame(X, columns=self.feature_names)
            else:
                X = pd.DataFrame(X)
        
        # Get predictions and scores
        predictions = self.predict(X.values)
        scores = self.decision_function(X.values)
        
        # Create results DataFrame
        results = X.copy()
        results['anomaly_score'] = scores
        results['is_anomaly'] = (predictions == -1)
        results['anomaly_severity'] = self._calculate_severity(scores)
        
        return results
    
    def _calculate_severity(self, scores: np.ndarray) -> np.ndarray:
        """
        Calculate anomaly severity levels.
        
        Args:
            scores: Anomaly scores
            
        Returns:
            np.ndarray: Severity labels (low/medium/high/critical)
        """
        # Normalize scores to 0-100 scale
        min_score = scores.min()
        max_score = scores.max()
        
        if max_score == min_score:
            normalized = np.zeros_like(scores)
        else:
            normalized = 100 * (scores - min_score) / (max_score - min_score)
        
        # Assign severity
        severity = np.empty(len(scores), dtype=object)
        severity[normalized >= 75] = 'low'
        severity[(normalized >= 50) & (normalized < 75)] = 'medium'
        severity[(normalized >= 25) & (normalized < 50)] = 'high'
        severity[normalized < 25] = 'critical'
        
        return severity
    
    def detect_statistical_anomalies(
        self,
        X: Union[pd.DataFrame, np.ndarray],
        method: str = 'zscore',  # zscore, iqr, mad
        threshold: float = 3.0
    ) -> np.ndarray:
        """
        Detect anomalies using statistical methods.
        
        Args:
            X: Data to analyze
            method: Statistical method (zscore/iqr/mad)
            threshold: Threshold for anomaly detection
            
        Returns:
            np.ndarray: Boolean mask of anomalies
        """
        if isinstance(X, pd.DataFrame):
            X = X.values
        
        if method == 'zscore':
            # Z-score method
            z_scores = np.abs((X - X.mean(axis=0)) / X.std(axis=0))
            anomalies = (z_scores > threshold).any(axis=1)
        
        elif method == 'iqr':
            # Interquartile Range method
            Q1 = np.percentile(X, 25, axis=0)
            Q3 = np.percentile(X, 75, axis=0)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - threshold * IQR
            upper_bound = Q3 + threshold * IQR
            
            anomalies = ((X < lower_bound) | (X > upper_bound)).any(axis=1)
        
        elif method == 'mad':
            # Median Absolute Deviation
            median = np.median(X, axis=0)
            mad = np.median(np.abs(X - median), axis=0)
            modified_z_scores = 0.6745 * (X - median) / mad
            
            anomalies = (np.abs(modified_z_scores) > threshold).any(axis=1)
        
        else:
            raise ValueError(f"Unknown method: {method}")
        
        return anomalies
    
    def evaluate(self, X: Union[pd.DataFrame, np.ndarray], y_true: np.ndarray) -> Dict[str, float]:
        """
        Evaluate anomaly detector (if true labels available).
        
        Args:
            X: Test data
            y_true: True labels (1=normal, -1=anomaly)
            
        Returns:
            Dict of evaluation metrics
        """
        predictions = self.predict(X)
        
        # Calculate metrics
        tp = np.sum((predictions == -1) & (y_true == -1))  # True Positives
        fp = np.sum((predictions == -1) & (y_true == 1))   # False Positives
        tn = np.sum((predictions == 1) & (y_true == 1))    # True Negatives
        fn = np.sum((predictions == 1) & (y_true == -1))   # False Negatives
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        accuracy = (tp + tn) / len(y_true)
        
        metrics = {
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'accuracy': accuracy,
            'true_positives': int(tp),
            'false_positives': int(fp),
            'true_negatives': int(tn),
            'false_negatives': int(fn)
        }
        
        logger.info("📊 Anomaly Detection Metrics:")
        logger.info(f"   Precision: {precision:.4f}")
        logger.info(f"   Recall:    {recall:.4f}")
        logger.info(f"   F1-Score:  {f1:.4f}")
        
        return metrics
    
    def save(self, filepath: Union[str, Path]):
        """Save detector to disk"""
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        with open(filepath, 'wb') as f:
            pickle.dump(self, f)
        
        logger.info(f"💾 Anomaly detector saved to {filepath}")
    
    @staticmethod
    def load(filepath: Union[str, Path]) -> 'AnomalyDetector':
        """Load detector from disk"""
        with open(filepath, 'rb') as f:
            model = pickle.load(f)
        
        logger.info(f"📂 Anomaly detector loaded from {filepath}")
        return model


class IsolationForestDetector(AnomalyDetector):
    """Specialized Isolation Forest implementation"""
    
    def __init__(self, contamination: float = 0.1, **kwargs):
        super().__init__(algorithm='isolation_forest', contamination=contamination, **kwargs)
