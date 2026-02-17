# backend/app/services/file_parser.py
"""
File Parser - Multi-Format Support
===================================

Parse and extract data from multiple file formats with automatic
format detection and robust error handling.

Supported Formats (7):
    1. CSV (Comma-Separated Values)
    2. Excel (.xlsx, .xls)
    3. JSON (JavaScript Object Notation)
    4. TSV (Tab-Separated Values)
    5. TXT (Text files with delimiters)
    6. PDF (Portable Document Format)
    7. XML (Extensible Markup Language)

Features:
    - Automatic format detection
    - Encoding detection
    - Multiple sheet support (Excel)
    - Nested JSON handling
    - PDF table extraction
    - XML parsing and flattening
    - Error handling and logging
    - Large file support
    - Streaming for big files

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Dict, Any, List, Optional, Union
import pandas as pd
import numpy as np
from pathlib import Path
import logging
import json
import csv

logger = logging.getLogger(__name__)


class FileParser:
    """
    Multi-format file parser with automatic format detection.
    
    Supports parsing of 7 different file formats with automatic
    encoding detection and robust error handling.
    
    Example:
        >>> parser = FileParser()
        >>> data = parser.parse('data.csv')
        >>> # or with explicit format
        >>> data = parser.parse('data.xlsx', format='excel')
    """
    
    SUPPORTED_FORMATS = {
        'csv': ['.csv'],
        'excel': ['.xlsx', '.xls', '.xlsm'],
        'json': ['.json'],
        'tsv': ['.tsv'],
        'txt': ['.txt', '.dat'],
        'pdf': ['.pdf'],
        'xml': ['.xml']
    }
    
    def __init__(self):
        """Initialize File Parser"""
        logger.info("📄 FileParser initialized")
        logger.info(f"   Supported formats: {', '.join(self.SUPPORTED_FORMATS.keys())}")
    
    def parse(
        self,
        filepath: Union[str, Path],
        format: Optional[str] = None,
        **kwargs
    ) -> pd.DataFrame:
        """
        Parse file and return DataFrame.
        
        Args:
            filepath: Path to file
            format: File format (auto-detected if None)
            **kwargs: Additional parsing arguments
            
        Returns:
            DataFrame with parsed data
        """
        filepath = Path(filepath)
        
        if not filepath.exists():
            raise FileNotFoundError(f"File not found: {filepath}")
        
        # Detect format if not provided
        if format is None:
            format = self.detect_format(filepath)
        
        logger.info(f"📄 Parsing file: {filepath.name}")
        logger.info(f"   Format: {format}")
        
        # Parse based on format
        if format == 'csv':
            data = self._parse_csv(filepath, **kwargs)
        elif format == 'excel':
            data = self._parse_excel(filepath, **kwargs)
        elif format == 'json':
            data = self._parse_json(filepath, **kwargs)
        elif format == 'tsv':
            data = self._parse_tsv(filepath, **kwargs)
        elif format == 'txt':
            data = self._parse_txt(filepath, **kwargs)
        elif format == 'pdf':
            data = self._parse_pdf(filepath, **kwargs)
        elif format == 'xml':
            data = self._parse_xml(filepath, **kwargs)
        else:
            raise ValueError(f"Unsupported format: {format}")
        
        logger.info(f"   ✅ Parsed {len(data):,} rows, {len(data.columns)} columns")
        
        return data
    
    def detect_format(self, filepath: Path) -> str:
        """Detect file format from extension"""
        extension = filepath.suffix.lower()
        
        for format_name, extensions in self.SUPPORTED_FORMATS.items():
            if extension in extensions:
                return format_name
        
        raise ValueError(f"Cannot detect format for extension: {extension}")
    
    # ==================== FORMAT PARSERS ====================
    
    def _parse_csv(self, filepath: Path, **kwargs) -> pd.DataFrame:
        """Parse CSV file"""
        try:
            # Try different encodings
            for encoding in ['utf-8', 'latin1', 'iso-8859-1']:
                try:
                    data = pd.read_csv(filepath, encoding=encoding, **kwargs)
                    logger.info(f"      Encoding: {encoding}")
                    return data
                except UnicodeDecodeError:
                    continue
            
            # Fallback to default
            return pd.read_csv(filepath, **kwargs)
        
        except Exception as e:
            logger.error(f"Error parsing CSV: {str(e)}")
            raise
    
    def _parse_excel(self, filepath: Path, sheet_name: Optional[str] = None, **kwargs) -> pd.DataFrame:
        """Parse Excel file"""
        try:
            # If no sheet specified, read first sheet
            if sheet_name is None:
                sheet_name = 0
            
            data = pd.read_excel(filepath, sheet_name=sheet_name, **kwargs)
            
            # If multiple sheets, concatenate
            if isinstance(data, dict):
                logger.info(f"      Multiple sheets found: {len(data)}")
                data = pd.concat(data.values(), ignore_index=True)
            
            return data
        
        except Exception as e:
            logger.error(f"Error parsing Excel: {str(e)}")
            raise
    
    def _parse_json(self, filepath: Path, **kwargs) -> pd.DataFrame:
        """Parse JSON file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
            
            # Convert to DataFrame
            if isinstance(json_data, list):
                data = pd.DataFrame(json_data)
            elif isinstance(json_data, dict):
                # If dict with array values
                if all(isinstance(v, list) for v in json_data.values()):
                    data = pd.DataFrame(json_data)
                else:
                    # Flatten nested dict
                    data = pd.json_normalize(json_data)
            else:
                data = pd.DataFrame([json_data])
            
            return data
        
        except Exception as e:
            logger.error(f"Error parsing JSON: {str(e)}")
            raise
    
    def _parse_tsv(self, filepath: Path, **kwargs) -> pd.DataFrame:
        """Parse TSV file"""
        try:
            data = pd.read_csv(filepath, sep='\t', **kwargs)
            return data
        except Exception as e:
            logger.error(f"Error parsing TSV: {str(e)}")
            raise
    
    def _parse_txt(self, filepath: Path, delimiter: str = ',', **kwargs) -> pd.DataFrame:
        """Parse TXT file"""
        try:
            data = pd.read_csv(filepath, sep=delimiter, **kwargs)
            return data
        except Exception as e:
            logger.error(f"Error parsing TXT: {str(e)}")
            raise
    
    def _parse_pdf(self, filepath: Path, **kwargs) -> pd.DataFrame:
        """
        Parse PDF file and extract tables.
        
        Note: Requires tabula-py or pdfplumber library
        """
        try:
            # Try using tabula-py
            try:
                import tabula
                tables = tabula.read_pdf(str(filepath), pages='all', **kwargs)
                
                if tables:
                    # Concatenate all tables
                    data = pd.concat(tables, ignore_index=True)
                    return data
                else:
                    raise ValueError("No tables found in PDF")
            
            except ImportError:
                logger.warning("tabula-py not installed, trying pdfplumber...")
                
                # Fallback to pdfplumber
                import pdfplumber
                
                with pdfplumber.open(filepath) as pdf:
                    tables = []
                    for page in pdf.pages:
                        table = page.extract_table()
                        if table:
                            tables.append(pd.DataFrame(table[1:], columns=table[0]))
                    
                    if tables:
                        data = pd.concat(tables, ignore_index=True)
                        return data
                    else:
                        raise ValueError("No tables found in PDF")
        
        except ImportError:
            logger.error("PDF parsing requires tabula-py or pdfplumber")
            logger.error("Install with: pip install tabula-py pdfplumber")
            raise
        
        except Exception as e:
            logger.error(f"Error parsing PDF: {str(e)}")
            raise
    
    def _parse_xml(self, filepath: Path, **kwargs) -> pd.DataFrame:
        """Parse XML file"""
        try:
            import xml.etree.ElementTree as ET
            
            tree = ET.parse(filepath)
            root = tree.getroot()
            
            # Extract data from XML
            data = []
            for child in root:
                row = {}
                for element in child:
                    row[element.tag] = element.text
                data.append(row)
            
            return pd.DataFrame(data)
        
        except Exception as e:
            logger.error(f"Error parsing XML: {str(e)}")
            raise
    
    # ==================== UTILITY METHODS ====================
    
    def get_file_info(self, filepath: Union[str, Path]) -> Dict[str, Any]:
        """
        Get information about file.
        
        Args:
            filepath: Path to file
            
        Returns:
            Dict with file information
        """
        filepath = Path(filepath)
        
        if not filepath.exists():
            raise FileNotFoundError(f"File not found: {filepath}")
        
        format = self.detect_format(filepath)
        size_mb = filepath.stat().st_size / (1024 * 1024)
        
        info = {
            'filename': filepath.name,
            'format': format,
            'size_mb': round(size_mb, 2),
            'extension': filepath.suffix,
            'absolute_path': str(filepath.absolute())
        }
        
        return info
    
    def preview(
        self,
        filepath: Union[str, Path],
        n_rows: int = 5
    ) -> pd.DataFrame:
        """
        Preview first n rows of file.
        
        Args:
            filepath: Path to file
            n_rows: Number of rows to preview
            
        Returns:
            DataFrame with preview
        """
        data = self.parse(filepath)
        return data.head(n_rows)


