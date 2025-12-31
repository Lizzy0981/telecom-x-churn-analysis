"""
📈 Matplotlib Charts
===================

Autor: Elizabeth Díaz Familia
"""

import matplotlib.pyplot as plt
import seaborn as sns

class MatplotlibCharts:
    """Gráficos con Matplotlib"""
    
    @staticmethod
    def create_histogram(data, title: str, xlabel: str):
        """Crear histograma"""
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.hist(data, bins=30, edgecolor='black')
        ax.set_title(title)
        ax.set_xlabel(xlabel)
        ax.set_ylabel('Frequency')
        return fig
