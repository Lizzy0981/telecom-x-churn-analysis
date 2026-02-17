# backend/tests/conftest.py
"""
Pytest Configuration and Fixtures
==================================

Shared fixtures and configuration for all tests.

Author: Elizabeth Díaz Familia
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
from fastapi.testclient import TestClient
from datetime import datetime, timedelta


# ==================== API FIXTURES ====================

@pytest.fixture
def api_client():
    """FastAPI test client"""
    from backend.app.main import app
    return TestClient(app)


@pytest.fixture
def auth_headers():
    """Authentication headers with mock JWT token"""
    return {
        "Authorization": "Bearer mock_jwt_token_for_testing"
    }


# ==================== DATA FIXTURES ====================

@pytest.fixture
def sample_customer_data():
    """Sample customer data for testing"""
    return {
        "customer_id": "TEST001",
        "tenure": 12,
        "monthly_charges": 65.50,
        "total_charges": 786.00,
        "contract": "Month-to-month",
        "payment_method": "Electronic check",
        "internet_service": "Fiber optic"
    }


@pytest.fixture
def sample_dataframe():
    """Sample DataFrame for testing"""
    np.random.seed(42)
    n_samples = 100
    
    data = {
        'customer_id': [f'CUST{i:04d}' for i in range(n_samples)],
        'tenure': np.random.randint(1, 72, n_samples),
        'monthly_charges': np.random.uniform(20, 100, n_samples),
        'total_charges': np.random.uniform(100, 5000, n_samples),
        'churn': np.random.choice([0, 1], n_samples, p=[0.73, 0.27])
    }
    
    return pd.DataFrame(data)


@pytest.fixture
def sample_csv_file(tmp_path):
    """Sample CSV file for testing"""
    csv_file = tmp_path / "test_data.csv"
    
    data = pd.DataFrame({
        'customer_id': ['C001', 'C002', 'C003'],
        'tenure': [12, 24, 6],
        'monthly_charges': [65.5, 89.0, 45.0],
        'churn': [1, 0, 1]
    })
    
    data.to_csv(csv_file, index=False)
    return csv_file


# ==================== MODEL FIXTURES ====================

@pytest.fixture
def mock_model():
    """Mock ML model for testing"""
    from sklearn.ensemble import RandomForestClassifier
    
    model = RandomForestClassifier(n_estimators=10, random_state=42)
    
    # Train on dummy data
    X = np.random.rand(100, 5)
    y = np.random.randint(0, 2, 100)
    model.fit(X, y)
    
    return model


# ==================== CLEANUP ====================

@pytest.fixture(autouse=True)
def cleanup_temp_files(tmp_path):
    """Clean up temporary files after each test"""
    yield
    # Cleanup code here if needed
