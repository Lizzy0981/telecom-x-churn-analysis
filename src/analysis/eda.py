"""
🔍 Exploratory Data Analysis
============================

Autor: Elizabeth Díaz Familia
"""

import pandas as pd
import numpy as np
from typing import Dict, Any

class EDA:
    """Análisis Exploratorio de Datos"""
    
    def __init__(self, df: pd.DataFrame):
        self.df = df
        
    def get_summary(self) -> Dict[str, Any]:
        """Obtener resumen estadístico"""
        return {
            'shape': self.df.shape,
            'columns': list(self.df.columns),
            'dtypes': self.df.dtypes.to_dict(),
            'missing': self.df.isnull().sum().to_dict(),
            'duplicates': self.df.duplicated().sum()
        }
    
    def analyze_distribution(self, column: str) -> Dict:
        """Analizar distribución de una columna"""
        return {
            'mean': float(self.df[column].mean()),
            'median': float(self.df[column].median()),
            'std': float(self.df[column].std()),
            'min': float(self.df[column].min()),
            'max': float(self.df[column].max())
        }
