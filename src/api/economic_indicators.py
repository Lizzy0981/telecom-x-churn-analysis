"""
📊 Economic Indicators API
==========================

API del Banco Mundial para indicadores económicos.

Autor: Elizabeth Díaz Familia
"""

import requests
from typing import Dict, List, Optional


class EconomicIndicatorsAPI:
    """API de indicadores económicos (World Bank)"""
    
    def __init__(self):
        """Inicializar API"""
        self.base_url = "https://api.worldbank.org/v2"
        
    def get_indicator(self, country: str, indicator: str, 
                     date_range: Optional[str] = None) -> Dict:
        """
        Obtener indicador económico
        
        Args:
            country: Código del país (ej: 'US', 'BR')
            indicator: Código del indicador (ej: 'NY.GDP.MKTP.CD')
            date_range: Rango de fechas (ej: '2020:2023')
            
        Returns:
            Datos del indicador
        """
        try:
            url = f"{self.base_url}/country/{country}/indicator/{indicator}"
            params = {
                'format': 'json',
                'per_page': 100
            }
            
            if date_range:
                params['date'] = date_range
            
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            if len(data) > 1:
                print(f"✅ Indicador obtenido: {indicator} para {country}")
                return {'success': True, 'data': data[1]}
            else:
                return {'success': False, 'error': 'No data'}
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_gdp(self, country: str) -> Optional[float]:
        """Obtener PIB de un país"""
        result = self.get_indicator(country, 'NY.GDP.MKTP.CD')
        if result.get('success') and result.get('data'):
            return result['data'][0].get('value')
        return None


if __name__ == "__main__":
    api = EconomicIndicatorsAPI()
    gdp = api.get_gdp('US')
    if gdp:
        print(f"PIB USA: ${gdp:,.0f}")
