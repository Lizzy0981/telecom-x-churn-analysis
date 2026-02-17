# backend/app/services/__init__.py
"""
Services Module
===============

Business logic services for data processing, file parsing, export generation,
and integration with business intelligence tools.

This module provides:
    - ETL pipeline for data processing
    - File parsing (CSV, Excel, JSON, TSV, TXT, PDF, XML)
    - Power BI integration and export
    - Tableau integration and export
    - Excel report generation
    - PDF report generation
    - Plotly interactive visualizations
    - Export management and orchestration

Services Architecture:
    - Data processing layer (ETL)
    - File I/O layer (parsers, generators)
    - BI integration layer (Power BI, Tableau)
    - Export orchestration layer (manager)

Supported File Formats:
    Input:  CSV, Excel (.xlsx, .xls), JSON, TSV, TXT, PDF, XML
    Output: Excel (.xlsx), PDF, CSV, JSON, Power BI (.pbix), Tableau (.tde, .hyper)

Business Intelligence Integration:
    - Power BI: Dataset export, report templates, DirectQuery
    - Tableau: Data extracts (.tde, .hyper), workbook generation
    - Excel: Dynamic reports with formulas, charts, pivot tables
    - PDF: Professional reports with charts and tables

Use Cases:
    - Automated reporting
    - Data export for BI tools
    - ETL pipelines
    - File format conversion
    - Report generation
    - Dashboard data preparation

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from .data_processor import DataProcessor, ETLPipeline
from .file_parser import FileParser, parse_file, detect_file_format
from .powerbi_generator import PowerBIGenerator, export_to_powerbi
from .tableau_generator import TableauGenerator, export_to_tableau
from .excel_generator import ExcelGenerator, generate_excel_report
from .pdf_generator import PDFGenerator, generate_pdf_report
from .plotly_generator import PlotlyGenerator, create_interactive_chart
from .export_manager import ExportManager, export_data

__version__ = "1.0.0"
__author__ = "Elizabeth Díaz Familia"

__all__ = [
    # Data Processing
    "DataProcessor",
    "ETLPipeline",
    
    # File Parsing
    "FileParser",
    "parse_file",
    "detect_file_format",
    
    # BI Generators
    "PowerBIGenerator",
    "export_to_powerbi",
    "TableauGenerator",
    "export_to_tableau",
    
    # Report Generators
    "ExcelGenerator",
    "generate_excel_report",
    "PDFGenerator",
    "generate_pdf_report",
    
    # Visualization
    "PlotlyGenerator",
    "create_interactive_chart",
    
    # Export Management
    "ExportManager",
    "export_data"
]
