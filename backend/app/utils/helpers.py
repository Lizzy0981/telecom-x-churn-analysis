# backend/app/utils/helpers.py
"""
Helper Functions
================

General-purpose helper functions for common operations.

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Optional, Any, Union
from datetime import datetime, date, timedelta
import random
import string
import hashlib
import logging

logger = logging.getLogger(__name__)


# ==================== STRING FORMATTING ====================

def format_currency(
    amount: float,
    currency: str = 'USD',
    locale: str = 'en_US'
) -> str:
    """
    Format currency amount.
    
    Args:
        amount: Amount
        currency: Currency code
        locale: Locale
        
    Returns:
        str: Formatted currency
    """
    if currency == 'USD':
        return f"${amount:,.2f}"
    elif currency == 'EUR':
        return f"€{amount:,.2f}"
    else:
        return f"{amount:,.2f} {currency}"


def format_percentage(value: float, decimals: int = 2) -> str:
    """
    Format percentage.
    
    Args:
        value: Value (0-1 or 0-100)
        decimals: Decimal places
        
    Returns:
        str: Formatted percentage
    """
    # Auto-detect if already percentage
    if value > 1:
        return f"{value:.{decimals}f}%"
    else:
        return f"{value * 100:.{decimals}f}%"


def format_file_size(size_bytes: int) -> str:
    """
    Format file size in human-readable format.
    
    Args:
        size_bytes: Size in bytes
        
    Returns:
        str: Formatted size
    """
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    
    return f"{size_bytes:.2f} PB"


def truncate_string(
    text: str,
    max_length: int = 100,
    suffix: str = '...'
) -> str:
    """
    Truncate string to max length.
    
    Args:
        text: Input text
        max_length: Maximum length
        suffix: Suffix for truncated text
        
    Returns:
        str: Truncated text
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


# ==================== DATE/TIME HELPERS ====================

def parse_date(
    date_string: str,
    format: str = '%Y-%m-%d'
) -> Optional[date]:
    """
    Parse date string.
    
    Args:
        date_string: Date string
        format: Date format
        
    Returns:
        date: Parsed date or None
    """
    try:
        return datetime.strptime(date_string, format).date()
    except ValueError:
        logger.warning(f"Failed to parse date: {date_string}")
        return None


def calculate_age(birth_date: date, reference_date: Optional[date] = None) -> int:
    """
    Calculate age from birth date.
    
    Args:
        birth_date: Birth date
        reference_date: Reference date (default: today)
        
    Returns:
        int: Age in years
    """
    if reference_date is None:
        reference_date = date.today()
    
    age = reference_date.year - birth_date.year
    
    # Adjust if birthday hasn't occurred this year
    if (reference_date.month, reference_date.day) < (birth_date.month, birth_date.day):
        age -= 1
    
    return age


def get_date_range(
    days: int,
    end_date: Optional[date] = None
) -> tuple:
    """
    Get date range.
    
    Args:
        days: Number of days
        end_date: End date (default: today)
        
    Returns:
        tuple: (start_date, end_date)
    """
    if end_date is None:
        end_date = date.today()
    
    start_date = end_date - timedelta(days=days)
    
    return start_date, end_date


def format_datetime(
    dt: datetime,
    format: str = '%Y-%m-%d %H:%M:%S'
) -> str:
    """
    Format datetime.
    
    Args:
        dt: Datetime
        format: Format string
        
    Returns:
        str: Formatted datetime
    """
    return dt.strftime(format)


# ==================== NUMBER HELPERS ====================

def round_to_nearest(value: float, nearest: float = 0.5) -> float:
    """
    Round to nearest value.
    
    Args:
        value: Value to round
        nearest: Nearest multiple
        
    Returns:
        float: Rounded value
    """
    return round(value / nearest) * nearest


def clamp(value: float, min_value: float, max_value: float) -> float:
    """
    Clamp value between min and max.
    
    Args:
        value: Value
        min_value: Minimum
        max_value: Maximum
        
    Returns:
        float: Clamped value
    """
    return max(min_value, min(value, max_value))


def normalize(value: float, min_val: float, max_val: float) -> float:
    """
    Normalize value to 0-1 range.
    
    Args:
        value: Value
        min_val: Minimum value
        max_val: Maximum value
        
    Returns:
        float: Normalized value (0-1)
    """
    if max_val == min_val:
        return 0.0
    
    return (value - min_val) / (max_val - min_val)


# ==================== RANDOM/HASH HELPERS ====================

def generate_random_string(
    length: int = 32,
    include_digits: bool = True,
    include_special: bool = False
) -> str:
    """
    Generate random string.
    
    Args:
        length: String length
        include_digits: Include digits
        include_special: Include special chars
        
    Returns:
        str: Random string
    """
    chars = string.ascii_letters
    
    if include_digits:
        chars += string.digits
    
    if include_special:
        chars += string.punctuation
    
    return ''.join(random.choice(chars) for _ in range(length))


def hash_string(
    text: str,
    algorithm: str = 'sha256'
) -> str:
    """
    Hash string.
    
    Args:
        text: Input text
        algorithm: Hash algorithm
        
    Returns:
        str: Hex digest
    """
    hash_obj = hashlib.new(algorithm)
    hash_obj.update(text.encode('utf-8'))
    return hash_obj.hexdigest()


def generate_token(length: int = 32) -> str:
    """
    Generate secure token.
    
    Args:
        length: Token length
        
    Returns:
        str: Secure token
    """
    import secrets
    return secrets.token_urlsafe(length)


# ==================== LIST HELPERS ====================

def chunk_list(lst: list, chunk_size: int) -> list:
    """
    Split list into chunks.
    
    Args:
        lst: Input list
        chunk_size: Chunk size
        
    Returns:
        list: List of chunks
    """
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]


def flatten_list(nested_list: list) -> list:
    """
    Flatten nested list.
    
    Args:
        nested_list: Nested list
        
    Returns:
        list: Flattened list
    """
    result = []
    for item in nested_list:
        if isinstance(item, list):
            result.extend(flatten_list(item))
        else:
            result.append(item)
    return result


def deduplicate_list(lst: list) -> list:
    """
    Remove duplicates from list preserving order.
    
    Args:
        lst: Input list
        
    Returns:
        list: Deduplicated list
    """
    seen = set()
    return [x for x in lst if not (x in seen or seen.add(x))]
