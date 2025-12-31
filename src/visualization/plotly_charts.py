"""
📊 Plotly Charts
===============

Autor: Elizabeth Díaz Familia
"""

import plotly.express as px
import plotly.graph_objects as go
import pandas as pd

class PlotlyCharts:
    """Gráficos con Plotly"""
    
    @staticmethod
    def create_pie_chart(df: pd.DataFrame, column: str, title: str):
        """Crear gráfico de pastel"""
        fig = px.pie(df, names=column, title=title)
        return fig
    
    @staticmethod
    def create_bar_chart(df: pd.DataFrame, x: str, y: str, title: str):
        """Crear gráfico de barras"""
        fig = px.bar(df, x=x, y=y, title=title)
        return fig
    
    @staticmethod
    def create_line_chart(df: pd.DataFrame, x: str, y: str, title: str):
        """Crear gráfico de líneas"""
        fig = px.line(df, x=x, y=y, title=title)
        return fig
