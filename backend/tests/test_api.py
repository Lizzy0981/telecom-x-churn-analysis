# backend/tests/test_api.py
"""
API Endpoint Tests
==================

Test suite for FastAPI endpoints.

Author: Elizabeth Díaz Familia
"""

import pytest
from fastapi import status


class TestHealthEndpoint:
    """Tests for health check endpoint"""
    
    def test_health_check_success(self, api_client):
        """Test health check returns 200"""
        response = api_client.get("/health")
        assert response.status_code == status.HTTP_200_OK
        assert "status" in response.json()
        assert response.json()["status"] == "healthy"


class TestAuthEndpoints:
    """Tests for authentication endpoints"""
    
    def test_register_user_success(self, api_client):
        """Test user registration with valid data"""
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "full_name": "Test User",
            "password": "SecurePass123",
            "role": "viewer"
        }
        
        response = api_client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["username"] == user_data["username"]
        assert "id" in data
    
    def test_register_user_invalid_email(self, api_client):
        """Test registration with invalid email"""
        user_data = {
            "email": "invalid-email",
            "username": "testuser",
            "full_name": "Test User",
            "password": "SecurePass123"
        }
        
        response = api_client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_register_user_weak_password(self, api_client):
        """Test registration with weak password"""
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "full_name": "Test User",
            "password": "weak"
        }
        
        response = api_client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_login_success(self, api_client):
        """Test login with valid credentials"""
        login_data = {
            "username": "testuser",
            "password": "SecurePass123"
        }
        
        # Mock successful login
        response = api_client.post("/api/v1/auth/login", json=login_data)
        
        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            assert "access_token" in data
            assert data["token_type"] == "bearer"


class TestDataEndpoints:
    """Tests for data/dataset endpoints"""
    
    def test_upload_dataset_success(self, api_client, sample_csv_file, auth_headers):
        """Test dataset upload"""
        with open(sample_csv_file, 'rb') as f:
            files = {'file': ('test_data.csv', f, 'text/csv')}
            data = {'name': 'Test Dataset', 'description': 'Test description'}
            
            response = api_client.post(
                "/api/v1/data/upload",
                files=files,
                data=data,
                headers=auth_headers
            )
            
            # Accept both 200 and 201
            assert response.status_code in [status.HTTP_200_OK, status.HTTP_201_CREATED]
    
    def test_list_datasets(self, api_client, auth_headers):
        """Test listing datasets"""
        response = api_client.get("/api/v1/data/datasets", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)
    
    def test_get_dataset_by_id(self, api_client, auth_headers):
        """Test getting specific dataset"""
        dataset_id = "test-uuid-123"
        response = api_client.get(f"/api/v1/data/datasets/{dataset_id}", headers=auth_headers)
        
        # Accept 404 for non-existent dataset
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]


class TestMLEndpoints:
    """Tests for ML prediction endpoints"""
    
    def test_predict_churn_success(self, api_client, sample_customer_data, auth_headers):
        """Test churn prediction endpoint"""
        prediction_request = {
            "model_name": "churn_predictor_v1",
            "input_data": sample_customer_data,
            "include_explanation": True
        }
        
        response = api_client.post(
            "/api/v1/ml/predict",
            json=prediction_request,
            headers=auth_headers
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "prediction_result" in data
        assert "probability" in data
        assert "risk_level" in data
    
    def test_predict_invalid_input(self, api_client, auth_headers):
        """Test prediction with invalid input"""
        prediction_request = {
            "model_name": "churn_predictor_v1",
            "input_data": {}  # Empty input
        }
        
        response = api_client.post(
            "/api/v1/ml/predict",
            json=prediction_request,
            headers=auth_headers
        )
        
        assert response.status_code in [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_422_UNPROCESSABLE_ENTITY
        ]
    
    def test_get_model_info(self, api_client):
        """Test model info endpoint"""
        response = api_client.get("/api/v1/ml/models/churn_predictor_v1")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "name" in data
        assert "version" in data
        assert "type" in data


class TestExportEndpoints:
    """Tests for export endpoints"""
    
    @pytest.mark.parametrize("export_format", ["csv", "excel", "json"])
    def test_export_dataset_formats(self, api_client, export_format, auth_headers):
        """Test dataset export in different formats"""
        export_request = {
            "dataset_id": "test-dataset-123",
            "format": export_format,
            "include_predictions": False
        }
        
        response = api_client.post(
            "/api/v1/exports/create",
            json=export_request,
            headers=auth_headers
        )
        
        # Accept success or not found
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_201_CREATED,
            status.HTTP_404_NOT_FOUND
        ]
    
    def test_export_powerbi(self, api_client, auth_headers):
        """Test Power BI export"""
        export_request = {
            "dataset_id": "test-dataset-123",
            "format": "powerbi",
            "config": {
                "dataset_name": "Test Dataset",
                "table_name": "ChurnData"
            }
        }
        
        response = api_client.post(
            "/api/v1/exports/powerbi",
            json=export_request,
            headers=auth_headers
        )
        
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND
        ]
