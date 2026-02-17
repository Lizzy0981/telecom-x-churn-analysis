# backend/app/ml/utils/feature_engineering.py
"""
Feature Engineering
===================

Advanced feature engineering utilities for creating, selecting, and transforming features.

Feature Creation Methods:
    - Polynomial features
    - Interaction features
    - Domain-specific features
    - Aggregation features
    - Time-based features
    - Binning/discretization

Feature Selection Methods:
    - Filter methods (correlation, mutual information, chi-square)
    - Wrapper methods (RFE, forward/backward selection)
    - Embedded methods (feature importance from models)
    - Hybrid approaches

Feature Transformation:
    - Log transformation
    - Box-Cox transformation
    - Square root transformation
    - Binning
    - Discretization

Best Practices:
    - Avoid data leakage
    - Cross-validate feature selection
    - Domain knowledge integration
    - Feature importance analysis
    - Correlation analysis

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Dict, Any, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
from sklearn.preprocessing import PolynomialFeatures
from sklearn.feature_selection import (
    SelectKBest, f_classif, mutual_info_classif,
    RFE, SelectFromModel
)
from sklearn.ensemble import RandomForestClassifier
import logging

logger = logging.getLogger(__name__)


class FeatureEngineer:
    """
    Comprehensive feature engineering class.
    
    Provides methods for creating, selecting, and transforming features
    with support for both automated and domain-specific approaches.
    
    Example:
        >>> engineer = FeatureEngineer()
        >>> # Create interaction features
        >>> X_new = engineer.create_interactions(X, feature_pairs=[('A', 'B'), ('C', 'D')])
        >>> # Select top k features
        >>> X_selected = engineer.select_features(X, y, method='mutual_info', k=10)
    """
    
    def __init__(self):
        """Initialize Feature Engineer"""
        self.feature_names_: Optional[List[str]] = None
        self.selected_features_: Optional[List[str]] = None
        
        logger.info("🔧 FeatureEngineer initialized")
    
    # ==================== FEATURE CREATION ====================
    
    def create_polynomial_features(
        self,
        X: Union[pd.DataFrame, np.ndarray],
        degree: int = 2,
        interaction_only: bool = False,
        include_bias: bool = False
    ) -> Union[pd.DataFrame, np.ndarray]:
        """
        Create polynomial features.
        
        Args:
            X: Input features
            degree: Polynomial degree
            interaction_only: Only interaction terms, no powers
            include_bias: Include bias column
            
        Returns:
            Features with polynomial terms
            
        Example:
            >>> X_poly = engineer.create_polynomial_features(X, degree=2)
        """
        logger.info(f"Creating polynomial features (degree={degree})...")
        
        is_dataframe = isinstance(X, pd.DataFrame)
        original_columns = list(X.columns) if is_dataframe else None
        
        poly = PolynomialFeatures(
            degree=degree,
            interaction_only=interaction_only,
            include_bias=include_bias
        )
        
        X_poly = poly.fit_transform(X)
        
        if is_dataframe:
            # Generate feature names
            feature_names = poly.get_feature_names_out(original_columns)
            X_poly = pd.DataFrame(X_poly, columns=feature_names, index=X.index)
        
        logger.info(f"   Created {X_poly.shape[1]} features (original: {X.shape[1]})")
        
        return X_poly
    
    def create_interaction_features(
        self,
        X: pd.DataFrame,
        feature_pairs: Optional[List[Tuple[str, str]]] = None,
        operations: List[str] = ['multiply', 'add', 'subtract', 'divide']
    ) -> pd.DataFrame:
        """
        Create interaction features between specified pairs.
        
        Args:
            X: Input DataFrame
            feature_pairs: List of (feature1, feature2) pairs
            operations: Operations to perform
            
        Returns:
            DataFrame with interaction features
            
        Example:
            >>> pairs = [('tenure', 'MonthlyCharges'), ('age', 'income')]
            >>> X_new = engineer.create_interaction_features(X, pairs)
        """
        logger.info("Creating interaction features...")
        
        X_new = X.copy()
        
        if feature_pairs is None:
            # Auto-generate pairs from numerical columns
            numerical_cols = X.select_dtypes(include=[np.number]).columns.tolist()
            feature_pairs = [(numerical_cols[i], numerical_cols[j]) 
                           for i in range(len(numerical_cols)) 
                           for j in range(i+1, len(numerical_cols))]
            
            # Limit to prevent explosion
            feature_pairs = feature_pairs[:20]
        
        created_count = 0
        
        for feat1, feat2 in feature_pairs:
            if feat1 not in X.columns or feat2 not in X.columns:
                continue
            
            # Multiplication
            if 'multiply' in operations:
                X_new[f'{feat1}_x_{feat2}'] = X[feat1] * X[feat2]
                created_count += 1
            
            # Addition
            if 'add' in operations:
                X_new[f'{feat1}_plus_{feat2}'] = X[feat1] + X[feat2]
                created_count += 1
            
            # Subtraction
            if 'subtract' in operations:
                X_new[f'{feat1}_minus_{feat2}'] = X[feat1] - X[feat2]
                created_count += 1
            
            # Division (safe)
            if 'divide' in operations:
                X_new[f'{feat1}_div_{feat2}'] = X[feat1] / (X[feat2] + 1e-10)
                created_count += 1
        
        logger.info(f"   Created {created_count} interaction features")
        
        return X_new
    
    def create_aggregation_features(
        self,
        X: pd.DataFrame,
        group_col: str,
        agg_cols: List[str],
        agg_funcs: List[str] = ['mean', 'sum', 'max', 'min', 'std']
    ) -> pd.DataFrame:
        """
        Create aggregation features grouped by a column.
        
        Args:
            X: Input DataFrame
            group_col: Column to group by
            agg_cols: Columns to aggregate
            agg_funcs: Aggregation functions
            
        Returns:
            DataFrame with aggregation features
        """
        logger.info(f"Creating aggregation features (group by {group_col})...")
        
        X_new = X.copy()
        
        for col in agg_cols:
            for func in agg_funcs:
                agg_name = f'{col}_{func}_by_{group_col}'
                
                # Calculate aggregation
                agg_values = X.groupby(group_col)[col].transform(func)
                X_new[agg_name] = agg_values
        
        logger.info(f"   Created {len(agg_cols) * len(agg_funcs)} aggregation features")
        
        return X_new
    
    def create_binning_features(
        self,
        X: pd.DataFrame,
        features: List[str],
        n_bins: int = 5,
        strategy: str = 'quantile'  # quantile, uniform, kmeans
    ) -> pd.DataFrame:
        """
        Create binned/discretized features.
        
        Args:
            X: Input DataFrame
            features: Features to bin
            n_bins: Number of bins
            strategy: Binning strategy
            
        Returns:
            DataFrame with binned features
        """
        from sklearn.preprocessing import KBinsDiscretizer
        
        logger.info(f"Creating binning features ({n_bins} bins, {strategy} strategy)...")
        
        X_new = X.copy()
        
        for feature in features:
            if feature not in X.columns:
                continue
            
            discretizer = KBinsDiscretizer(
                n_bins=n_bins,
                encode='ordinal',
                strategy=strategy
            )
            
            binned = discretizer.fit_transform(X[[feature]])
            X_new[f'{feature}_binned'] = binned
        
        logger.info(f"   Created {len(features)} binned features")
        
        return X_new
    
    # ==================== FEATURE SELECTION ====================
    
    def select_features(
        self,
        X: Union[pd.DataFrame, np.ndarray],
        y: Union[pd.Series, np.ndarray],
        method: str = 'mutual_info',  # mutual_info, f_score, correlation, importance
        k: int = 10
    ) -> Union[pd.DataFrame, np.ndarray]:
        """
        Select top k features using specified method.
        
        Args:
            X: Input features
            y: Target variable
            method: Selection method
            k: Number of features to select
            
        Returns:
            Selected features
            
        Example:
            >>> X_selected = engineer.select_features(X, y, method='mutual_info', k=15)
        """
        logger.info(f"Selecting features using {method} (k={k})...")
        
        is_dataframe = isinstance(X, pd.DataFrame)
        feature_names = list(X.columns) if is_dataframe else None
        
        if isinstance(X, pd.DataFrame):
            X_values = X.values
        else:
            X_values = X
        
        if isinstance(y, pd.Series):
            y_values = y.values
        else:
            y_values = y
        
        # Select method
        if method == 'mutual_info':
            selector = SelectKBest(mutual_info_classif, k=k)
        elif method == 'f_score':
            selector = SelectKBest(f_classif, k=k)
        elif method == 'correlation':
            return self._select_by_correlation(X, y, k)
        elif method == 'importance':
            return self._select_by_importance(X, y, k)
        else:
            raise ValueError(f"Unknown method: {method}")
        
        # Fit and transform
        X_selected = selector.fit_transform(X_values, y_values)
        
        # Get selected feature names
        if feature_names:
            mask = selector.get_support()
            self.selected_features_ = [f for f, m in zip(feature_names, mask) if m]
            
            logger.info(f"   Selected features: {self.selected_features_}")
            
            X_selected = pd.DataFrame(
                X_selected,
                columns=self.selected_features_,
                index=X.index if is_dataframe else None
            )
        
        return X_selected
    
    def _select_by_correlation(
        self,
        X: pd.DataFrame,
        y: Union[pd.Series, np.ndarray],
        k: int
    ) -> pd.DataFrame:
        """Select features by correlation with target"""
        
        # Calculate correlation with target
        correlations = X.corrwith(pd.Series(y)).abs()
        
        # Select top k
        top_features = correlations.nlargest(k).index.tolist()
        self.selected_features_ = top_features
        
        logger.info(f"   Top correlations: {correlations.nlargest(k).to_dict()}")
        
        return X[top_features]
    
    def _select_by_importance(
        self,
        X: Union[pd.DataFrame, np.ndarray],
        y: Union[pd.Series, np.ndarray],
        k: int
    ) -> Union[pd.DataFrame, np.ndarray]:
        """Select features by model importance"""
        
        # Train Random Forest to get importances
        rf = RandomForestClassifier(n_estimators=100, random_state=42)
        
        if isinstance(X, pd.DataFrame):
            feature_names = list(X.columns)
            X_values = X.values
        else:
            feature_names = None
            X_values = X
        
        rf.fit(X_values, y)
        
        # Get importances
        importances = rf.feature_importances_
        
        # Select top k
        top_indices = np.argsort(importances)[-k:][::-1]
        
        if feature_names:
            self.selected_features_ = [feature_names[i] for i in top_indices]
            logger.info(f"   Top features by importance: {self.selected_features_}")
            return X[self.selected_features_]
        else:
            return X_values[:, top_indices]
    
    def recursive_feature_elimination(
        self,
        X: Union[pd.DataFrame, np.ndarray],
        y: Union[pd.Series, np.ndarray],
        n_features_to_select: int = 10,
        step: int = 1
    ) -> Union[pd.DataFrame, np.ndarray]:
        """
        Recursive Feature Elimination (RFE).
        
        Args:
            X: Input features
            y: Target variable
            n_features_to_select: Number of features to select
            step: Number of features to remove at each iteration
            
        Returns:
            Selected features
        """
        logger.info(f"Running RFE (selecting {n_features_to_select} features)...")
        
        is_dataframe = isinstance(X, pd.DataFrame)
        feature_names = list(X.columns) if is_dataframe else None
        
        # Initialize estimator
        estimator = RandomForestClassifier(n_estimators=50, random_state=42)
        
        # RFE
        rfe = RFE(
            estimator=estimator,
            n_features_to_select=n_features_to_select,
            step=step
        )
        
        X_values = X.values if is_dataframe else X
        rfe.fit(X_values, y)
        
        # Get selected features
        if feature_names:
            mask = rfe.get_support()
            self.selected_features_ = [f for f, m in zip(feature_names, mask) if m]
            
            logger.info(f"   Selected features: {self.selected_features_}")
            
            return X[self.selected_features_]
        else:
            return X_values[:, rfe.get_support()]
    
    # ==================== FEATURE TRANSFORMATION ====================
    
    def apply_log_transform(
        self,
        X: pd.DataFrame,
        features: List[str]
    ) -> pd.DataFrame:
        """
        Apply log transformation to features.
        
        Args:
            X: Input DataFrame
            features: Features to transform
            
        Returns:
            DataFrame with log-transformed features
        """
        logger.info(f"Applying log transformation to {len(features)} features...")
        
        X_new = X.copy()
        
        for feature in features:
            if feature in X.columns:
                # Add small constant to avoid log(0)
                X_new[f'{feature}_log'] = np.log1p(X[feature])
        
        return X_new
    
    def apply_sqrt_transform(
        self,
        X: pd.DataFrame,
        features: List[str]
    ) -> pd.DataFrame:
        """Apply square root transformation"""
        
        logger.info(f"Applying sqrt transformation to {len(features)} features...")
        
        X_new = X.copy()
        
        for feature in features:
            if feature in X.columns:
                X_new[f'{feature}_sqrt'] = np.sqrt(np.abs(X[feature]))
        
        return X_new


# ==================== UTILITY FUNCTIONS ====================

def create_interaction_features(
    X: pd.DataFrame,
    feature1: str,
    feature2: str,
    operations: List[str] = ['multiply', 'add']
) -> pd.DataFrame:
    """
    Quick function to create interaction features.
    
    Args:
        X: Input DataFrame
        feature1: First feature
        feature2: Second feature
        operations: Operations to perform
        
    Returns:
        DataFrame with interaction features
    """
    engineer = FeatureEngineer()
    return engineer.create_interaction_features(
        X,
        feature_pairs=[(feature1, feature2)],
        operations=operations
    )


def create_polynomial_features(
    X: Union[pd.DataFrame, np.ndarray],
    degree: int = 2
) -> Union[pd.DataFrame, np.ndarray]:
    """
    Quick function to create polynomial features.
    
    Args:
        X: Input features
        degree: Polynomial degree
        
    Returns:
        Features with polynomial terms
    """
    engineer = FeatureEngineer()
    return engineer.create_polynomial_features(X, degree=degree)


def select_features_by_correlation(
    X: pd.DataFrame,
    y: Union[pd.Series, np.ndarray],
    k: int = 10
) -> pd.DataFrame:
    """
    Select top k features by correlation with target.
    
    Args:
        X: Input features
        y: Target variable
        k: Number of features
        
    Returns:
        Selected features
    """
    engineer = FeatureEngineer()
    return engineer.select_features(X, y, method='correlation', k=k)


def select_features_by_importance(
    X: Union[pd.DataFrame, np.ndarray],
    y: Union[pd.Series, np.ndarray],
    k: int = 10
) -> Union[pd.DataFrame, np.ndarray]:
    """
    Select top k features by importance.
    
    Args:
        X: Input features
        y: Target variable
        k: Number of features
        
    Returns:
        Selected features
    """
    engineer = FeatureEngineer()
    return engineer.select_features(X, y, method='importance', k=k)


def remove_correlated_features(
    X: pd.DataFrame,
    threshold: float = 0.95
) -> pd.DataFrame:
    """
    Remove highly correlated features.
    
    Args:
        X: Input DataFrame
        threshold: Correlation threshold
        
    Returns:
        DataFrame with correlated features removed
    """
    logger.info(f"Removing features with correlation > {threshold}...")
    
    # Calculate correlation matrix
    corr_matrix = X.corr().abs()
    
    # Get upper triangle
    upper = corr_matrix.where(
        np.triu(np.ones(corr_matrix.shape), k=1).astype(bool)
    )
    
    # Find features with correlation above threshold
    to_drop = [column for column in upper.columns if any(upper[column] > threshold)]
    
    logger.info(f"   Removing {len(to_drop)} correlated features: {to_drop}")
    
    return X.drop(columns=to_drop)


def create_domain_features_telecom(X: pd.DataFrame) -> pd.DataFrame:
    """
    Create domain-specific features for telecom churn prediction.
    
    Args:
        X: Input DataFrame with telecom data
        
    Returns:
        DataFrame with domain features
    """
    logger.info("Creating telecom domain-specific features...")
    
    X_new = X.copy()
    
    # Average monthly spend
    if 'TotalCharges' in X.columns and 'tenure' in X.columns:
        X_new['AvgMonthlySpend'] = X['TotalCharges'] / (X['tenure'] + 1)
    
    # Tenure groups
    if 'tenure' in X.columns:
        X_new['tenure_group'] = pd.cut(
            X['tenure'],
            bins=[0, 12, 24, 48, 72],
            labels=['0-12', '12-24', '24-48', '48+']
        )
    
    # Contract value (monthly charges * remaining months)
    if 'MonthlyCharges' in X.columns and 'Contract' in X.columns:
        contract_months = X['Contract'].map({
            'Month-to-month': 1,
            'One year': 12,
            'Two year': 24
        }).fillna(1)
        X_new['ContractValue'] = X['MonthlyCharges'] * contract_months
    
    # Service count (number of services subscribed)
    service_cols = [col for col in X.columns if 'Service' in col or col in [
        'PhoneService', 'InternetService', 'OnlineSecurity', 'OnlineBackup',
        'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies'
    ]]
    
    if service_cols:
        # Count 'Yes' values
        X_new['ServiceCount'] = (X[service_cols] == 'Yes').sum(axis=1)
    
    logger.info(f"   Created {len(X_new.columns) - len(X.columns)} domain features")
    
    return X_new
