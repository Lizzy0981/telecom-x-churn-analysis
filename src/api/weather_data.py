"""
🌤️ Weather Data API
===================

API para obtener datos meteorológicos (OpenWeatherMap).

Autor: Elizabeth Díaz Familia
"""

import requests
from typing import Dict, Optional


class WeatherAPI:
    """API de datos meteorológicos"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Inicializar API
        
        Args:
            api_key: Clave de OpenWeatherMap API
        """
        self.base_url = "https://api.openweathermap.org/data/2.5"
        self.api_key = api_key or "demo"  # Demo key
        
    def get_weather(self, city: str, units: str = 'metric') -> Dict:
        """
        Obtener clima actual
        
        Args:
            city: Nombre de la ciudad
            units: Unidades (metric/imperial)
            
        Returns:
            Datos del clima
        """
        try:
            url = f"{self.base_url}/weather"
            params = {
                'q': city,
                'appid': self.api_key,
                'units': units
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            print(f"✅ Clima obtenido para {city}")
            return data
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {"error": str(e)}
    
    def get_forecast(self, city: str, days: int = 5) -> Dict:
        """Obtener pronóstico"""
        try:
            url = f"{self.base_url}/forecast"
            params = {
                'q': city,
                'appid': self.api_key,
                'cnt': days * 8  # 8 mediciones por día
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
            
        except Exception as e:
            return {"error": str(e)}


if __name__ == "__main__":
    api = WeatherAPI()
    weather = api.get_weather('London')
    if 'main' in weather:
        print(f"Temperatura: {weather['main']['temp']}°C")
