"""
🌐 Translator
============

Autor: Elizabeth Díaz Familia
"""

import json
from pathlib import Path

class Translator:
    """Sistema de traducción"""
    
    def __init__(self, language: str = 'es'):
        self.language = language
        self.translations = self.load_translations()
        
    def load_translations(self):
        """Cargar traducciones"""
        try:
            with open(f'translations/{self.language}.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}
    
    def translate(self, key: str) -> str:
        """Traducir clave"""
        return self.translations.get(key, key)
