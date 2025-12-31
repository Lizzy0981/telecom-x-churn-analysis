"""
📍 Geolocation API
==================

API para servicios de geolocalización.

Autor: Elizabeth Díaz Familia
"""

import requests
from typing import Dict, Optional, Tuple


class GeolocationAPI:
    """API de geolocalización"""
    
    def __init__(self):
        """Inicializar API"""
        self.base_url = "https://nominatim.openstreetmap.org"
        
    def geocode(self, address: str) -> Optional[Tuple[float, float]]:
        """
        Convertir dirección a coordenadas
        
        Args:
            address: Dirección a geocodificar
            
        Returns:
            (latitud, longitud) o None
        """
        try:
            url = f"{self.base_url}/search"
            params = {
                'q': address,
                'format': 'json',
                'limit': 1
            }
            headers = {
                'User-Agent': 'TelecomX-Analysis/1.0'
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data:
                lat = float(data[0]['lat'])
                lon = float(data[0]['lon'])
                print(f"✅ Geocodificado: {address} -> ({lat}, {lon})")
                return (lat, lon)
            else:
                print(f"⚠️ No se encontraron coordenadas")
                return None
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return None
    
    def reverse_geocode(self, lat: float, lon: float) -> Optional[str]:
        """
        Convertir coordenadas a dirección
        
        Args:
            lat: Latitud
            lon: Longitud
            
        Returns:
            Dirección o None
        """
        try:
            url = f"{self.base_url}/reverse"
            params = {
                'lat': lat,
                'lon': lon,
                'format': 'json'
            }
            headers = {
                'User-Agent': 'TelecomX-Analysis/1.0'
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            address = data.get('display_name')
            if address:
                print(f"✅ Geocodificación inversa: ({lat}, {lon}) -> {address}")
                return address
            return None
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return None


if __name__ == "__main__":
    api = GeolocationAPI()
    coords = api.geocode("New York City")
    if coords:
        print(f"Coordenadas: {coords}")
