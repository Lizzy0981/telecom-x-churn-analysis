# backend/app/utils/validators.py
"""
Validators
==========

Data validation utilities for business logic and security.

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

import re
from typing import Optional, Any
from datetime import datetime, date
import uuid as uuid_lib
import logging

logger = logging.getLogger(__name__)


# ==================== EMAIL VALIDATION ====================

def validate_email(email: str) -> bool:
    """
    Validate email address format.
    
    Args:
        email: Email address
        
    Returns:
        bool: True if valid
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


# ==================== PHONE VALIDATION ====================

def validate_phone(phone: str, country: str = 'US') -> bool:
    """
    Validate phone number format.
    
    Args:
        phone: Phone number
        country: Country code
        
    Returns:
        bool: True if valid
    """
    # Remove common formatting
    cleaned = re.sub(r'[\s\-\(\)]+', '', phone)
    
    if country == 'US':
        # US: 10 digits, optional +1
        pattern = r'^(\+?1)?[2-9]\d{2}[2-9]\d{6}$'
        return bool(re.match(pattern, cleaned))
    
    # International: 7-15 digits
    pattern = r'^\+?[1-9]\d{6,14}$'
    return bool(re.match(pattern, cleaned))


# ==================== URL VALIDATION ====================

def validate_url(url: str) -> bool:
    """
    Validate URL format.
    
    Args:
        url: URL string
        
    Returns:
        bool: True if valid
    """
    pattern = r'^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$'
    return bool(re.match(pattern, url))


# ==================== UUID VALIDATION ====================

def validate_uuid(uuid_string: str, version: int = 4) -> bool:
    """
    Validate UUID format.
    
    Args:
        uuid_string: UUID string
        version: UUID version
        
    Returns:
        bool: True if valid
    """
    try:
        uuid_obj = uuid_lib.UUID(uuid_string, version=version)
        return str(uuid_obj) == uuid_string
    except (ValueError, AttributeError):
        return False


# ==================== DATE VALIDATION ====================

def validate_date_range(
    start_date: date,
    end_date: date,
    max_days: Optional[int] = None
) -> bool:
    """
    Validate date range.
    
    Args:
        start_date: Start date
        end_date: End date
        max_days: Maximum days between dates
        
    Returns:
        bool: True if valid
    """
    if start_date > end_date:
        return False
    
    if max_days:
        delta = (end_date - start_date).days
        if delta > max_days:
            return False
    
    return True


# ==================== INPUT SANITIZATION ====================

def sanitize_input(text: str, allow_html: bool = False) -> str:
    """
    Sanitize user input to prevent XSS.
    
    Args:
        text: Input text
        allow_html: Whether to allow HTML
        
    Returns:
        str: Sanitized text
    """
    if not allow_html:
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
    
    # Remove null bytes
    text = text.replace('\x00', '')
    
    # Trim whitespace
    text = text.strip()
    
    return text


# ==================== BUSINESS VALIDATORS ====================

def validate_credit_card(card_number: str) -> bool:
    """
    Validate credit card using Luhn algorithm.
    
    Args:
        card_number: Credit card number
        
    Returns:
        bool: True if valid
    """
    # Remove spaces and dashes
    card_number = re.sub(r'[\s\-]', '', card_number)
    
    # Check if only digits
    if not card_number.isdigit():
        return False
    
    # Luhn algorithm
    def luhn_checksum(card):
        def digits_of(n):
            return [int(d) for d in str(n)]
        
        digits = digits_of(card)
        odd_digits = digits[-1::-2]
        even_digits = digits[-2::-2]
        
        checksum = sum(odd_digits)
        for d in even_digits:
            checksum += sum(digits_of(d * 2))
        
        return checksum % 10
    
    return luhn_checksum(card_number) == 0


def validate_percentage(value: float) -> bool:
    """
    Validate percentage value (0-100).
    
    Args:
        value: Percentage value
        
    Returns:
        bool: True if valid
    """
    return 0 <= value <= 100


def validate_probability(value: float) -> bool:
    """
    Validate probability value (0-1).
    
    Args:
        value: Probability value
        
    Returns:
        bool: True if valid
    """
    return 0 <= value <= 1


def validate_positive_number(value: float) -> bool:
    """
    Validate positive number.
    
    Args:
        value: Number
        
    Returns:
        bool: True if positive
    """
    return value > 0


# ==================== PASSWORD VALIDATION ====================

def validate_password_strength(password: str) -> dict:
    """
    Validate password strength.
    
    Args:
        password: Password string
        
    Returns:
        dict: Validation results
    """
    result = {
        'valid': True,
        'errors': [],
        'strength': 'weak'
    }
    
    # Length check
    if len(password) < 8:
        result['valid'] = False
        result['errors'].append('Password must be at least 8 characters')
    
    # Uppercase check
    if not any(c.isupper() for c in password):
        result['valid'] = False
        result['errors'].append('Password must contain uppercase letter')
    
    # Lowercase check
    if not any(c.islower() for c in password):
        result['valid'] = False
        result['errors'].append('Password must contain lowercase letter')
    
    # Digit check
    if not any(c.isdigit() for c in password):
        result['valid'] = False
        result['errors'].append('Password must contain digit')
    
    # Special character check
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        result['errors'].append('Password should contain special character')
    
    # Calculate strength
    if result['valid']:
        if len(password) >= 12 and re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            result['strength'] = 'strong'
        elif len(password) >= 10:
            result['strength'] = 'medium'
    
    return result
