"""
🎨 Seaborn Charts
================

Autor: Elizabeth Díaz Familia
"""

import seaborn as sns
import matplotlib.pyplot as plt

class SeabornCharts:
    """Gráficos con Seaborn"""
    
    @staticmethod
    def create_heatmap(corr_matrix, title: str):
        """Crear mapa de calor"""
        fig, ax = plt.subplots(figsize=(12, 10))
        sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='coolwarm', ax=ax)
        ax.set_title(title)
        return fig
