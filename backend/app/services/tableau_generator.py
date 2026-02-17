# backend/app/services/tableau_generator.py
"""Tableau Generator - BI Integration
Author: Elizabeth Díaz Familia"""

from typing import Dict, Any
import pandas as pd
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class TableauGenerator:
    """Generate Tableau compatible files"""
    
    def __init__(self):
        logger.info("📊 TableauGenerator initialized")
    
    def export(self, data: pd.DataFrame, filepath: Path, **kwargs):
        """Export data for Tableau"""
        logger.info(f"📊 Exporting to Tableau format: {filepath}")
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Export as CSV (Tableau compatible)
        data.to_csv(filepath.with_suffix('.csv'), index=False)
        
        logger.info("   ✅ Tableau export complete")

def export_to_tableau(data: pd.DataFrame, filepath: Path, **kwargs):
    generator = TableauGenerator()
    generator.export(data, filepath, **kwargs)
