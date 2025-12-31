"""
🛠️ Helpers
==========

Autor: Elizabeth Díaz Familia
"""

from datetime import datetime

def get_timestamp():
    """Obtener timestamp actual"""
    return datetime.now().strftime('%Y%m%d_%H%M%S')

def format_currency(amount: float, currency: str = 'USD') -> str:
    """Formatear moneda"""
    return f"{currency} {amount:,.2f}"
