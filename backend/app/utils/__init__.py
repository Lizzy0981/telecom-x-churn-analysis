# backend/app/utils/__init__.py
"""
Utilities Module
================

General-purpose utilities for file handling, validation, and helper functions.

This module provides:
    - File handling (upload, validation, storage)
    - Data validators (email, phone, business rules)
    - Helper functions (dates, strings, numbers)
    - Common utilities across the application

Features:
    - File upload utilities
    - MIME type detection
    - File size validation
    - Email/phone validators
    - Date/time helpers
    - String formatters
    - Number utilities
    - Error handling

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from .file_handlers import (
    FileHandler,
    validate_file_upload,
    save_uploaded_file,
    get_file_info,
    generate_unique_filename
)

from .validators import (
    validate_email,
    validate_phone,
    validate_url,
    validate_uuid,
    validate_date_range,
    sanitize_input
)

from .helpers import (
    format_currency,
    format_percentage,
    format_file_size,
    parse_date,
    calculate_age,
    truncate_string,
    generate_random_string,
    hash_string
)

__version__ = "1.0.0"
__author__ = "Elizabeth Díaz Familia"

__all__ = [
    # File Handlers
    "FileHandler",
    "validate_file_upload",
    "save_uploaded_file",
    "get_file_info",
    "generate_unique_filename",
    
    # Validators
    "validate_email",
    "validate_phone",
    "validate_url",
    "validate_uuid",
    "validate_date_range",
    "sanitize_input",
    
    # Helpers
    "format_currency",
    "format_percentage",
    "format_file_size",
    "parse_date",
    "calculate_age",
    "truncate_string",
    "generate_random_string",
    "hash_string"
]
