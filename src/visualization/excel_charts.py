"""
📊 Excel Native Charts
=====================

Autor: Elizabeth Díaz Familia
"""

from openpyxl.chart import PieChart, BarChart, LineChart
from openpyxl.chart.reference import Reference

class ExcelCharts:
    """Gráficos nativos de Excel"""
    
    @staticmethod
    def add_pie_chart(worksheet, data_range, title: str, position: str):
        """Agregar gráfico de pastel"""
        pie = PieChart()
        pie.title = title
        labels = Reference(worksheet, min_col=1, min_row=2, max_row=data_range)
        data = Reference(worksheet, min_col=2, min_row=1, max_row=data_range)
        pie.add_data(data, titles_from_data=True)
        pie.set_categories(labels)
        worksheet.add_chart(pie, position)
