"""
📄 PDF Exporter
==============

Autor: Elizabeth Díaz Familia
"""

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from pathlib import Path

class PDFExporter:
    """Exportador PDF"""
    
    def __init__(self, output_dir: str = 'reports/pdf'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def export_simple(self, text: str, filename: str):
        """Exportar texto simple a PDF"""
        filepath = self.output_dir / filename
        c = canvas.Canvas(str(filepath), pagesize=letter)
        c.drawString(100, 750, text)
        c.save()
        print(f"✅ PDF exportado: {filepath}")
        return str(filepath)
