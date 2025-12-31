"""
🎯 Customer Segmentation
=======================

Autor: Elizabeth Díaz Familia
"""

import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

class CustomerSegmentation:
    """Segmentación de clientes"""
    
    def __init__(self, n_clusters: int = 3):
        self.n_clusters = n_clusters
        self.scaler = StandardScaler()
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        
    def segment_customers(self, df: pd.DataFrame, features: list) -> pd.DataFrame:
        """Segmentar clientes usando K-Means"""
        X = df[features].fillna(0)
        X_scaled = self.scaler.fit_transform(X)
        df['Segment'] = self.kmeans.fit_predict(X_scaled)
        return df
