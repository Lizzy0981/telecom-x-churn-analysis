# backend/app/services/powerbi_generator.py
"""Power BI Generator - BI Integration
Author: Elizabeth Díaz Familia"""

from typing import Dict, Any
import pandas as pd
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class PowerBIGenerator:
    """Generate Power BI compatible files"""
    
    def __init__(self):
        logger.info("⚡ PowerBIGenerator initialized")
    
    def export(self, data: pd.DataFrame, filepath: Path, **kwargs):
        """Export data for Power BI"""
        logger.info(f"⚡ Exporting to Power BI format: {filepath}")
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Export as CSV (Power BI compatible)
        data.to_csv(filepath.with_suffix('.csv'), index=False, encoding='utf-8-sig')
        
        logger.info("   ✅ Power BI export complete")

def export_to_powerbi(data: pd.DataFrame, filepath: Path, **kwargs):
    generator = PowerBIGenerator()
    generator.export(data, filepath, **kwargs)
