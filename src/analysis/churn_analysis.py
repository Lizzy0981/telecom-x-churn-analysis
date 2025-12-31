"""
💹 Churn Analysis
================

Autor: Elizabeth Díaz Familia
"""

import pandas as pd
from typing import Dict

class ChurnAnalysis:
    """Análisis de churn"""
    
    @staticmethod
    def calculate_churn_rate(df: pd.DataFrame, churn_col: str = 'Churn') -> float:
        """Calcular tasa de churn"""
        return (df[churn_col] == 'Yes').mean()
    
    @staticmethod
    def churn_by_segment(df: pd.DataFrame, segment_col: str, churn_col: str = 'Churn') -> Dict:
        """Analizar churn por segmento"""
        return df.groupby(segment_col)[churn_col].apply(
            lambda x: (x == 'Yes').mean()
        ).to_dict()
