"""
📊 Excel Exporter
================

Autor: Elizabeth Díaz Familia
"""

import pandas as pd
from pathlib import Path

class ExcelExporter:
    """Exportador Excel"""
    
    def __init__(self, output_dir: str = 'reports/excel'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def export(self, df: pd.DataFrame, filename: str, sheet_name: str = 'Data'):
        """Exportar DataFrame a Excel"""
        filepath = self.output_dir / filename
        df.to_excel(filepath, sheet_name=sheet_name, index=False)
        print(f"✅ Excel exportado: {filepath}")
        return str(filepath)
