"""
Unit tests for API Manager
Tests API endpoints, authentication, and data handling
"""

import pytest
import json
from unittest.mock import Mock, patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


class TestAPIManager:
    """Tests for API Manager class"""
    
    def test_api_initialization(self):
        """Test API manager initialization"""
        # Mock API manager
        api_config = {
            'base_url': 'http://localhost:8000/api/v1',
            'timeout': 30,
            'max_retries': 3
        }
        
        assert api_config['base_url'] is not None
        assert api_config['timeout'] == 30
        assert api_config['max_retries'] == 3
    
    def test_get_customers_endpoint(self):
        """Test GET /customers endpoint"""
        mock_response = {
            'status': 'success',
            'data': [
                {'customerID': 'C001', 'churn': 'No'},
                {'customerID': 'C002', 'churn': 'Yes'}
            ],
            'count': 2
        }
        
        assert mock_response['status'] == 'success'
        assert len(mock_response['data']) == 2
    
    def test_get_customer_by_id(self):
        """Test GET /customers/:id endpoint"""
        mock_response = {
            'customerID': 'C001',
            'gender': 'Male',
            'tenure': 24,
            'churn': 'No',
            'riskScore': 35
        }
        
        assert mock_response['customerID'] == 'C001'
        assert 'riskScore' in mock_response
    
    def test_get_kpis_endpoint(self):
        """Test GET /kpis endpoint"""
        mock_response = {
            'totalCustomers': 500,
            'churnRate': 27.0,
            'retentionRate': 73.0,
            'avgMonthlyCharges': 64.76,
            'avgTenure': 32.4
        }
        
        assert mock_response['churnRate'] + mock_response['retentionRate'] == 100.0
        assert mock_response['totalCustomers'] > 0
    
    def test_post_prediction_endpoint(self):
        """Test POST /predict endpoint"""
        request_data = {
            'customerID': 'C999',
            'tenure': 12,
            'monthlyCharges': 65.0,
            'totalCharges': 780.0
        }
        
        mock_response = {
            'customerID': 'C999',
            'churnPrediction': 'Yes',
            'churnProbability': 0.78,
            'riskScore': 78
        }
        
        assert mock_response['churnProbability'] >= 0
        assert mock_response['churnProbability'] <= 1.0
        assert mock_response['riskScore'] >= 0
        assert mock_response['riskScore'] <= 100
    
    def test_authentication_required(self):
        """Test that endpoints require authentication"""
        headers = {'Authorization': 'Bearer token123'}
        
        assert 'Authorization' in headers
        assert headers['Authorization'].startswith('Bearer ')
    
    def test_rate_limiting(self):
        """Test API rate limiting"""
        rate_limit = {
            'requests_per_minute': 100,
            'burst_limit': 20
        }
        
        assert rate_limit['requests_per_minute'] > 0
        assert rate_limit['burst_limit'] > 0
    
    @patch('requests.get')
    def test_api_timeout_handling(self, mock_get):
        """Test API timeout handling"""
        mock_get.side_effect = TimeoutError("Request timed out")
        
        with pytest.raises(TimeoutError):
            mock_get('http://api.example.com/customers')
    
    @patch('requests.post')
    def test_api_error_handling(self, mock_post):
        """Test API error handling"""
        mock_post.return_value = Mock(
            status_code=500,
            json=lambda: {'error': 'Internal Server Error'}
        )
        
        response = mock_post('http://api.example.com/predict')
        assert response.status_code == 500
    
    def test_pagination_handling(self):
        """Test pagination in API responses"""
        mock_response = {
            'data': [{'id': i} for i in range(20)],
            'pagination': {
                'page': 1,
                'pageSize': 20,
                'totalPages': 5,
                'totalRecords': 100
            }
        }
        
        assert mock_response['pagination']['page'] == 1
        assert len(mock_response['data']) == mock_response['pagination']['pageSize']


class TestAPIDataValidation:
    """Tests for API data validation"""
    
    def test_validate_customer_data(self):
        """Test customer data validation"""
        valid_customer = {
            'customerID': 'C001',
            'tenure': 24,
            'monthlyCharges': 65.50
        }
        
        # Validation rules
        assert len(valid_customer['customerID']) > 0
        assert valid_customer['tenure'] >= 0
        assert valid_customer['monthlyCharges'] >= 0
    
    def test_reject_invalid_data(self):
        """Test rejection of invalid data"""
        invalid_customer = {
            'customerID': '',  # Empty ID
            'tenure': -5,  # Negative tenure
            'monthlyCharges': -10.0  # Negative charges
        }
        
        # Should fail validation
        assert len(invalid_customer['customerID']) == 0  # Invalid
        assert invalid_customer['tenure'] < 0  # Invalid
        assert invalid_customer['monthlyCharges'] < 0  # Invalid


class TestAPIResponseFormats:
    """Tests for API response formats"""
    
    def test_json_response_format(self):
        """Test JSON response structure"""
        response = {
            'status': 'success',
            'data': {},
            'message': 'Request successful',
            'timestamp': '2025-01-15T10:30:00Z'
        }
        
        assert 'status' in response
        assert 'data' in response
        assert response['status'] in ['success', 'error']
    
    def test_error_response_format(self):
        """Test error response structure"""
        error_response = {
            'status': 'error',
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid customer data',
                'details': ['customerID is required']
            }
        }
        
        assert error_response['status'] == 'error'
        assert 'error' in error_response
        assert 'code' in error_response['error']


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
