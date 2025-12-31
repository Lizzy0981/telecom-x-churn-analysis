"""
📰 News API
===========

API para obtener noticias de la industria de telecomunicaciones.

Autor: Elizabeth Díaz Familia
"""

import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta


class NewsAPI:
    """API de noticias"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Inicializar API
        
        Args:
            api_key: Clave de NewsAPI.org
        """
        self.base_url = "https://newsapi.org/v2"
        self.api_key = api_key or "demo"
        
    def get_news(self, query: str = 'telecommunications', 
                language: str = 'en', page_size: int = 10) -> Dict:
        """
        Obtener noticias
        
        Args:
            query: Término de búsqueda
            language: Idioma
            page_size: Número de resultados
            
        Returns:
            Noticias encontradas
        """
        try:
            url = f"{self.base_url}/everything"
            params = {
                'q': query,
                'language': language,
                'pageSize': page_size,
                'apiKey': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            print(f"✅ {data.get('totalResults', 0)} noticias encontradas")
            return data
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {"error": str(e)}
    
    def get_top_headlines(self, category: str = 'technology',
                         country: str = 'us') -> Dict:
        """Obtener titulares principales"""
        try:
            url = f"{self.base_url}/top-headlines"
            params = {
                'category': category,
                'country': country,
                'apiKey': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            return {"error": str(e)}


if __name__ == "__main__":
    api = NewsAPI()
    news = api.get_news('5G technology')
    if 'articles' in news:
        print(f"Encontradas: {len(news['articles'])} noticias")
