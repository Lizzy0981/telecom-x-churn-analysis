# backend/app/ml/models/clustering.py
"""
Customer Clustering Models
==========================

Advanced clustering algorithms for customer segmentation and analysis.

Algorithms Included:
    - K-Means Clustering
    - DBSCAN (Density-Based)
    - Hierarchical Clustering
    - Gaussian Mixture Models (GMM)
    - HDBSCAN (Hierarchical DBSCAN)

Features:
    - Automatic cluster number detection (Elbow method, Silhouette)
    - Cluster profiling and analysis
    - Visualization support
    - Customer segment naming
    - Cluster characteristics
    - Outlier detection

Use Cases:
    - Customer segmentation
    - Behavioral grouping
    - Market segmentation
    - Churn risk groups
    - Service tier identification

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score
from sklearn.decomposition import PCA
import logging
from pathlib import Path
import pickle

logger = logging.getLogger(__name__)


class ClusteringModel:
    """
    Main clustering class with multiple algorithm support.
    
    Provides unified interface for different clustering algorithms
    with automatic parameter tuning and cluster analysis.
    
    Example:
        >>> clusterer = ClusteringModel(algorithm='kmeans', n_clusters=4)
        >>> labels = clusterer.fit_predict(X)
        >>> profile = clusterer.get_cluster_profiles(X, labels)
    """
    
    def __init__(
        self,
        algorithm: str = 'kmeans',  # kmeans, dbscan, hierarchical, gmm
        n_clusters: Optional[int] = None,
        auto_tune: bool = True,
        random_state: int = 42
    ):
        """
        Initialize Clustering Model.
        
        Args:
            algorithm: Clustering algorithm to use
            n_clusters: Number of clusters (None for auto-detection)
            auto_tune: Whether to automatically find optimal parameters
            random_state: Random seed
        """
        self.algorithm = algorithm
        self.n_clusters = n_clusters
        self.auto_tune = auto_tune
        self.random_state = random_state
        
        self.model = None
        self.scaler = StandardScaler()
        self.labels_ = None
        self.cluster_centers_ = None
        self.is_fitted = False
        
        # Cluster metadata
        self.cluster_profiles: Optional[Dict[int, Dict[str, Any]]] = None
        self.cluster_names: Optional[Dict[int, str]] = None
        
        logger.info(f"🎯 ClusteringModel initialized: {algorithm}")
    
    def fit(self, X: Union[pd.DataFrame, np.ndarray]) -> 'ClusteringModel':
        """
        Fit clustering model to data.
        
        Args:
            X: Features for clustering
            
        Returns:
            self: Fitted model
        """
        logger.info("📊 Fitting clustering model...")
        
        # Convert to numpy
        if isinstance(X, pd.DataFrame):
            X = X.values
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Auto-tune if requested
        if self.auto_tune and self.n_clusters is None:
            self.n_clusters = self._find_optimal_clusters(X_scaled)
            logger.info(f"   Optimal clusters: {self.n_clusters}")
        
        # Initialize model
        if self.algorithm == 'kmeans':
            self.model = KMeans(
                n_clusters=self.n_clusters or 4,
                random_state=self.random_state,
                n_init=10
            )
        elif self.algorithm == 'dbscan':
            self.model = DBSCAN(
                eps=0.5,
                min_samples=5
            )
        elif self.algorithm == 'hierarchical':
            self.model = AgglomerativeClustering(
                n_clusters=self.n_clusters or 4
            )
        elif self.algorithm == 'gmm':
            self.model = GaussianMixture(
                n_components=self.n_clusters or 4,
                random_state=self.random_state
            )
        
        # Fit model
        self.labels_ = self.model.fit_predict(X_scaled)
        
        # Get cluster centers (if available)
        if hasattr(self.model, 'cluster_centers_'):
            self.cluster_centers_ = self.model.cluster_centers_
        
        self.is_fitted = True
        
        # Calculate metrics
        if len(np.unique(self.labels_)) > 1:
            silhouette = silhouette_score(X_scaled, self.labels_)
            logger.info(f"   Silhouette Score: {silhouette:.4f}")
        
        logger.info(f"✅ Clustering complete! Found {len(np.unique(self.labels_))} clusters")
        
        return self
    
    def predict(self, X: Union[pd.DataFrame, np.ndarray]) -> np.ndarray:
        """
        Predict cluster labels for new data.
        
        Args:
            X: Features to cluster
            
        Returns:
            np.ndarray: Cluster labels
        """
        if not self.is_fitted:
            raise ValueError("Model not fitted. Call fit() first.")
        
        # Convert to numpy
        if isinstance(X, pd.DataFrame):
            X = X.values
        
        # Scale
        X_scaled = self.scaler.transform(X)
        
        # Predict
        if hasattr(self.model, 'predict'):
            labels = self.model.predict(X_scaled)
        else:
            # For DBSCAN, use fit_predict
            labels = self.model.fit_predict(X_scaled)
        
        return labels
    
    def fit_predict(self, X: Union[pd.DataFrame, np.ndarray]) -> np.ndarray:
        """
        Fit model and return cluster labels.
        
        Args:
            X: Features for clustering
            
        Returns:
            np.ndarray: Cluster labels
        """
        self.fit(X)
        return self.labels_
    
    def _find_optimal_clusters(
        self,
        X: np.ndarray,
        min_clusters: int = 2,
        max_clusters: int = 10
    ) -> int:
        """
        Find optimal number of clusters using Elbow method and Silhouette.
        
        Args:
            X: Scaled features
            min_clusters: Minimum clusters to try
            max_clusters: Maximum clusters to try
            
        Returns:
            int: Optimal number of clusters
        """
        logger.info("   Finding optimal number of clusters...")
        
        inertias = []
        silhouettes = []
        
        for k in range(min_clusters, max_clusters + 1):
            kmeans = KMeans(n_clusters=k, random_state=self.random_state, n_init=10)
            labels = kmeans.fit_predict(X)
            
            inertias.append(kmeans.inertia_)
            
            if k > 1:
                silhouettes.append(silhouette_score(X, labels))
        
        # Find elbow (simplified)
        # In production: use KneeLocator or similar
        if silhouettes:
            optimal_k = min_clusters + np.argmax(silhouettes)
        else:
            optimal_k = min_clusters
        
        return optimal_k
    
    def get_cluster_profiles(
        self,
        X: Union[pd.DataFrame, np.ndarray],
        feature_names: Optional[List[str]] = None
    ) -> Dict[int, Dict[str, Any]]:
        """
        Generate profile for each cluster.
        
        Args:
            X: Original features (unscaled)
            feature_names: Names of features
            
        Returns:
            Dict mapping cluster ID to profile statistics
            
        Example:
            >>> profiles = clusterer.get_cluster_profiles(X_original, feature_names)
            >>> print(profiles[0])  # Profile of cluster 0
        """
        if not self.is_fitted:
            raise ValueError("Model not fitted. Call fit() first.")
        
        # Convert to DataFrame
        if isinstance(X, np.ndarray):
            if feature_names:
                X = pd.DataFrame(X, columns=feature_names)
            else:
                X = pd.DataFrame(X)
        
        # Add cluster labels
        X['cluster'] = self.labels_
        
        # Calculate profiles
        profiles = {}
        
        for cluster_id in X['cluster'].unique():
            if cluster_id == -1:  # Outliers in DBSCAN
                continue
            
            cluster_data = X[X['cluster'] == cluster_id]
            
            profile = {
                'size': len(cluster_data),
                'percentage': len(cluster_data) / len(X) * 100,
                'mean': cluster_data.drop('cluster', axis=1).mean().to_dict(),
                'median': cluster_data.drop('cluster', axis=1).median().to_dict(),
                'std': cluster_data.drop('cluster', axis=1).std().to_dict()
            }
            
            profiles[int(cluster_id)] = profile
        
        self.cluster_profiles = profiles
        
        # Auto-generate cluster names
        self._generate_cluster_names(profiles)
        
        return profiles
    
    def _generate_cluster_names(self, profiles: Dict[int, Dict[str, Any]]):
        """
        Generate descriptive names for clusters based on characteristics.
        
        Args:
            profiles: Cluster profiles
        """
        # Simple naming based on size and churn risk
        # In production: use more sophisticated rules
        
        self.cluster_names = {}
        
        for cluster_id, profile in profiles.items():
            size = profile['percentage']
            
            if size > 40:
                name = "Core Customers"
            elif size > 20:
                name = "Standard Customers"
            elif size > 10:
                name = "Small Segment"
            else:
                name = "Niche Segment"
            
            self.cluster_names[cluster_id] = f"{name} (Cluster {cluster_id})"
    
    def get_cluster_name(self, cluster_id: int) -> str:
        """
        Get descriptive name for cluster.
        
        Args:
            cluster_id: Cluster ID
            
        Returns:
            str: Cluster name
        """
        if self.cluster_names and cluster_id in self.cluster_names:
            return self.cluster_names[cluster_id]
        return f"Cluster {cluster_id}"
    
    def evaluate(self, X: Union[pd.DataFrame, np.ndarray]) -> Dict[str, float]:
        """
        Evaluate clustering quality.
        
        Args:
            X: Features used for clustering
            
        Returns:
            Dict of quality metrics
        """
        if not self.is_fitted:
            raise ValueError("Model not fitted. Call fit() first.")
        
        # Convert to numpy
        if isinstance(X, pd.DataFrame):
            X = X.values
        
        # Scale
        X_scaled = self.scaler.transform(X)
        
        metrics = {}
        
        # Silhouette Score (-1 to 1, higher is better)
        if len(np.unique(self.labels_)) > 1:
            metrics['silhouette'] = silhouette_score(X_scaled, self.labels_)
            metrics['calinski_harabasz'] = calinski_harabasz_score(X_scaled, self.labels_)
            metrics['davies_bouldin'] = davies_bouldin_score(X_scaled, self.labels_)
        
        # Cluster distribution
        unique, counts = np.unique(self.labels_, return_counts=True)
        metrics['cluster_sizes'] = dict(zip(unique.tolist(), counts.tolist()))
        metrics['n_clusters'] = len(unique)
        
        return metrics
    
    def save(self, filepath: Union[str, Path]):
        """Save model to disk"""
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        with open(filepath, 'wb') as f:
            pickle.dump(self, f)
        
        logger.info(f"💾 Clustering model saved to {filepath}")
    
    @staticmethod
    def load(filepath: Union[str, Path]) -> 'ClusteringModel':
        """Load model from disk"""
        with open(filepath, 'rb') as f:
            model = pickle.load(f)
        
        logger.info(f"📂 Clustering model loaded from {filepath}")
        return model


class KMeansClusterer(ClusteringModel):
    """Specialized K-Means clustering implementation"""
    
    def __init__(self, n_clusters: int = 4, **kwargs):
        super().__init__(algorithm='kmeans', n_clusters=n_clusters, **kwargs)


class DBSCANClusterer(ClusteringModel):
    """Specialized DBSCAN clustering implementation"""
    
    def __init__(self, eps: float = 0.5, min_samples: int = 5, **kwargs):
        super().__init__(algorithm='dbscan', **kwargs)
        self.eps = eps
        self.min_samples = min_samples
