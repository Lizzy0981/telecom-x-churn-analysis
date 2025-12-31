"""
✅ Validators
============

Autor: Elizabeth Díaz Familia
"""

import re

class Validators:
    """Validadores de datos"""
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validar email"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validar teléfono"""
        pattern = r'^\+?1?\d{9,15}$'
        return bool(re.match(pattern, phone))
