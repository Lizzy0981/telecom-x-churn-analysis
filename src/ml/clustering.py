"""
🎯 Clustering
============

Autor: Elizabeth Díaz Familia
"""

from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler

class Clustering:
    """Algoritmos de clustering"""
    
    @staticmethod
    def kmeans(X, n_clusters: int = 3):
        """K-Means clustering"""
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        return kmeans.fit_predict(X_scaled)
