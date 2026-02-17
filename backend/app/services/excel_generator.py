# backend/app/services/excel_generator.py
"""
Excel Generator
===============

Generate professional Excel reports with formatting, charts, and formulas.

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Dict, Any, List, Optional
import pandas as pd
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class ExcelGenerator:
    """Generate Excel reports with advanced formatting"""
    
    def __init__(self):
        logger.info("📊 ExcelGenerator initialized")
    
    def generate(
        self,
        data: pd.DataFrame,
        filepath: Path,
        sheet_name: str = 'Data',
        include_charts: bool = False,
        **kwargs
    ):
        """Generate Excel file"""
        logger.info(f"📊 Generating Excel report: {filepath}")
        
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Write to Excel
        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            data.to_excel(writer, sheet_name=sheet_name, index=False)
            
            # Apply formatting
            workbook = writer.book
            worksheet = writer.sheets[sheet_name]
            
            # Auto-adjust column widths
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                for cell in column:
                    if cell.value:
                        max_length = max(max_length, len(str(cell.value)))
                worksheet.column_dimensions[column_letter].width = min(max_length + 2, 50)
        
        logger.info(f"   ✅ Excel report generated ({filepath.stat().st_size / 1024:.1f} KB)")


def generate_excel_report(
    data: pd.DataFrame,
    filepath: Path,
    **kwargs
):
    """Quick function to generate Excel report"""
    generator = ExcelGenerator()
    generator.generate(data, filepath, **kwargs)
