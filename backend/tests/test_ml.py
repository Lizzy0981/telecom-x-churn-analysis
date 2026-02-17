# backend/tests/test_ml.py
"""
ML Model Tests
==============

Test suite for machine learning models and pipelines.

Author: Elizabeth Díaz Familia
"""

import pytest
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score


class TestChurnPredictor:
    """Tests for churn prediction model"""
    
    def test_model_initialization(self):
        """Test model can be initialized"""
        from backend.app.ml.models.churn_predictor import ChurnPredictor
        
        model = ChurnPredictor()
        assert model is not None
    
    def test_model_training(self, sample_dataframe):
        """Test model training"""
        from backend.app.ml.models.churn_predictor import ChurnPredictor
        
        model = ChurnPredictor()
        
        X = sample_dataframe.drop(['customer_id', 'churn'], axis=1)
        y = sample_dataframe['churn']
        
        model.fit(X, y)
        
        assert hasattr(model, 'models')
        assert len(model.models) > 0
    
    def test_model_prediction(self, sample_dataframe):
        """Test model prediction"""
        from backend.app.ml.models.churn_predictor import ChurnPredictor
        
        model = ChurnPredictor()
        
        X = sample_dataframe.drop(['customer_id', 'churn'], axis=1)
        y = sample_dataframe['churn']
        
        # Split data
        split_idx = int(len(X) * 0.8)
        X_train, X_test = X[:split_idx], X[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]
        
        # Train and predict
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        
        assert len(predictions) == len(X_test)
        assert all(p in [0, 1] for p in predictions)
    
    def test_model_probability(self, sample_dataframe):
        """Test probability prediction"""
        from backend.app.ml.models.churn_predictor import ChurnPredictor
        
        model = ChurnPredictor()
        
        X = sample_dataframe.drop(['customer_id', 'churn'], axis=1)
        y = sample_dataframe['churn']
        
        model.fit(X, y)
        probabilities = model.predict_proba(X[:10])
        
        assert probabilities.shape[1] == 2  # Binary classification
        assert all(0 <= p <= 1 for row in probabilities for p in row)


class TestFeatureEngineering:
    """Tests for feature engineering utilities"""
    
    def test_create_polynomial_features(self, sample_dataframe):
        """Test polynomial feature creation"""
        from backend.app.ml.utils.feature_engineering import create_polynomial_features
        
        X = sample_dataframe[['tenure', 'monthly_charges']]
        X_poly = create_polynomial_features(X, degree=2)
        
        assert X_poly.shape[1] > X.shape[1]
        assert X_poly.shape[0] == X.shape[0]
    
    def test_feature_importance(self, sample_dataframe, mock_model):
        """Test feature importance extraction"""
        from backend.app.ml.explainability.feature_importance import get_feature_importance
        
        X = sample_dataframe.drop(['customer_id', 'churn'], axis=1)
        y = sample_dataframe['churn']
        
        importance = get_feature_importance(mock_model, X, y, method='model')
        
        assert isinstance(importance, dict)
        assert len(importance) > 0


class TestModelEvaluation:
    """Tests for model evaluation"""
    
    def test_calculate_classification_metrics(self):
        """Test classification metrics calculation"""
        from backend.app.ml.utils.model_evaluation import calculate_classification_metrics
        
        y_true = np.array([1, 0, 1, 1, 0, 1, 0, 0])
        y_pred = np.array([1, 0, 1, 0, 0, 1, 1, 0])
        
        metrics = calculate_classification_metrics(y_true, y_pred)
        
        assert 'accuracy' in metrics
        assert 'precision' in metrics
        assert 'recall' in metrics
        assert 'f1_score' in metrics
        
        assert 0 <= metrics['accuracy'] <= 1
    
    def test_confusion_matrix_generation(self):
        """Test confusion matrix generation"""
        from backend.app.ml.utils.model_evaluation import generate_confusion_matrix
        
        y_true = np.array([1, 0, 1, 1, 0])
        y_pred = np.array([1, 0, 1, 0, 0])
        
        cm = generate_confusion_matrix(y_true, y_pred)
        
        assert cm.shape == (2, 2)
        assert cm.sum() == len(y_true)


class TestDataPreprocessing:
    """Tests for data preprocessing"""
    
    def test_handle_missing_values(self, sample_dataframe):
        """Test missing value handling"""
        from backend.app.ml.utils.preprocessing import handle_missing_values
        
        # Add missing values
        df = sample_dataframe.copy()
        df.loc[0, 'tenure'] = np.nan
        df.loc[1, 'monthly_charges'] = np.nan
        
        df_clean = handle_missing_values(df)
        
        assert df_clean.isnull().sum().sum() == 0
    
    def test_data_scaling(self, sample_dataframe):
        """Test numerical feature scaling"""
        from backend.app.ml.utils.preprocessing import scale_numerical_features
        
        df_scaled = scale_numerical_features(sample_dataframe)
        
        # Check scaled features have mean ~0, std ~1
        scaled_cols = df_scaled.select_dtypes(include=[np.number]).columns
        for col in scaled_cols:
            if col != 'churn':  # Skip target
                assert abs(df_scaled[col].mean()) < 0.1
                assert abs(df_scaled[col].std() - 1.0) < 0.2
