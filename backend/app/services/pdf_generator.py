# backend/app/services/pdf_generator.py
"""PDF Generator - Professional Reports
Author: Elizabeth Díaz Familia"""

from typing import Dict, Any
import pandas as pd
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class PDFGenerator:
    """Generate PDF reports"""
    
    def __init__(self):
        logger.info("📄 PDFGenerator initialized")
    
    def generate(self, data: pd.DataFrame, filepath: Path, title: str = "Report", **kwargs):
        """Generate PDF report"""
        logger.info(f"📄 Generating PDF: {filepath}")
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Use reportlab for PDF generation
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
            from reportlab.lib.styles import getSampleStyleSheet
            from reportlab.lib import colors
            
            doc = SimpleDocTemplate(str(filepath), pagesize=letter)
            elements = []
            styles = getSampleStyleSheet()
            
            # Title
            elements.append(Paragraph(title, styles['Title']))
            
            # Table
            table_data = [data.columns.tolist()] + data.head(50).values.tolist()
            t = Table(table_data)
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(t)
            
            doc.build(elements)
            logger.info(f"   ✅ PDF generated")
        
        except ImportError:
            logger.warning("reportlab not installed, creating simple text file")
            with open(filepath.with_suffix('.txt'), 'w') as f:
                f.write(f"{title}\n\n{data.to_string()}")

def generate_pdf_report(data: pd.DataFrame, filepath: Path, **kwargs):
    generator = PDFGenerator()
    generator.generate(data, filepath, **kwargs)
