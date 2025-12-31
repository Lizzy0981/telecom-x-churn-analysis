"""
🔧 Feature Engineering
=====================

Autor: Elizabeth Díaz Familia
"""

import pandas as pd

class FeatureEngineering:
    """Ingeniería de características"""
    
    @staticmethod
    def create_interaction_features(df, col1: str, col2: str):
        """Crear características de interacción"""
        df[f'{col1}_{col2}_interaction'] = df[col1] * df[col2]
        return df
