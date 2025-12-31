"""
📊 CSV Exporter
==============

Autor: Elizabeth Díaz Familia
"""

import pandas as pd
from pathlib import Path

class CSVExporter:
    """Exportador CSV"""
    
    def __init__(self, output_dir: str = 'reports/csv'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def export(self, df: pd.DataFrame, filename: str):
        """Exportar DataFrame a CSV"""
        filepath = self.output_dir / filename
        df.to_csv(filepath, index=False, encoding='utf-8-sig')
        print(f"✅ CSV exportado: {filepath}")
        return str(filepath)
