"""
🔗 Correlation Analysis
======================

Autor: Elizabeth Díaz Familia
"""

import pandas as pd
import numpy as np

class CorrelationAnalysis:
    """Análisis de correlaciones"""
    
    @staticmethod
    def calculate_correlation_matrix(df: pd.DataFrame) -> pd.DataFrame:
        """Calcular matriz de correlación"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        return df[numeric_cols].corr()
    
    @staticmethod
    def find_high_correlations(corr_matrix: pd.DataFrame, threshold: float = 0.7) -> list:
        """Encontrar correlaciones altas"""
        high_corr = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                if abs(corr_matrix.iloc[i, j]) > threshold:
                    high_corr.append((
                        corr_matrix.columns[i],
                        corr_matrix.columns[j],
                        corr_matrix.iloc[i, j]
                    ))
        return high_corr