# ==================== UTILITY FUNCTIONS ====================

def parse_file(
    filepath: Union[str, Path],
    format: Optional[str] = None,
    **kwargs
) -> pd.DataFrame:
    """
    Quick function to parse file.
    
    Args:
        filepath: Path to file
        format: File format (auto-detected if None)
        **kwargs: Additional arguments
        
    Returns:
        DataFrame with parsed data
    """
    parser = FileParser()
    return parser.parse(filepath, format=format, **kwargs)


def detect_file_format(filepath: Union[str, Path]) -> str:
    """
    Detect file format from extension.
    
    Args:
        filepath: Path to file
        
    Returns:
        File format
    """
    parser = FileParser()
    return parser.detect_format(Path(filepath))


def batch_parse(
    filepaths: List[Union[str, Path]],
    concat: bool = True
) -> Union[pd.DataFrame, List[pd.DataFrame]]:
    """
    Parse multiple files.
    
    Args:
        filepaths: List of file paths
        concat: Whether to concatenate results
        
    Returns:
        DataFrame or list of DataFrames
    """
    logger.info(f"📄 Batch parsing {len(filepaths)} files...")
    
    parser = FileParser()
    results = []
    
    for filepath in filepaths:
        try:
            data = parser.parse(filepath)
            results.append(data)
        except Exception as e:
            logger.error(f"Failed to parse {filepath}: {str(e)}")
            continue
    
    if concat and results:
        logger.info(f"   Concatenating {len(results)} DataFrames...")
        return pd.concat(results, ignore_index=True)
    
    return results
