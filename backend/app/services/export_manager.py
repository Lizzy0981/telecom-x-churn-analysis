# backend/app/services/export_manager.py
"""Export Manager - Orchestration Layer
Author: Elizabeth Díaz Familia"""

from typing import Dict, Any, Optional, List
import pandas as pd
from pathlib import Path
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class ExportManager:
    """Manage and orchestrate data exports"""
    
    SUPPORTED_FORMATS = ['csv', 'excel', 'json', 'pdf', 'powerbi', 'tableau']
    
    def __init__(self):
        logger.info("📦 ExportManager initialized")
    
    def export(
        self,
        data: pd.DataFrame,
        filepath: Path,
        format: str = 'csv',
        **kwargs
    ):
        """Export data to specified format"""
        logger.info("=" * 60)
        logger.info("📦 EXPORT MANAGER")
        logger.info("=" * 60)
        logger.info(f"   Format: {format}")
        logger.info(f"   Destination: {filepath}")
        logger.info(f"   Rows: {len(data):,}")
        logger.info(f"   Columns: {len(data.columns)}")
        
        filepath = Path(filepath)
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        start_time = datetime.now()
        
        # Export based on format
        if format == 'csv':
            data.to_csv(filepath, index=False, **kwargs)
        
        elif format in ['excel', 'xlsx']:
            from .excel_generator import generate_excel_report
            generate_excel_report(data, filepath, **kwargs)
        
        elif format == 'json':
            data.to_json(filepath, **kwargs)
        
        elif format == 'pdf':
            from .pdf_generator import generate_pdf_report
            generate_pdf_report(data, filepath, **kwargs)
        
        elif format == 'powerbi':
            from .powerbi_generator import export_to_powerbi
            export_to_powerbi(data, filepath, **kwargs)
        
        elif format == 'tableau':
            from .tableau_generator import export_to_tableau
            export_to_tableau(data, filepath, **kwargs)
        
        else:
            raise ValueError(f"Unsupported format: {format}")
        
        elapsed = (datetime.now() - start_time).total_seconds()
        
        logger.info("=" * 60)
        logger.info("✅ EXPORT COMPLETE")
        logger.info(f"   Duration: {elapsed:.2f}s")
        logger.info("=" * 60)
    
    def batch_export(
        self,
        data: pd.DataFrame,
        base_path: Path,
        formats: List[str]
    ):
        """Export to multiple formats"""
        logger.info(f"📦 Batch exporting to {len(formats)} formats...")
        
        for format in formats:
            filepath = base_path.with_suffix(f'.{format}')
            try:
                self.export(data, filepath, format=format)
            except Exception as e:
                logger.error(f"Failed to export {format}: {str(e)}")


def export_data(data: pd.DataFrame, filepath: Path, format: str = 'csv', **kwargs):
    """Quick export function"""
    manager = ExportManager()
    manager.export(data, filepath, format=format, **kwargs)
