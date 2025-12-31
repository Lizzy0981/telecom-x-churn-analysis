#!/usr/bin/env python3
"""
Telecom X - Customer Churn Analysis
ETL Pipeline Execution Script

This script runs the complete ETL pipeline:
1. Extract data from sources
2. Transform and clean data
3. Load processed data to destination

Author: Elizabeth Díaz Familia
Version: 1.0.0
"""

import sys
import os
import argparse
import logging
from datetime import datetime
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/etl_pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def run_pipeline(input_file: str, output_dir: str, validate: bool = True):
    """
    Run complete ETL pipeline
    
    Args:
        input_file: Path to input CSV file
        output_dir: Directory for output files
        validate: Whether to validate data
    """
    start_time = datetime.now()
    logger.info("=" * 80)
    logger.info("TELECOM X - ETL PIPELINE STARTED")
    logger.info("=" * 80)
    
    try:
        # Import pipeline modules
        logger.info("Importing pipeline modules...")
        from src.etl.extractor import Extractor
        from src.etl.transformer import Transformer
        from src.etl.loader import Loader
        from src.utils.validator import Validator
        
        # Step 1: Extract
        logger.info("Step 1/4: Extracting data...")
        extractor = Extractor()
        raw_data = extractor.extract_csv(input_file)
        logger.info(f"✓ Extracted {len(raw_data)} records")
        
        # Step 2: Validate (optional)
        if validate:
            logger.info("Step 2/4: Validating data...")
            validator = Validator()
            validation_results = validator.validate(raw_data)
            
            if validation_results['is_valid']:
                logger.info("✓ Data validation passed")
            else:
                logger.warning(f"⚠ Validation warnings: {validation_results['warnings']}")
        else:
            logger.info("Step 2/4: Skipping validation")
        
        # Step 3: Transform
        logger.info("Step 3/4: Transforming data...")
        transformer = Transformer()
        transformed_data = transformer.transform(raw_data)
        logger.info(f"✓ Transformed {len(transformed_data)} records")
        
        # Step 4: Load
        logger.info("Step 4/4: Loading data...")
        loader = Loader()
        
        # Save to multiple formats
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        csv_file = output_path / 'dataset_final.csv'
        excel_file = output_path / 'dataset_final.xlsx'
        json_file = output_path / 'dataset_final.json'
        
        loader.save_csv(transformed_data, str(csv_file))
        logger.info(f"✓ Saved CSV: {csv_file}")
        
        loader.save_excel(transformed_data, str(excel_file))
        logger.info(f"✓ Saved Excel: {excel_file}")
        
        loader.save_json(transformed_data, str(json_file))
        logger.info(f"✓ Saved JSON: {json_file}")
        
        # Summary
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        logger.info("=" * 80)
        logger.info("ETL PIPELINE COMPLETED SUCCESSFULLY")
        logger.info(f"Duration: {duration:.2f} seconds")
        logger.info(f"Records processed: {len(transformed_data)}")
        logger.info(f"Output directory: {output_dir}")
        logger.info("=" * 80)
        
        return True
        
    except Exception as e:
        logger.error(f"✗ ETL Pipeline failed: {str(e)}", exc_info=True)
        return False


def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description='Run Telecom X ETL Pipeline'
    )
    parser.add_argument(
        '--input',
        type=str,
        default='data/raw/telecom_churn_raw.csv',
        help='Input CSV file path'
    )
    parser.add_argument(
        '--output',
        type=str,
        default='data/processed',
        help='Output directory path'
    )
    parser.add_argument(
        '--no-validate',
        action='store_true',
        help='Skip data validation'
    )
    
    args = parser.parse_args()
    
    # Run pipeline
    success = run_pipeline(
        input_file=args.input,
        output_dir=args.output,
        validate=not args.no_validate
    )
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
