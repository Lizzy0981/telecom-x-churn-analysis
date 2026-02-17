# backend/tests/test_parsers.py
"""
File Parser Tests
=================

Test suite for file parsing functionality.

Author: Elizabeth Díaz Familia
"""

import pytest
import pandas as pd
from pathlib import Path


class TestFileParser:
    """Tests for file parsing"""
    
    def test_parse_csv(self, sample_csv_file):
        """Test CSV file parsing"""
        from backend.app.services.file_parser import FileParser
        
        parser = FileParser()
        data = parser.parse(sample_csv_file, format='csv')
        
        assert isinstance(data, pd.DataFrame)
        assert len(data) > 0
        assert 'customer_id' in data.columns
    
    def test_detect_format(self, sample_csv_file):
        """Test format detection"""
        from backend.app.services.file_parser import FileParser
        
        parser = FileParser()
        detected = parser.detect_format(sample_csv_file)
        
        assert detected == 'csv'
    
    def test_parse_excel(self, tmp_path):
        """Test Excel file parsing"""
        from backend.app.services.file_parser import FileParser
        
        # Create sample Excel file
        excel_file = tmp_path / "test.xlsx"
        df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
        df.to_excel(excel_file, index=False)
        
        parser = FileParser()
        data = parser.parse(excel_file, format='excel')
        
        assert isinstance(data, pd.DataFrame)
        assert len(data) == 3
    
    def test_parse_json(self, tmp_path):
        """Test JSON file parsing"""
        from backend.app.services.file_parser import FileParser
        import json
        
        # Create sample JSON file
        json_file = tmp_path / "test.json"
        data_dict = [
            {'id': 1, 'name': 'Alice'},
            {'id': 2, 'name': 'Bob'}
        ]
        
        with open(json_file, 'w') as f:
            json.dump(data_dict, f)
        
        parser = FileParser()
        data = parser.parse(json_file, format='json')
        
        assert isinstance(data, pd.DataFrame)
        assert len(data) == 2
    
    def test_get_file_info(self, sample_csv_file):
        """Test file information extraction"""
        from backend.app.services.file_parser import FileParser
        
        parser = FileParser()
        info = parser.get_file_info(sample_csv_file)
        
        assert 'filename' in info
        assert 'format' in info
        assert 'size_mb' in info


class TestFileValidation:
    """Tests for file validation"""
    
    def test_validate_allowed_extension(self):
        """Test file extension validation"""
        from backend.app.utils.file_handlers import validate_file_upload
        
        # Valid extensions
        assert validate_file_upload("data.csv", 1024, "text/csv")
        assert validate_file_upload("data.xlsx", 1024, "application/vnd.ms-excel")
        
        # Invalid extension
        assert not validate_file_upload("data.exe", 1024)
    
    def test_validate_file_size(self):
        """Test file size validation"""
        from backend.app.utils.file_handlers import validate_file_upload
        
        # Within limit
        assert validate_file_upload("data.csv", 1024 * 1024, "text/csv")  # 1 MB
        
        # Exceeds limit
        max_size = 50 * 1024 * 1024  # 50 MB
        assert not validate_file_upload("data.csv", max_size + 1, "text/csv")
    
    def test_generate_unique_filename(self):
        """Test unique filename generation"""
        from backend.app.utils.file_handlers import generate_unique_filename
        
        filename1 = generate_unique_filename("test.csv")
        filename2 = generate_unique_filename("test.csv")
        
        assert filename1 != filename2
        assert filename1.endswith('.csv')
        assert filename2.endswith('.csv')
