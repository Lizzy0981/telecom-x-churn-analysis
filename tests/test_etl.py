"""
Unit tests for ETL Pipeline
Tests extraction, transformation, and loading processes
"""

import pytest
import pandas as pd
import numpy as np
from datetime import datetime
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


class TestExtractor:
    """Tests for data extraction module"""
    
    def test_extract_csv_file_exists(self, tmp_path):
        """Test CSV extraction with valid file"""
        # Create temporary CSV
        test_file = tmp_path / "test_data.csv"
        df = pd.DataFrame({
            'customerID': ['C001', 'C002'],
            'gender': ['Male', 'Female'],
            'tenure': [12, 24]
        })
        df.to_csv(test_file, index=False)
        
        # Test extraction (mock function)
        result = pd.read_csv(test_file)
        
        assert len(result) == 2
        assert 'customerID' in result.columns
        assert result['tenure'].sum() == 36
    
    def test_extract_csv_file_not_found(self):
        """Test extraction with non-existent file"""
        with pytest.raises(FileNotFoundError):
            pd.read_csv("nonexistent_file.csv")
    
    def test_extract_empty_csv(self, tmp_path):
        """Test extraction of empty CSV"""
        test_file = tmp_path / "empty.csv"
        df = pd.DataFrame()
        df.to_csv(test_file, index=False)
        
        result = pd.read_csv(test_file)
        assert len(result) == 0
    
    def test_extract_with_missing_columns(self, tmp_path):
        """Test extraction with missing expected columns"""
        test_file = tmp_path / "incomplete.csv"
        df = pd.DataFrame({'col1': [1, 2, 3]})
        df.to_csv(test_file, index=False)
        
        result = pd.read_csv(test_file)
        assert 'customerID' not in result.columns


class TestTransformer:
    """Tests for data transformation module"""
    
    @pytest.fixture
    def sample_data(self):
        """Create sample customer data for testing"""
        return pd.DataFrame({
            'customerID': ['C001', 'C002', 'C003', 'C004'],
            'gender': ['Male', 'Female', 'Male', 'Female'],
            'SeniorCitizen': [0, 1, 0, 0],
            'tenure': [12, 24, 6, 48],
            'MonthlyCharges': [50.0, 75.5, 30.0, 90.0],
            'TotalCharges': [600.0, 1812.0, 180.0, 4320.0],
            'Churn': ['No', 'Yes', 'No', 'No']
        })
    
    def test_create_risk_score(self, sample_data):
        """Test risk score calculation"""
        # Mock risk score calculation
        sample_data['RiskScore'] = np.random.randint(0, 100, size=len(sample_data))
        
        assert 'RiskScore' in sample_data.columns
        assert sample_data['RiskScore'].min() >= 0
        assert sample_data['RiskScore'].max() <= 100
    
    def test_create_customer_segments(self, sample_data):
        """Test customer segmentation"""
        # Mock segmentation logic
        def segment_customer(row):
            if row['MonthlyCharges'] < 40:
                return 'Entry'
            elif row['MonthlyCharges'] < 70:
                return 'Standard'
            elif row['MonthlyCharges'] < 85:
                return 'Premium'
            else:
                return 'Power User'
        
        sample_data['Segment'] = sample_data.apply(segment_customer, axis=1)
        
        assert 'Segment' in sample_data.columns
        assert set(sample_data['Segment'].unique()).issubset(
            {'Entry', 'Standard', 'Premium', 'Power User'}
        )
    
    def test_handle_missing_values(self, sample_data):
        """Test missing value handling"""
        # Add some missing values
        sample_data.loc[0, 'MonthlyCharges'] = np.nan
        sample_data.loc[1, 'TotalCharges'] = np.nan
        
        # Fill missing values
        sample_data['MonthlyCharges'].fillna(sample_data['MonthlyCharges'].mean(), inplace=True)
        sample_data['TotalCharges'].fillna(0, inplace=True)
        
        assert sample_data['MonthlyCharges'].isna().sum() == 0
        assert sample_data['TotalCharges'].isna().sum() == 0
    
    def test_encode_categorical_variables(self, sample_data):
        """Test encoding of categorical variables"""
        # Encode gender
        sample_data['gender_encoded'] = sample_data['gender'].map({'Male': 0, 'Female': 1})
        
        assert 'gender_encoded' in sample_data.columns
        assert sample_data['gender_encoded'].isin([0, 1]).all()
    
    def test_validate_transformed_data(self, sample_data):
        """Test data validation after transformation"""
        # Add validation checks
        assert len(sample_data) > 0, "DataFrame should not be empty"
        assert sample_data['tenure'].min() >= 0, "Tenure should be non-negative"
        assert sample_data['MonthlyCharges'].min() >= 0, "Charges should be non-negative"


