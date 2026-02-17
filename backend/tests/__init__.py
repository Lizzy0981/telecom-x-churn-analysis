# backend/tests/__init__.py
"""
Test Suite
==========

Comprehensive test suite for Telecom X - Customer Churn Analysis Platform.

Test Categories:
    - API Tests: Endpoint testing with FastAPI TestClient
    - ML Tests: Model training, prediction, evaluation
    - Parser Tests: File parsing and validation
    - Export Tests: Export functionality and BI integration

Testing Framework:
    - pytest: Modern testing framework
    - pytest-asyncio: Async test support
    - pytest-cov: Code coverage
    - pytest-mock: Mocking utilities

Test Structure:
    - Unit tests: Individual functions/methods
    - Integration tests: Component interaction
    - End-to-end tests: Complete workflows

Best Practices:
    - Fixtures for test data
    - Mocking external dependencies
    - Parametrized tests for multiple scenarios
    - Comprehensive assertions
    - Test isolation (no side effects)
    - Clear test names (test_what_when_then)

Running Tests:
    pytest                              # Run all tests
    pytest tests/test_api.py            # Run specific file
    pytest -v                           # Verbose output
    pytest --cov=app                    # With coverage
    pytest -k "test_prediction"         # Run matching tests
    pytest -x                           # Stop on first failure
    pytest --maxfail=2                  # Stop after N failures

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

__version__ = "1.0.0"
__author__ = "Elizabeth Díaz Familia"
