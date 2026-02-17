# backend/tests/test_export.py
"""
Export Functionality Tests
===========================

Test suite for data export and BI integration.

Author: Elizabeth Díaz Familia
"""

import pytest
import pandas as pd
from pathlib import Path


class TestExportManager:
    """Tests for export manager"""
    
    @pytest.mark.parametrize("export_format", ["csv", "excel", "json"])
    def test_export_formats(self, sample_dataframe, tmp_path, export_format):
        """Test export in different formats"""
        from backend.app.services.export_manager import ExportManager
        
        manager = ExportManager()
        output_file = tmp_path / f"export.{export_format}"
        
        manager.export(
            data=sample_dataframe,
            filepath=output_file,
            format=export_format
        )
        
        assert output_file.exists()
        assert output_file.stat().st_size > 0
    
    def test_batch_export(self, sample_dataframe, tmp_path):
        """Test batch export to multiple formats"""
        from backend.app.services.export_manager import ExportManager
        
        manager = ExportManager()
        base_path = tmp_path / "export"
        
        formats = ['csv', 'json']
        manager.batch_export(sample_dataframe, base_path, formats)
        
        # Check files created
        assert (tmp_path / "export.csv").exists()
        assert (tmp_path / "export.json").exists()


class TestExcelGenerator:
    """Tests for Excel generation"""
    
    def test_generate_excel(self, sample_dataframe, tmp_path):
        """Test Excel file generation"""
        from backend.app.services.excel_generator import ExcelGenerator
        
        generator = ExcelGenerator()
        output_file = tmp_path / "report.xlsx"
        
        generator.generate(sample_dataframe, output_file)
        
        assert output_file.exists()
        
        # Read back and verify
        df_read = pd.read_excel(output_file)
        assert len(df_read) == len(sample_dataframe)


class TestPowerBIExport:
    """Tests for Power BI export"""
    
    def test_powerbi_export(self, sample_dataframe, tmp_path):
        """Test Power BI data export"""
        from backend.app.services.powerbi_generator import PowerBIGenerator
        
        generator = PowerBIGenerator()
        output_file = tmp_path / "powerbi_export"
        
        generator.export(sample_dataframe, output_file)
        
        # Check CSV file created (Power BI compatible)
        csv_file = output_file.with_suffix('.csv')
        assert csv_file.exists()


class TestTableauExport:
    """Tests for Tableau export"""
    
    def test_tableau_export(self, sample_dataframe, tmp_path):
        """Test Tableau data export"""
        from backend.app.services.tableau_generator import TableauGenerator
        
        generator = TableauGenerator()
        output_file = tmp_path / "tableau_export"
        
        generator.export(sample_dataframe, output_file)
        
        # Check CSV file created (Tableau compatible)
        csv_file = output_file.with_suffix('.csv')
        assert csv_file.exists()


class TestDataProcessor:
    """Tests for ETL data processor"""
    
    def test_etl_pipeline(self, sample_csv_file, tmp_path):
        """Test complete ETL pipeline"""
        from backend.app.services.data_processor import DataProcessor
        
        processor = DataProcessor()
        output_file = tmp_path / "processed_data.csv"
        
        # Run ETL
        result = processor.run_etl(
            source=sample_csv_file,
            destination=output_file
        )
        
        assert isinstance(result, pd.DataFrame)
        assert output_file.exists()
    
    def test_data_extraction(self, sample_csv_file):
        """Test data extraction"""
        from backend.app.services.data_processor import DataProcessor
        
        processor = DataProcessor()
        data = processor.extract(sample_csv_file)
        
        assert isinstance(data, pd.DataFrame)
        assert len(data) > 0
    
    def test_data_transformation(self, sample_dataframe):
        """Test data transformation"""
        from backend.app.services.data_processor import DataProcessor
        
        # Add some issues to test transformation
        df = sample_dataframe.copy()
        df.loc[0, 'tenure'] = None  # Missing value
        df = pd.concat([df, df.iloc[[0]]])  # Duplicate
        
        processor = DataProcessor()
        df_clean = processor.transform(df)
        
        # Should handle missing and duplicates
        assert df_clean.isnull().sum().sum() == 0
        assert len(df_clean) < len(df)  # Duplicates removed
