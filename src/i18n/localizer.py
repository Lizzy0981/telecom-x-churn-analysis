"""
📍 Localizer
===========

Autor: Elizabeth Díaz Familia
"""

from datetime import datetime

class Localizer:
    """Localizador de datos"""
    
    @staticmethod
    def format_date(date, locale: str = 'es'):
        """Formatear fecha según locale"""
        if locale == 'es':
            return date.strftime('%d/%m/%Y')
        else:
            return date.strftime('%Y-%m-%d')
