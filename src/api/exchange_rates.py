"""
💱 Exchange Rates API
====================

API para obtener tasas de cambio de divisas.

Autor: Elizabeth Díaz Familia
"""

import requests
from typing import Dict, Optional


class ExchangeRatesAPI:
    """API de tasas de cambio"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Inicializar API
        
        Args:
            api_key: Clave de API (opcional para ExchangeRate-API)
        """
        self.base_url = "https://api.exchangerate-api.com/v4/latest"
        self.api_key = api_key
        
    def get_rates(self, base_currency: str = 'USD') -> Dict:
        """
        Obtener tasas de cambio
        
        Args:
            base_currency: Moneda base
            
        Returns:
            Diccionario con tasas de cambio
        """
        try:
            url = f"{self.base_url}/{base_currency}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            print(f"✅ Tasas de cambio obtenidas para {base_currency}")
            return data
            
        except Exception as e:
            print(f"❌ Error obteniendo tasas: {str(e)}")
            return {"error": str(e)}
    
    def convert(self, amount: float, from_currency: str, to_currency: str) -> Optional[float]:
        """
        Convertir entre monedas
        
        Args:
            amount: Cantidad a convertir
            from_currency: Moneda origen
            to_currency: Moneda destino
            
        Returns:
            Cantidad convertida
        """
        rates_data = self.get_rates(from_currency)
        
        if 'error' in rates_data:
            return None
        
        if to_currency in rates_data.get('rates', {}):
            rate = rates_data['rates'][to_currency]
            converted = amount * rate
            print(f"✅ Conversión: {amount} {from_currency} = {converted:.2f} {to_currency}")
            return converted
        else:
            print(f"❌ Moneda no encontrada: {to_currency}")
            return None


if __name__ == "__main__":
    api = ExchangeRatesAPI()
    rates = api.get_rates('USD')
    if 'rates' in rates:
        print(f"EUR: {rates['rates'].get('EUR')}")
