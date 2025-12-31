"""
📈 Statistical Analysis
======================

Autor: Elizabeth Díaz Familia
"""

from scipy import stats
import pandas as pd
from typing import Tuple

class StatisticalAnalysis:
    """Análisis estadístico"""
    
    @staticmethod
    def chi_square_test(df: pd.DataFrame, col1: str, col2: str) -> Tuple[float, float]:
        """Test Chi-cuadrado"""
        contingency = pd.crosstab(df[col1], df[col2])
        chi2, p_value, dof, expected = stats.chi2_contingency(contingency)
        return chi2, p_value
    
    @staticmethod
    def t_test(group1: pd.Series, group2: pd.Series) -> Tuple[float, float]:
        """Test t de Student"""
        return stats.ttest_ind(group1, group2)
