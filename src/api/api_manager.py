"""
🌐 API Manager
==============

Gestor principal de APIs que coordina todas las integraciones externas.

Autor: Elizabeth Díaz Familia
"""

import requests
from typing import Dict, Any, Optional
import time
from datetime import datetime
import json


class APIManager:
    """Gestor principal de APIs"""
    
    def __init__(self, config: Optional[Dict] = None):
        """
        Inicializar el gestor de APIs
        
        Args:
            config: Configuración de APIs
        """
        self.config = config or {}
        self.api_calls_count = 0
        self.cache = {}
        self.rate_limit = self.config.get('rate_limit', 100)
        self.timeout = self.config.get('timeout', 30)
        
    def make_request(self, url: str, params: Optional[Dict] = None,
                    headers: Optional[Dict] = None, method: str = 'GET',
                    use_cache: bool = True) -> Dict[str, Any]:
        """
        Realizar petición HTTP con manejo de errores y rate limiting
        
        Args:
            url: URL de la API
            params: Parámetros de la petición
            headers: Headers HTTP
            method: Método HTTP
            use_cache: Usar caché
            
        Returns:
            Respuesta de la API
        """
        # Check cache
        cache_key = f"{url}:{json.dumps(params, sort_keys=True)}"
        if use_cache and cache_key in self.cache:
            print(f"✅ Cache hit: {url}")
            return self.cache[cache_key]
        
        # Rate limiting
        if self.api_calls_count >= self.rate_limit:
            print("⚠️ Rate limit alcanzado, esperando...")
            time.sleep(60)
            self.api_calls_count = 0
        
        try:
            if method == 'GET':
                response = requests.get(url, params=params, headers=headers, timeout=self.timeout)
            else:
                response = requests.post(url, json=params, headers=headers, timeout=self.timeout)
            
            response.raise_for_status()
            data = response.json()
            
            # Guardar en caché
            if use_cache:
                self.cache[cache_key] = data
            
            self.api_calls_count += 1
            print(f"✅ API request successful: {url}")
            
            return data
            
        except requests.exceptions.Timeout:
            print(f"❌ Timeout: {url}")
            return {"error": "Timeout"}
        except requests.exceptions.RequestException as e:
            print(f"❌ Error en petición: {str(e)}")
            return {"error": str(e)}
        except json.JSONDecodeError:
            print(f"❌ Error decodificando JSON")
            return {"error": "Invalid JSON"}
    
    def get_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas de uso de APIs"""
        return {
            'total_calls': self.api_calls_count,
            'cache_size': len(self.cache),
            'rate_limit': self.rate_limit
        }


if __name__ == "__main__":
    manager = APIManager()
    print("✅ API Manager inicializado")