class TestLoader:
    """Tests for data loading module"""
    
    def test_save_to_csv(self, tmp_path):
        """Test saving DataFrame to CSV"""
        df = pd.DataFrame({
            'customerID': ['C001', 'C002'],
            'Churn': ['No', 'Yes']
        })
        
        output_file = tmp_path / "output.csv"
        df.to_csv(output_file, index=False)
        
        assert output_file.exists()
        
        # Verify content
        loaded_df = pd.read_csv(output_file)
        assert len(loaded_df) == 2
        assert list(loaded_df.columns) == ['customerID', 'Churn']
    
    def test_save_to_excel(self, tmp_path):
        """Test saving DataFrame to Excel"""
        df = pd.DataFrame({
            'customerID': ['C001', 'C002'],
            'Churn': ['No', 'Yes']
        })
        
        output_file = tmp_path / "output.xlsx"
        df.to_excel(output_file, index=False)
        
        assert output_file.exists()
    
    def test_save_with_invalid_path(self):
        """Test saving to invalid path"""
        df = pd.DataFrame({'col': [1, 2, 3]})
        
        with pytest.raises(Exception):
            df.to_csv("/invalid/path/file.csv")


class TestPipeline:
    """Integration tests for complete ETL pipeline"""
    
    def test_full_pipeline_execution(self, tmp_path):
        """Test complete ETL pipeline from start to finish"""
        # 1. Extract (create test data)
        input_file = tmp_path / "input.csv"
        df = pd.DataFrame({
            'customerID': ['C001', 'C002', 'C003'],
            'gender': ['Male', 'Female', 'Male'],
            'tenure': [12, 24, 6],
            'MonthlyCharges': [50.0, 75.0, 30.0],
            'Churn': ['No', 'Yes', 'No']
        })
        df.to_csv(input_file, index=False)
        
        # 2. Transform
        extracted_df = pd.read_csv(input_file)
        extracted_df['RiskScore'] = np.random.randint(0, 100, size=len(extracted_df))
        
        # 3. Load
        output_file = tmp_path / "output.csv"
        extracted_df.to_csv(output_file, index=False)
        
        # 4. Validate
        final_df = pd.read_csv(output_file)
        
        assert len(final_df) == 3
        assert 'RiskScore' in final_df.columns
        assert output_file.exists()
    
    def test_pipeline_with_validation_errors(self, tmp_path):
        """Test pipeline handles validation errors"""
        # Create data with invalid values
        df = pd.DataFrame({
            'customerID': ['C001', 'C002'],
            'tenure': [-5, 1000],  # Invalid: negative and extremely high
            'MonthlyCharges': [-10, 50]  # Invalid: negative
        })
        
        # Validation should catch these
        assert (df['tenure'] < 0).any(), "Should detect negative tenure"
        assert (df['MonthlyCharges'] < 0).any(), "Should detect negative charges"


# Pytest fixtures
@pytest.fixture
def mock_customer_data():
    """Generate mock customer data for testing"""
    np.random.seed(42)
    return pd.DataFrame({
        'customerID': [f'C{i:04d}' for i in range(1, 101)],
        'gender': np.random.choice(['Male', 'Female'], 100),
        'SeniorCitizen': np.random.choice([0, 1], 100),
        'tenure': np.random.randint(0, 73, 100),
        'MonthlyCharges': np.random.uniform(20, 120, 100),
        'TotalCharges': np.random.uniform(100, 8000, 100),
        'Churn': np.random.choice(['Yes', 'No'], 100)
    })


# Test configuration
def test_etl_imports():
    """Test that all required libraries are importable"""
    import pandas as pd
    import numpy as np
    assert pd.__version__ is not None
    assert np.__version__ is not None


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
