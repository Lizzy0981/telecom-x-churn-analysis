#!/usr/bin/env python3
"""
Telecom X - ETL Pipeline Example
Example of how to use the ETL pipeline components

This example demonstrates:
1. Extracting data from CSV
2. Transforming and cleaning data
3. Loading to multiple formats
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))


def main():
    """Main example function"""
    print("=" * 80)
    print("TELECOM X - ETL Pipeline Example")
    print("=" * 80)
    print()
    
    try:
        # Import ETL components
        from src.etl.extractor import Extractor
        from src.etl.transformer import Transformer
        from src.etl.loader import Loader
        
        # Step 1: Extract
        print("Step 1: Extracting data from CSV...")
        extractor = Extractor()
        data = extractor.extract_csv('data/raw/telecom_churn_raw.csv')
        print(f"✓ Extracted {len(data)} records")
        print(f"  Columns: {list(data.columns)[:5]}...")
        print()
        
        # Step 2: Transform
        print("Step 2: Transforming data...")
        transformer = Transformer()
        
        # Clean data
        data_clean = transformer.clean_data(data)
        print(f"✓ Cleaned data: {len(data_clean)} records")
        
        # Create features
        data_features = transformer.create_features(data_clean)
        print(f"✓ Created features: {len(data_features.columns)} columns")
        
        # Segment customers
        data_segmented = transformer.segment_customers(data_features)
        print(f"✓ Customer segments: {data_segmented['Segment'].unique()}")
        print()
        
        # Step 3: Load
        print("Step 3: Loading transformed data...")
        loader = Loader()
        
        # Save to CSV
        output_csv = 'data/processed/example_output.csv'
        loader.save_csv(data_segmented, output_csv)
        print(f"✓ Saved to CSV: {output_csv}")
        
        # Save to Excel
        output_excel = 'data/processed/example_output.xlsx'
        loader.save_excel(data_segmented, output_excel)
        print(f"✓ Saved to Excel: {output_excel}")
        
        # Save to JSON
        output_json = 'data/processed/example_output.json'
        loader.save_json(data_segmented, output_json)
        print(f"✓ Saved to JSON: {output_json}")
        print()
        
        # Display summary statistics
        print("Summary Statistics:")
        print("-" * 40)
        print(f"Total Records: {len(data_segmented)}")
        print(f"Churn Rate: {(data_segmented['Churn'] == 'Yes').mean() * 100:.2f}%")
        print(f"Average Tenure: {data_segmented['tenure'].mean():.1f} months")
        print(f"Average Monthly Charges: ${data_segmented['MonthlyCharges'].mean():.2f}")
        print()
        
        print("=" * 80)
        print("ETL Pipeline Example Completed Successfully!")
        print("=" * 80)
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
