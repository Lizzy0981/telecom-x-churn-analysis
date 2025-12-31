#!/usr/bin/env python3
"""
Telecom X - Report Generation Example
Example of how to generate PDF and Excel reports

This example demonstrates:
1. Loading processed data
2. Generating executive PDF report
3. Generating technical PDF report
4. Creating Excel dashboard
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))


def main():
    """Main example function"""
    print("=" * 80)
    print("TELECOM X - Report Generation Example")
    print("=" * 80)
    print()
    
    try:
        import pandas as pd
        from src.reports.report_generator import ReportGenerator
        from datetime import datetime
        
        # Load processed data
        print("Loading processed data...")
        data_file = 'data/processed/dataset_final.csv'
        df = pd.read_csv(data_file)
        print(f"✓ Loaded {len(df)} records from {data_file}")
        print()
        
        # Initialize report generator
        print("Initializing Report Generator...")
        generator = ReportGenerator(df)
        print("✓ Report Generator ready")
        print()
        
        # Example 1: Generate Executive PDF Report
        print("Example 1: Generating Executive PDF Report...")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        executive_pdf = f'reports/pdf/executive_report_{timestamp}.pdf'
        
        generator.generate_executive_report(
            output_path=executive_pdf,
            title="Executive Churn Analysis Report",
            author="Elizabeth Díaz Familia",
            include_kpis=True,
            include_charts=True,
            include_recommendations=True
        )
        print(f"✓ Executive PDF generated: {executive_pdf}")
        print()
        
        # Example 2: Generate Technical PDF Report
        print("Example 2: Generating Technical PDF Report...")
        technical_pdf = f'reports/pdf/technical_report_{timestamp}.pdf'
        
        generator.generate_technical_report(
            output_path=technical_pdf,
            include_statistics=True,
            include_ml_metrics=True,
            include_code_snippets=True,
            include_methodology=True
        )
        print(f"✓ Technical PDF generated: {technical_pdf}")
        print()
        
        # Example 3: Generate Excel Dashboard
        print("Example 3: Generating Excel Dashboard...")
        excel_file = f'reports/excel/dashboard_{timestamp}.xlsx'
        
        generator.generate_excel_dashboard(
            output_path=excel_file,
            include_summary=True,
            include_charts=True,
            include_pivot_tables=True,
            include_raw_data=True
        )
        print(f"✓ Excel Dashboard generated: {excel_file}")
        print()
        
        # Example 4: Generate Custom Report
        print("Example 4: Generating Custom Report...")
        custom_sections = [
            {'type': 'summary', 'title': 'Executive Summary'},
            {'type': 'kpis', 'title': 'Key Performance Indicators'},
            {'type': 'charts', 'charts': ['churn_distribution', 'revenue_analysis']},
            {'type': 'insights', 'title': 'AI-Powered Insights'},
            {'type': 'recommendations', 'title': 'Strategic Recommendations'}
        ]
        
        custom_pdf = f'reports/pdf/custom_report_{timestamp}.pdf'
        generator.generate_custom_report(
            output_path=custom_pdf,
            sections=custom_sections,
            template='modern'
        )
        print(f"✓ Custom PDF generated: {custom_pdf}")
        print()
        
        # Display report metadata
        print("Report Metadata:")
        print("-" * 40)
        print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Data Records: {len(df)}")
        print(f"Churn Rate: {(df['Churn'] == 'Yes').mean() * 100:.2f}%")
        print(f"Reports Created: 4")
        print()
        
        print("=" * 80)
        print("Report Generation Example Completed!")
        print("=" * 80)
        
    except FileNotFoundError as e:
        print(f"✗ File not found: {str(e)}")
        print("  Make sure to run ETL pipeline first")
        return 1
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
