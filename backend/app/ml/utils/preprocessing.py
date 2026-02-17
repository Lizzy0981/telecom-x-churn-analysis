# backend/app/ml/utils/preprocessing.py
"""
Data Preprocessing
==================

Comprehensive data preprocessing utilities for cleaning, encoding,
scaling, and validating data for machine learning.

Preprocessing Steps:
    1. Data validation and quality checks
    2. Missing value handling
    3. Outlier detection and treatment
    4. Categorical encoding
    5. Numerical scaling
    6. Data type conversion
    7. Feature transformation

Missing Value Strategies:
    - Mean/median/mode imputation
    - Forward/backward fill
    - Interpolation
    - KNN imputation
    - Iterative imputation

Encoding Methods:
    - One-Hot Encoding (nominal categories)
    - Label Encoding (ordinal categories)
    - Target Encoding (high cardinality)
    - Ordinal Encoding (ordered categories)
    - Binary Encoding
    - Frequency Encoding

Scaling Methods:
    - StandardScaler (mean=0, std=1)
    - MinMaxScaler (range [0,1])
    - RobustScaler (resistant to outliers)
    - MaxAbsScaler (range [-1,1])
    - Normalizer (unit norm)

Outlier Detection:
    - IQR method
    - Z-score method
    - Isolation Forest
    - Local Outlier Factor

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Dict, Any, List, Optional, Tuple, Union
import numpy as np
import pandas as pd
from sklearn.preprocessing import (
    StandardScaler, MinMaxScaler, RobustScaler,
    LabelEncoder, OneHotEncoder
)
from sklearn.impute import SimpleImputer, KNNImputer
import logging

logger = logging.getLogger(__name__)


class DataPreprocessor:
    """
    Comprehensive data preprocessing pipeline.
    
    Handles missing values, outliers, encoding, and scaling with
    support for both training and inference modes.
    
    Example:
        >>> preprocessor = DataPreprocessor()
        >>> # Fit on training data
        >>> X_train_processed = preprocessor.fit_transform(X_train)
        >>> # Transform test data
        >>> X_test_processed = preprocessor.transform(X_test)
    """
    
    def __init__(
        self,
        handle_missing: bool = True,
        missing_strategy: str = 'mean',  # mean, median, mode, knn
        encode_categorical: bool = True,
        encoding_method: str = 'onehot',  # onehot, label, target
        scale_numerical: bool = True,
        scaling_method: str = 'standard',  # standard, minmax, robust
        handle_outliers: bool = False,
        outlier_method: str = 'iqr'  # iqr, zscore, isolation
    ):
        """
        Initialize Data Preprocessor.
        
        Args:
            handle_missing: Whether to handle missing values
            missing_strategy: Strategy for imputation
            encode_categorical: Whether to encode categorical features
            encoding_method: Method for encoding
            scale_numerical: Whether to scale numerical features
            scaling_method: Method for scaling
            handle_outliers: Whether to handle outliers
            outlier_method: Method for outlier detection
        """
        self.handle_missing = handle_missing
        self.missing_strategy = missing_strategy
        self.encode_categorical = encode_categorical
        self.encoding_method = encoding_method
        self.scale_numerical = scale_numerical
        self.scaling_method = scaling_method
        self.handle_outliers = handle_outliers
        self.outlier_method = outlier_method
        
        # Components
        self.imputer: Optional[Any] = None
        self.encoders: Dict[str, Any] = {}
        self.scaler: Optional[Any] = None
        
        # Metadata
        self.numerical_features_: Optional[List[str]] = None
        self.categorical_features_: Optional[List[str]] = None
        self.feature_names_: Optional[List[str]] = None
        self.is_fitted = False
        
        logger.info("🧹 DataPreprocessor initialized")
        logger.info(f"   Missing: {missing_strategy if handle_missing else 'disabled'}")
        logger.info(f"   Encoding: {encoding_method if encode_categorical else 'disabled'}")
        logger.info(f"   Scaling: {scaling_method if scale_numerical else 'disabled'}")
    
    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> 'DataPreprocessor':
        """
        Fit preprocessor on training data.
        
        Args:
            X: Training features
            y: Training labels (for target encoding)
            
        Returns:
            self: Fitted preprocessor
        """
        logger.info("=" * 60)
        logger.info("🔄 FITTING PREPROCESSOR")
        logger.info("=" * 60)
        
        X = X.copy()
        
        # Identify feature types
        self._identify_feature_types(X)
        
        # Fit missing value imputer
        if self.handle_missing:
            self._fit_imputer(X)
            X = self._impute_missing(X)
        
        # Fit encoders
        if self.encode_categorical and self.categorical_features_:
            self._fit_encoders(X, y)
            X = self._encode_features(X)
        
        # Handle outliers
        if self.handle_outliers:
            X = self._handle_outliers(X)
        
        # Fit scaler
        if self.scale_numerical and self.numerical_features_:
            self._fit_scaler(X)
        
        self.is_fitted = True
        
        logger.info("=" * 60)
        logger.info("✅ PREPROCESSOR FITTED")
        logger.info("=" * 60)
        
        return self
    
    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Transform data using fitted preprocessor.
        
        Args:
            X: Features to transform
            
        Returns:
            Transformed features
        """
        if not self.is_fitted:
            raise ValueError("Preprocessor not fitted. Call fit() first.")
        
        X = X.copy()
        
        # Impute missing values
        if self.handle_missing and self.imputer is not None:
            X = self._impute_missing(X)
        
        # Encode categorical
        if self.encode_categorical and self.encoders:
            X = self._encode_features(X)
        
        # Handle outliers
        if self.handle_outliers:
            X = self._handle_outliers(X)
        
        # Scale numerical
        if self.scale_numerical and self.scaler is not None:
            X = self._scale_features(X)
        
        return X
    
    def fit_transform(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> pd.DataFrame:
        """
        Fit and transform in one step.
        
        Args:
            X: Training features
            y: Training labels
            
        Returns:
            Transformed features
        """
        return self.fit(X, y).transform(X)
    
    # ==================== PRIVATE METHODS ====================
    
    def _identify_feature_types(self, X: pd.DataFrame):
        """Identify numerical and categorical features"""
        
        self.numerical_features_ = X.select_dtypes(
            include=[np.number]
        ).columns.tolist()
        
        self.categorical_features_ = X.select_dtypes(
            include=['object', 'category']
        ).columns.tolist()
        
        self.feature_names_ = list(X.columns)
        
        logger.info(f"\n📊 Feature Types:")
        logger.info(f"   Numerical: {len(self.numerical_features_)}")
        logger.info(f"   Categorical: {len(self.categorical_features_)}")
    
    def _fit_imputer(self, X: pd.DataFrame):
        """Fit missing value imputer"""
        
        logger.info(f"\n💧 Fitting {self.missing_strategy} imputer...")
        
        # Check for missing values
        missing_counts = X.isnull().sum()
        has_missing = missing_counts[missing_counts > 0]
        
        if len(has_missing) > 0:
            logger.info(f"   Features with missing values: {len(has_missing)}")
            
            if self.missing_strategy in ['mean', 'median', 'most_frequent']:
                self.imputer = SimpleImputer(strategy=self.missing_strategy)
            elif self.missing_strategy == 'knn':
                self.imputer = KNNImputer(n_neighbors=5)
            else:
                self.imputer = SimpleImputer(strategy='mean')
            
            # Fit on numerical features
            if self.numerical_features_:
                self.imputer.fit(X[self.numerical_features_])
        else:
            logger.info("   No missing values found")
    
    def _impute_missing(self, X: pd.DataFrame) -> pd.DataFrame:
        """Impute missing values"""
        
        if self.imputer is None:
            return X
        
        X = X.copy()
        
        # Impute numerical features
        if self.numerical_features_:
            X[self.numerical_features_] = self.imputer.transform(
                X[self.numerical_features_]
            )
        
        # Impute categorical with mode
        for col in self.categorical_features_:
            if X[col].isnull().any():
                mode_value = X[col].mode()[0] if len(X[col].mode()) > 0 else 'Unknown'
                X[col].fillna(mode_value, inplace=True)
        
        return X
    
    def _fit_encoders(self, X: pd.DataFrame, y: Optional[pd.Series] = None):
        """Fit categorical encoders"""
        
        logger.info(f"\n🔤 Fitting {self.encoding_method} encoders...")
        
        for col in self.categorical_features_:
            if self.encoding_method == 'label':
                encoder = LabelEncoder()
                encoder.fit(X[col].astype(str))
                self.encoders[col] = encoder
            
            elif self.encoding_method == 'onehot':
                encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
                encoder.fit(X[[col]])
                self.encoders[col] = encoder
        
        logger.info(f"   Fitted encoders for {len(self.encoders)} features")
    
    def _encode_features(self, X: pd.DataFrame) -> pd.DataFrame:
        """Encode categorical features"""
        
        X = X.copy()
        
        for col, encoder in self.encoders.items():
            if col not in X.columns:
                continue
            
            if isinstance(encoder, LabelEncoder):
                # Label encoding
                X[col] = encoder.transform(X[col].astype(str))
            
            elif isinstance(encoder, OneHotEncoder):
                # One-hot encoding
                encoded = encoder.transform(X[[col]])
                
                # Get feature names
                feature_names = [f"{col}_{cat}" for cat in encoder.categories_[0]]
                
                # Create DataFrame
                encoded_df = pd.DataFrame(
                    encoded,
                    columns=feature_names,
                    index=X.index
                )
                
                # Drop original column and concat encoded
                X = X.drop(columns=[col])
                X = pd.concat([X, encoded_df], axis=1)
        
        return X
    
    def _fit_scaler(self, X: pd.DataFrame):
        """Fit numerical scaler"""
        
        logger.info(f"\n📏 Fitting {self.scaling_method} scaler...")
        
        if self.scaling_method == 'standard':
            self.scaler = StandardScaler()
        elif self.scaling_method == 'minmax':
            self.scaler = MinMaxScaler()
        elif self.scaling_method == 'robust':
            self.scaler = RobustScaler()
        else:
            self.scaler = StandardScaler()
        
        # Fit on numerical features
        numerical_cols = [col for col in self.numerical_features_ if col in X.columns]
        if numerical_cols:
            self.scaler.fit(X[numerical_cols])
    
    def _scale_features(self, X: pd.DataFrame) -> pd.DataFrame:
        """Scale numerical features"""
        
        if self.scaler is None:
            return X
        
        X = X.copy()
        
        numerical_cols = [col for col in self.numerical_features_ if col in X.columns]
        if numerical_cols:
            X[numerical_cols] = self.scaler.transform(X[numerical_cols])
        
        return X
    
    def _handle_outliers(self, X: pd.DataFrame) -> pd.DataFrame:
        """Handle outliers"""
        
        logger.info(f"\n🔍 Handling outliers using {self.outlier_method}...")
        
        X = X.copy()
        
        for col in self.numerical_features_:
            if col not in X.columns:
                continue
            
            if self.outlier_method == 'iqr':
                Q1 = X[col].quantile(0.25)
                Q3 = X[col].quantile(0.75)
                IQR = Q3 - Q1
                
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                # Clip outliers
                X[col] = X[col].clip(lower_bound, upper_bound)
            
            elif self.outlier_method == 'zscore':
                mean = X[col].mean()
                std = X[col].std()
                
                # Remove values > 3 standard deviations
                X[col] = X[col].clip(mean - 3*std, mean + 3*std)
        
        return X


# ==================== UTILITY FUNCTIONS ====================

def handle_missing_values(
    X: pd.DataFrame,
    strategy: str = 'mean',
    fill_value: Optional[Any] = None
) -> pd.DataFrame:
    """
    Handle missing values in DataFrame.
    
    Args:
        X: Input DataFrame
        strategy: Imputation strategy
        fill_value: Custom fill value
        
    Returns:
        DataFrame with missing values handled
    """
    logger.info(f"Handling missing values (strategy: {strategy})...")
    
    X = X.copy()
    
    # Check for missing
    missing_count = X.isnull().sum().sum()
    
    if missing_count == 0:
        logger.info("   No missing values found")
        return X
    
    logger.info(f"   Total missing values: {missing_count}")
    
    if fill_value is not None:
        X.fillna(fill_value, inplace=True)
    else:
        # Numerical columns
        numerical_cols = X.select_dtypes(include=[np.number]).columns
        
        if strategy == 'mean':
            X[numerical_cols] = X[numerical_cols].fillna(X[numerical_cols].mean())
        elif strategy == 'median':
            X[numerical_cols] = X[numerical_cols].fillna(X[numerical_cols].median())
        
        # Categorical columns
        categorical_cols = X.select_dtypes(include=['object']).columns
        X[categorical_cols] = X[categorical_cols].fillna(X[categorical_cols].mode().iloc[0])
    
    logger.info("   ✅ Missing values handled")
    
    return X


def encode_categorical_features(
    X: pd.DataFrame,
    method: str = 'onehot',
    columns: Optional[List[str]] = None
) -> pd.DataFrame:
    """
    Encode categorical features.
    
    Args:
        X: Input DataFrame
        method: Encoding method (onehot, label)
        columns: Specific columns to encode
        
    Returns:
        DataFrame with encoded features
    """
    logger.info(f"Encoding categorical features ({method})...")
    
    X = X.copy()
    
    if columns is None:
        columns = X.select_dtypes(include=['object', 'category']).columns.tolist()
    
    if method == 'onehot':
        X = pd.get_dummies(X, columns=columns, drop_first=True)
    
    elif method == 'label':
        for col in columns:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
    
    logger.info(f"   Encoded {len(columns)} columns")
    
    return X


def scale_numerical_features(
    X: pd.DataFrame,
    method: str = 'standard',
    columns: Optional[List[str]] = None
) -> pd.DataFrame:
    """
    Scale numerical features.
    
    Args:
        X: Input DataFrame
        method: Scaling method
        columns: Specific columns to scale
        
    Returns:
        DataFrame with scaled features
    """
    logger.info(f"Scaling numerical features ({method})...")
    
    X = X.copy()
    
    if columns is None:
        columns = X.select_dtypes(include=[np.number]).columns.tolist()
    
    if method == 'standard':
        scaler = StandardScaler()
    elif method == 'minmax':
        scaler = MinMaxScaler()
    elif method == 'robust':
        scaler = RobustScaler()
    else:
        scaler = StandardScaler()
    
    X[columns] = scaler.fit_transform(X[columns])
    
    logger.info(f"   Scaled {len(columns)} columns")
    
    return X


def detect_outliers(
    X: pd.DataFrame,
    method: str = 'iqr',
    columns: Optional[List[str]] = None
) -> pd.DataFrame:
    """
    Detect outliers in numerical columns.
    
    Args:
        X: Input DataFrame
        method: Detection method (iqr, zscore)
        columns: Columns to check
        
    Returns:
        Boolean DataFrame indicating outliers
    """
    logger.info(f"Detecting outliers ({method})...")
    
    if columns is None:
        columns = X.select_dtypes(include=[np.number]).columns.tolist()
    
    outliers = pd.DataFrame(False, index=X.index, columns=columns)
    
    for col in columns:
        if method == 'iqr':
            Q1 = X[col].quantile(0.25)
            Q3 = X[col].quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers[col] = (X[col] < lower_bound) | (X[col] > upper_bound)
        
        elif method == 'zscore':
            z_scores = np.abs((X[col] - X[col].mean()) / X[col].std())
            outliers[col] = z_scores > 3
    
    total_outliers = outliers.sum().sum()
    logger.info(f"   Detected {total_outliers} outliers")
    
    return outliers


def remove_outliers(
    X: pd.DataFrame,
    y: Optional[pd.Series] = None,
    method: str = 'iqr'
) -> Union[pd.DataFrame, Tuple[pd.DataFrame, pd.Series]]:
    """
    Remove outlier rows from DataFrame.
    
    Args:
        X: Input DataFrame
        y: Optional target Series
        method: Detection method
        
    Returns:
        DataFrame with outliers removed (and y if provided)
    """
    outliers = detect_outliers(X, method=method)
    
    # Remove rows with any outlier
    mask = ~outliers.any(axis=1)
    X_clean = X[mask]
    
    removed = len(X) - len(X_clean)
    logger.info(f"   Removed {removed} rows ({removed/len(X)*100:.2f}%)")
    
    if y is not None:
        y_clean = y[mask]
        return X_clean, y_clean
    
    return X_clean


def validate_data_quality(X: pd.DataFrame) -> Dict[str, Any]:
    """
    Validate data quality and return report.
    
    Args:
        X: Input DataFrame
        
    Returns:
        Dict with quality metrics
    """
    logger.info("Validating data quality...")
    
    report = {
        'n_samples': len(X),
        'n_features': len(X.columns),
        'missing_values': X.isnull().sum().to_dict(),
        'missing_percentage': (X.isnull().sum() / len(X) * 100).to_dict(),
        'duplicates': X.duplicated().sum(),
        'data_types': X.dtypes.to_dict()
    }
    
    # Numerical statistics
    numerical_cols = X.select_dtypes(include=[np.number]).columns
    if len(numerical_cols) > 0:
        report['numerical_summary'] = X[numerical_cols].describe().to_dict()
    
    # Categorical statistics
    categorical_cols = X.select_dtypes(include=['object']).columns
    if len(categorical_cols) > 0:
        report['categorical_summary'] = {
            col: X[col].value_counts().to_dict()
            for col in categorical_cols
        }
    
    logger.info("   ✅ Quality validation complete")
    
    return report
