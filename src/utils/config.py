"""
⚙️ Config
=========

Autor: Elizabeth Díaz Familia
"""

import json
from pathlib import Path

class Config:
    """Configuración del proyecto"""
    
    @staticmethod
    def load_config(filepath: str = 'config/settings.json'):
        """Cargar configuración"""
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except:
            return {}
