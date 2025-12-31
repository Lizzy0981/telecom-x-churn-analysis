#!/usr/bin/env python3
"""
Telecom X - Complete Pipeline Example
End-to-end example running the complete analysis pipeline

This example demonstrates:
1. Complete ETL pipeline
2. Statistical analysis
3. ML model training
4. Report generation
5. Visualization creation
"""

import sys
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent))


def main():
    """Main example function - Complete pipeline"""
    start_time = datetime.now()
    
    print("=" * 80)
    print("TELECOM X - COMPLETE PIPELINE EXAMPLE")
    print("=" * 80)
    print(f"Started: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    try:
        import pandas as pd
        
        # ===== STAGE 1: ETL PIPELINE =====
        print("STAGE 1: ETL Pipeline")
        print("-" * 80)
        
        from src.etl.extractor import Extractor
        from src.etl.transformer import Transformer
        from src.etl.loader import Loader
        
        print("1.1 Extracting data...")
        extractor = Extractor()
        raw_data = extractor.extract_csv('data/raw/telecom_churn_raw.csv')
        print(f"    ✓ Extracted {len(raw_data)} records")
        
        print("1.2 Transforming data...")
        transformer = Transformer()
        clean_data = transformer.clean_data(raw_data)
        enriched_data = transformer.create_features(clean_data)
        segmented_data = transformer.segment_customers(enriched_data)
        print(f"    ✓ Transformed data ready: {len(segmented_data)} records")
        
        print("1.3 Loading data...")
        loader = Loader()
        loader.save_csv(segmented_data, 'data/processed/pipeline_output.csv')
        print("    ✓ Data saved to CSV")
        print()
        
        # ===== STAGE 2: ANALYSIS =====
        print("STAGE 2: Statistical Analysis")
        print("-" * 80)
        
        from src.analysis.churn_analysis import ChurnAnalysis
        from src.analysis.statistics import Statistics
        
        print("2.1 Running churn analysis...")
        churn_analyzer = ChurnAnalysis(segmented_data)
        churn_metrics = churn_analyzer.calculate_metrics()
        print(f"    ✓ Churn Rate: {churn_metrics['churn_rate']:.2f}%")
        print(f"    ✓ Retention Rate: {churn_metrics['retention_rate']:.2f}%")
        
        print("2.2 Calculating statistics...")
        stats = Statistics(segmented_data)
        summary_stats = stats.describe()
        print(f"    ✓ Summary statistics computed")
        print()
        
        # ===== STAGE 3: MACHINE LEARNING =====
        print("STAGE 3: Machine Learning")
        print("-" * 80)
        
        print("3.1 Preparing ML dataset...")
        from src.ml.feature_engineering import FeatureEngineering
        
        fe = FeatureEngineering()
        X, y = fe.prepare_ml_dataset(segmented_data)
        print(f"    ✓ Features: {X.shape[1]}, Samples: {X.shape[0]}")
        
        print("3.2 Training model...")
        from sklearn.model_selection import train_test_split
        from sklearn.ensemble import RandomForestClassifier
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        accuracy = model.score(X_test, y_test)
        print(f"    ✓ Model accuracy: {accuracy * 100:.2f}%")
        print()
        
        # ===== STAGE 4: VISUALIZATION =====
        print("STAGE 4: Visualization")
        print("-" * 80)
        
        from src.visualization.plotly_charts import PlotlyCharts
        
        print("4.1 Creating visualizations...")
        viz = PlotlyCharts(segmented_data)
        
        # Create charts
        fig_pie = viz.create_pie_chart('Churn', 'Churn Distribution')
        fig_pie.write_html('visualizations/interactive/pipeline_churn.html')
        print("    ✓ Churn distribution chart created")
        
        fig_bar = viz.create_bar_chart('Contract', 'MonthlyCharges', 'Charges by Contract')
        fig_bar.write_html('visualizations/interactive/pipeline_contract.html')
        print("    ✓ Contract analysis chart created")
        print()
        
        # ===== STAGE 5: REPORTING =====
        print("STAGE 5: Report Generation")
        print("-" * 80)
        
        from src.reports.report_generator import ReportGenerator
        
        print("5.1 Generating reports...")
        report_gen = ReportGenerator(segmented_data)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Executive report
        exec_pdf = f'reports/pdf/pipeline_executive_{timestamp}.pdf'
        report_gen.generate_executive_report(exec_pdf)
        print(f"    ✓ Executive PDF: {exec_pdf}")
        
        # Excel dashboard
        excel_file = f'reports/excel/pipeline_dashboard_{timestamp}.xlsx'
        report_gen.generate_excel_dashboard(excel_file)
        print(f"    ✓ Excel dashboard: {excel_file}")
        print()
        
        # ===== FINAL SUMMARY =====
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print("=" * 80)
        print("PIPELINE EXECUTION SUMMARY")
        print("=" * 80)
        print(f"Start Time:     {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"End Time:       {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Duration:       {duration:.2f} seconds")
        print()
        print(f"Records Processed:      {len(segmented_data)}")
        print(f"Churn Rate:             {churn_metrics['churn_rate']:.2f}%")
        print(f"ML Model Accuracy:      {accuracy * 100:.2f}%")
        print(f"Visualizations Created: 2")
        print(f"Reports Generated:      2")
        print()
        print("=" * 80)
        print("COMPLETE PIPELINE FINISHED SUCCESSFULLY!")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n✗ Pipeline Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
