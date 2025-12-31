"""
📊 Report Generator
==================

Autor: Elizabeth Díaz Familia
"""

from .csv_exporter import CSVExporter
from .excel_exporter import ExcelExporter
from .pdf_exporter import PDFExporter

class ReportGenerator:
    """Generador de reportes"""
    
    def __init__(self):
        self.csv_exporter = CSVExporter()
        self.excel_exporter = ExcelExporter()
        self.pdf_exporter = PDFExporter()
        
    def generate_all(self, df, base_filename: str):
        """Generar todos los formatos"""
        paths = {
            'csv': self.csv_exporter.export(df, f'{base_filename}.csv'),
            'excel': self.excel_exporter.export(df, f'{base_filename}.xlsx')
        }
        return paths
