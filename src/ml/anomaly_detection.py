"""
🔍 Anomaly Detection
===================

Autor: Elizabeth Díaz Familia
"""

from sklearn.ensemble import IsolationForest

class AnomalyDetection:
    """Detección de anomalías"""
    
    @staticmethod
    def isolation_forest(X, contamination: float = 0.1):
        """Isolation Forest"""
        clf = IsolationForest(contamination=contamination, random_state=42)
        return clf.fit_predict(X)
