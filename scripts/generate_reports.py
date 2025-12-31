#!/usr/bin/env python3
"""
Telecom X - Report Generation Script

Generate PDF and Excel reports from processed data

Author: Elizabeth Díaz Familia
Version: 1.0.0
"""

import sys
import os
import argparse
import logging
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def generate_reports(data_file: str, output_dir: str, report_types: list):
    """
    Generate reports from processed data
    
    Args:
        data_file: Path to processed data file
        output_dir: Directory for output reports
        report_types: List of report types to generate
    """
    logger.info("=" * 80)
    logger.info("TELECOM X - REPORT GENERATION")
    logger.info("=" * 80)
    
    try:
        import pandas as pd
        from src.reports.report_generator import ReportGenerator
        
        # Load data
        logger.info(f"Loading data from: {data_file}")
        df = pd.read_csv(data_file)
        logger.info(f"✓ Loaded {len(df)} records")
        
        # Initialize report generator
        generator = ReportGenerator(df)
        
        # Create output directory
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Generate requested reports
        generated_reports = []
        
        if 'executive' in report_types or 'all' in report_types:
            logger.info("Generating Executive Report (PDF)...")
            pdf_file = output_path / f'executive_report_{datetime.now().strftime("%Y%m%d")}.pdf'
            generator.generate_executive_pdf(str(pdf_file))
            logger.info(f"✓ Executive PDF: {pdf_file}")
            generated_reports.append(str(pdf_file))
        
        if 'technical' in report_types or 'all' in report_types:
            logger.info("Generating Technical Report (PDF)...")
            pdf_file = output_path / f'technical_report_{datetime.now().strftime("%Y%m%d")}.pdf'
            generator.generate_technical_pdf(str(pdf_file))
            logger.info(f"✓ Technical PDF: {pdf_file}")
            generated_reports.append(str(pdf_file))
        
        if 'excel' in report_types or 'all' in report_types:
            logger.info("Generating Excel Dashboard...")
            excel_file = output_path / f'dashboard_{datetime.now().strftime("%Y%m%d")}.xlsx'
            generator.generate_excel_dashboard(str(excel_file))
            logger.info(f"✓ Excel Dashboard: {excel_file}")
            generated_reports.append(str(excel_file))
        
        # Summary
        logger.info("=" * 80)
        logger.info("REPORT GENERATION COMPLETED")
        logger.info(f"Generated {len(generated_reports)} reports:")
        for report in generated_reports:
            logger.info(f"  • {report}")
        logger.info("=" * 80)
        
        return True
        
    except Exception as e:
        logger.error(f"✗ Report generation failed: {str(e)}", exc_info=True)
        return False


def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description='Generate Telecom X Reports'
    )
    parser.add_argument(
        '--data',
        type=str,
        default='data/processed/dataset_final.csv',
        help='Input data file'
    )
    parser.add_argument(
        '--output',
        type=str,
        default='reports',
        help='Output directory'
    )
    parser.add_argument(
        '--type',
        type=str,
        nargs='+',
        choices=['executive', 'technical', 'excel', 'all'],
        default=['all'],
        help='Report types to generate'
    )
    
    args = parser.parse_args()
    
    # Generate reports
    success = generate_reports(
        data_file=args.data,
        output_dir=args.output,
        report_types=args.type
    )
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
