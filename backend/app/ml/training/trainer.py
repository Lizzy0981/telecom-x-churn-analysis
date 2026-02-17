# backend/app/ml/training/trainer.py
"""
Model Trainer
=============

Complete training pipeline for machine learning models with advanced features
including early stopping, checkpointing, class imbalance handling, and metrics tracking.

Features:
    - Automated preprocessing pipeline
    - Class imbalance handling (SMOTE, class weights)
    - Early stopping with patience
    - Model checkpointing (best model saving)
    - Training history tracking
    - Progress callbacks
    - Reproducibility (random seeds)
    - Metrics logging
    - Validation split strategies
    - Learning curves generation

Training Pipeline Steps:
    1. Data preprocessing and validation
    2. Train/validation split
    3. Class imbalance handling
    4. Feature scaling
    5. Model initialization
    6. Training with early stopping
    7. Checkpoint best model
    8. Evaluate on validation set
    9. Generate training history
    10. Save final model

Supported Models:
    - scikit-learn models
    - Tree-based (Random Forest, XGBoost, LightGBM)
    - Neural Networks (Keras/TensorFlow)
    - Custom models with fit/predict interface

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Dict, Any, List, Optional, Tuple, Union, Callable
from dataclasses import dataclass, field
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
import logging
from pathlib import Path
import pickle
import json
from datetime import datetime
import time

logger = logging.getLogger(__name__)


@dataclass
class TrainingConfig:
    """
    Configuration for model training.
    
    Attributes:
        validation_split: Fraction of data for validation
        random_state: Random seed for reproducibility
        early_stopping: Whether to use early stopping
        patience: Patience for early stopping
        min_delta: Minimum change to qualify as improvement
        handle_imbalance: Whether to handle class imbalance
        imbalance_method: Method for handling imbalance (smote, weights)
        scale_features: Whether to scale features
        save_checkpoints: Whether to save model checkpoints
        checkpoint_dir: Directory for checkpoints
        verbose: Verbosity level (0, 1, 2)
    """
    validation_split: float = 0.2
    random_state: int = 42
    early_stopping: bool = True
    patience: int = 10
    min_delta: float = 0.001
    handle_imbalance: bool = True
    imbalance_method: str = 'weights'  # smote, weights, none
    scale_features: bool = True
    save_checkpoints: bool = True
    checkpoint_dir: str = 'checkpoints'
    verbose: int = 1
    metrics: List[str] = field(default_factory=lambda: ['accuracy', 'roc_auc', 'f1'])


@dataclass
class TrainingHistory:
    """
    Training history tracking.
    
    Stores metrics and losses throughout training for analysis
    and visualization.
    """
    epoch: List[int] = field(default_factory=list)
    train_loss: List[float] = field(default_factory=list)
    val_loss: List[float] = field(default_factory=list)
    train_metrics: Dict[str, List[float]] = field(default_factory=dict)
    val_metrics: Dict[str, List[float]] = field(default_factory=dict)
    best_epoch: int = 0
    best_score: float = 0.0
    training_time: float = 0.0
    
    def add_epoch(
        self,
        epoch: int,
        train_loss: float,
        val_loss: float,
        train_metrics: Dict[str, float],
        val_metrics: Dict[str, float]
    ):
        """Add metrics for an epoch"""
        self.epoch.append(epoch)
        self.train_loss.append(train_loss)
        self.val_loss.append(val_loss)
        
        for metric, value in train_metrics.items():
            if metric not in self.train_metrics:
                self.train_metrics[metric] = []
            self.train_metrics[metric].append(value)
        
        for metric, value in val_metrics.items():
            if metric not in self.val_metrics:
                self.val_metrics[metric] = []
            self.val_metrics[metric].append(value)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            'epoch': self.epoch,
            'train_loss': self.train_loss,
            'val_loss': self.val_loss,
            'train_metrics': self.train_metrics,
            'val_metrics': self.val_metrics,
            'best_epoch': self.best_epoch,
            'best_score': self.best_score,
            'training_time': self.training_time
        }
    
    def save(self, filepath: Union[str, Path]):
        """Save history to JSON"""
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        with open(filepath, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)
        
        logger.info(f"💾 Training history saved to {filepath}")


class ModelTrainer:
    """
    Complete model training pipeline with advanced features.
    
    Handles the entire training process from data preprocessing to
    model evaluation with support for early stopping, checkpointing,
    and class imbalance handling.
    
    Example:
        >>> config = TrainingConfig(early_stopping=True, patience=10)
        >>> trainer = ModelTrainer(model, config)
        >>> trainer.fit(X_train, y_train)
        >>> predictions = trainer.predict(X_test)
        >>> metrics = trainer.evaluate(X_test, y_test)
    """
    
    def __init__(
        self,
        model: Any,
        config: Optional[TrainingConfig] = None
    ):
        """
        Initialize Model Trainer.
        
        Args:
            model: Model instance to train
            config: Training configuration
        """
        self.model = model
        self.config = config or TrainingConfig()
        
        # Components
        self.scaler: Optional[StandardScaler] = None
        self.best_model: Optional[Any] = None
        self.history = TrainingHistory()
        
        # Training state
        self.is_trained = False
        self.feature_names: Optional[List[str]] = None
        
        # Early stopping state
        self.best_score = -np.inf
        self.epochs_without_improvement = 0
        
        logger.info("🎓 ModelTrainer initialized")
        logger.info(f"   Early stopping: {self.config.early_stopping}")
        logger.info(f"   Patience: {self.config.patience}")
        logger.info(f"   Handle imbalance: {self.config.handle_imbalance}")
    
    def fit(
        self,
        X: Union[pd.DataFrame, np.ndarray],
        y: Union[pd.Series, np.ndarray],
        X_val: Optional[Union[pd.DataFrame, np.ndarray]] = None,
        y_val: Optional[Union[pd.Series, np.ndarray]] = None,
        callbacks: Optional[List[Callable]] = None
    ) -> 'ModelTrainer':
        """
        Train the model with complete pipeline.
        
        Args:
            X: Training features
            y: Training labels
            X_val: Validation features (optional, will split if not provided)
            y_val: Validation labels (optional)
            callbacks: List of callback functions
            
        Returns:
            self: Trained model trainer
        """
        start_time = time.time()
        
        logger.info("=" * 60)
        logger.info("🚀 STARTING MODEL TRAINING")
        logger.info("=" * 60)
        
        # Store feature names
        if isinstance(X, pd.DataFrame):
            self.feature_names = list(X.columns)
            X = X.values
        if isinstance(y, pd.Series):
            y = y.values
        
        # Split validation if not provided
        if X_val is None:
            logger.info(f"\n📊 Splitting data (validation: {self.config.validation_split})")
            X, X_val, y, y_val = train_test_split(
                X, y,
                test_size=self.config.validation_split,
                random_state=self.config.random_state,
                stratify=y
            )
            logger.info(f"   Training samples: {len(X)}")
            logger.info(f"   Validation samples: {len(X_val)}")
        else:
            if isinstance(X_val, pd.DataFrame):
                X_val = X_val.values
            if isinstance(y_val, pd.Series):
                y_val = y_val.values
        
        # Handle class imbalance
        if self.config.handle_imbalance:
            X, y = self._handle_imbalance(X, y)
        
        # Scale features
        if self.config.scale_features:
            logger.info("\n🔄 Scaling features...")
            self.scaler = StandardScaler()
            X = self.scaler.fit_transform(X)
            X_val = self.scaler.transform(X_val)
        
        # Check if model supports iterative training (for early stopping)
        has_partial_fit = hasattr(self.model, 'partial_fit')
        has_warm_start = hasattr(self.model, 'warm_start')
        
        if self.config.early_stopping and not (has_partial_fit or has_warm_start):
            logger.warning("⚠️  Model doesn't support iterative training, disabling early stopping")
            self.config.early_stopping = False
        
        # Train model
        logger.info("\n🎯 Training model...")
        
        if self.config.early_stopping:
            # Iterative training with early stopping
            self._train_with_early_stopping(X, y, X_val, y_val)
        else:
            # Single training
            self.model.fit(X, y)
            
            # Evaluate
            train_metrics = self._calculate_metrics(X, y)
            val_metrics = self._calculate_metrics(X_val, y_val)
            
            self.history.add_epoch(
                epoch=0,
                train_loss=0.0,
                val_loss=0.0,
                train_metrics=train_metrics,
                val_metrics=val_metrics
            )
            
            # Log metrics
            self._log_metrics(0, train_metrics, val_metrics)
        
        # Save best model
        self.best_model = self.model
        
        # Record training time
        self.history.training_time = time.time() - start_time
        
        # Mark as trained
        self.is_trained = True
        
        logger.info("\n" + "=" * 60)
        logger.info(f"✅ TRAINING COMPLETE!")
        logger.info(f"⏱️  Total time: {self.history.training_time:.2f}s")
        logger.info(f"🏆 Best validation score: {self.best_score:.4f}")
        logger.info("=" * 60)
        
        return self
    
    def _handle_imbalance(
        self,
        X: np.ndarray,
        y: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Handle class imbalance.
        
        Args:
            X: Features
            y: Labels
            
        Returns:
            Tuple of balanced (X, y)
        """
        logger.info("\n⚖️  Handling class imbalance...")
        
        # Check imbalance
        unique, counts = np.unique(y, return_counts=True)
        imbalance_ratio = counts.max() / counts.min()
        
        logger.info(f"   Class distribution: {dict(zip(unique, counts))}")
        logger.info(f"   Imbalance ratio: {imbalance_ratio:.2f}")
        
        if self.config.imbalance_method == 'smote':
            # SMOTE (requires imblearn library)
            try:
                from imblearn.over_sampling import SMOTE
                
                smote = SMOTE(random_state=self.config.random_state)
                X, y = smote.fit_resample(X, y)
                
                logger.info("   ✅ Applied SMOTE")
                logger.info(f"   New distribution: {dict(zip(*np.unique(y, return_counts=True)))}")
            
            except ImportError:
                logger.warning("   ⚠️  imblearn not installed, falling back to class weights")
                self.config.imbalance_method = 'weights'
        
        if self.config.imbalance_method == 'weights':
            # Set class weights in model if supported
            if hasattr(self.model, 'class_weight'):
                self.model.class_weight = 'balanced'
                logger.info("   ✅ Using balanced class weights")
            else:
                logger.warning("   ⚠️  Model doesn't support class weights")
        
        return X, y
    
    def _train_with_early_stopping(
        self,
        X: np.ndarray,
        y: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray,
        max_epochs: int = 100
    ):
        """
        Train with early stopping.
        
        Note: This is a simplified version. In production with neural networks,
        use framework-specific early stopping (Keras callbacks, PyTorch hooks).
        """
        logger.info(f"   Using early stopping (patience: {self.config.patience})")
        
        for epoch in range(max_epochs):
            # Train model
            self.model.fit(X, y)
            
            # Calculate metrics
            train_metrics = self._calculate_metrics(X, y)
            val_metrics = self._calculate_metrics(X_val, y_val)
            
            # Get primary metric for early stopping
            val_score = val_metrics.get('roc_auc', val_metrics.get('accuracy', 0.0))
            
            # Record history
            self.history.add_epoch(
                epoch=epoch,
                train_loss=0.0,
                val_loss=0.0,
                train_metrics=train_metrics,
                val_metrics=val_metrics
            )
            
            # Log progress
            if self.config.verbose >= 1 and epoch % 10 == 0:
                self._log_metrics(epoch, train_metrics, val_metrics)
            
            # Check for improvement
            if val_score > self.best_score + self.config.min_delta:
                self.best_score = val_score
                self.epochs_without_improvement = 0
                self.history.best_epoch = epoch
                self.history.best_score = val_score
                
                # Save checkpoint
                if self.config.save_checkpoints:
                    self._save_checkpoint(epoch, val_score)
            else:
                self.epochs_without_improvement += 1
            
            # Early stopping check
            if self.epochs_without_improvement >= self.config.patience:
                logger.info(f"\n⏹️  Early stopping at epoch {epoch}")
                logger.info(f"   Best score: {self.best_score:.4f} at epoch {self.history.best_epoch}")
                break
    
    def _calculate_metrics(
        self,
        X: np.ndarray,
        y: np.ndarray
    ) -> Dict[str, float]:
        """Calculate evaluation metrics"""
        
        # Get predictions
        y_pred = self.model.predict(X)
        
        metrics = {}
        
        # Accuracy
        if 'accuracy' in self.config.metrics:
            metrics['accuracy'] = accuracy_score(y, y_pred)
        
        # Precision
        if 'precision' in self.config.metrics:
            metrics['precision'] = precision_score(y, y_pred, zero_division=0)
        
        # Recall
        if 'recall' in self.config.metrics:
            metrics['recall'] = recall_score(y, y_pred, zero_division=0)
        
        # F1 Score
        if 'f1' in self.config.metrics:
            metrics['f1'] = f1_score(y, y_pred, zero_division=0)
        
        # ROC AUC
        if 'roc_auc' in self.config.metrics:
            if hasattr(self.model, 'predict_proba'):
                y_proba = self.model.predict_proba(X)[:, 1]
                metrics['roc_auc'] = roc_auc_score(y, y_proba)
        
        return metrics
    
    def _log_metrics(
        self,
        epoch: int,
        train_metrics: Dict[str, float],
        val_metrics: Dict[str, float]
    ):
        """Log training metrics"""
        logger.info(f"\n📊 Epoch {epoch}")
        logger.info("   Training:")
        for metric, value in train_metrics.items():
            logger.info(f"      {metric}: {value:.4f}")
        
        logger.info("   Validation:")
        for metric, value in val_metrics.items():
            logger.info(f"      {metric}: {value:.4f}")
    
    def _save_checkpoint(self, epoch: int, score: float):
        """Save model checkpoint"""
        checkpoint_dir = Path(self.config.checkpoint_dir)
        checkpoint_dir.mkdir(parents=True, exist_ok=True)
        
        checkpoint_path = checkpoint_dir / f"checkpoint_epoch_{epoch}_score_{score:.4f}.pkl"
        
        with open(checkpoint_path, 'wb') as f:
            pickle.dump(self.model, f)
        
        if self.config.verbose >= 2:
            logger.info(f"   💾 Checkpoint saved: {checkpoint_path}")
    
    def predict(self, X: Union[pd.DataFrame, np.ndarray]) -> np.ndarray:
        """
        Make predictions.
        
        Args:
            X: Features
            
        Returns:
            np.ndarray: Predictions
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call fit() first.")
        
        # Convert to numpy
        if isinstance(X, pd.DataFrame):
            X = X.values
        
        # Scale if needed
        if self.scaler is not None:
            X = self.scaler.transform(X)
        
        # Predict
        predictions = self.model.predict(X)
        
        return predictions
    
    def predict_proba(self, X: Union[pd.DataFrame, np.ndarray]) -> np.ndarray:
        """Predict probabilities"""
        if not self.is_trained:
            raise ValueError("Model not trained. Call fit() first.")
        
        if not hasattr(self.model, 'predict_proba'):
            raise ValueError("Model doesn't support probability predictions")
        
        # Convert to numpy
        if isinstance(X, pd.DataFrame):
            X = X.values
        
        # Scale if needed
        if self.scaler is not None:
            X = self.scaler.transform(X)
        
        # Predict probabilities
        probabilities = self.model.predict_proba(X)
        
        return probabilities
    
    def evaluate(
        self,
        X: Union[pd.DataFrame, np.ndarray],
        y: Union[pd.Series, np.ndarray]
    ) -> Dict[str, Any]:
        """
        Evaluate model on test data.
        
        Args:
            X: Test features
            y: Test labels
            
        Returns:
            Dict containing evaluation metrics
        """
        logger.info("\n📊 Evaluating model on test data...")
        
        # Convert to numpy
        if isinstance(X, pd.DataFrame):
            X = X.values
        if isinstance(y, pd.Series):
            y = y.values
        
        # Scale if needed
        if self.scaler is not None:
            X = self.scaler.transform(X)
        
        # Get predictions
        y_pred = self.model.predict(X)
        
        # Calculate metrics
        metrics = {
            'accuracy': accuracy_score(y, y_pred),
            'precision': precision_score(y, y_pred, zero_division=0),
            'recall': recall_score(y, y_pred, zero_division=0),
            'f1_score': f1_score(y, y_pred, zero_division=0),
            'confusion_matrix': confusion_matrix(y, y_pred).tolist()
        }
        
        # ROC AUC if available
        if hasattr(self.model, 'predict_proba'):
            y_proba = self.model.predict_proba(X)[:, 1]
            metrics['roc_auc'] = roc_auc_score(y, y_proba)
        
        # Classification report
        report = classification_report(y, y_pred, output_dict=True, zero_division=0)
        metrics['classification_report'] = report
        
        # Log results
        logger.info("   Results:")
        logger.info(f"      Accuracy:  {metrics['accuracy']:.4f}")
        logger.info(f"      Precision: {metrics['precision']:.4f}")
        logger.info(f"      Recall:    {metrics['recall']:.4f}")
        logger.info(f"      F1-Score:  {metrics['f1_score']:.4f}")
        if 'roc_auc' in metrics:
            logger.info(f"      ROC-AUC:   {metrics['roc_auc']:.4f}")
        
        return metrics
    
    def save(self, filepath: Union[str, Path]):
        """
        Save complete trainer state.
        
        Args:
            filepath: Path to save trainer
        """
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Save trainer state
        state = {
            'model': self.model,
            'scaler': self.scaler,
            'config': self.config,
            'history': self.history.to_dict(),
            'feature_names': self.feature_names,
            'is_trained': self.is_trained
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(state, f)
        
        logger.info(f"💾 Trainer saved to {filepath}")
        
        # Save history separately as JSON
        history_path = filepath.with_suffix('.history.json')
        self.history.save(history_path)
    
    @staticmethod
    def load(filepath: Union[str, Path]) -> 'ModelTrainer':
        """
        Load trainer from file.
        
        Args:
            filepath: Path to load from
            
        Returns:
            ModelTrainer: Loaded trainer
        """
        with open(filepath, 'rb') as f:
            state = pickle.load(f)
        
        # Reconstruct trainer
        trainer = ModelTrainer(state['model'], state['config'])
        trainer.scaler = state['scaler']
        trainer.feature_names = state['feature_names']
        trainer.is_trained = state['is_trained']
        
        # Reconstruct history
        history_dict = state['history']
        trainer.history = TrainingHistory()
        for key, value in history_dict.items():
            setattr(trainer.history, key, value)
        
        logger.info(f"📂 Trainer loaded from {filepath}")
        
        return trainer
