"""
🗣️ Language Manager
===================

Autor: Elizabeth Díaz Familia
"""

SUPPORTED_LANGUAGES = {
    'es': 'Español',
    'en': 'English',
    'pt': 'Português',
    'fr': 'Français',
    'ar': 'العربية',
    'he': 'עברית',
    'zh': '中文'
}

class LanguageManager:
    """Gestor de idiomas"""
    
    @staticmethod
    def get_available_languages():
        """Obtener idiomas disponibles"""
        return SUPPORTED_LANGUAGES
