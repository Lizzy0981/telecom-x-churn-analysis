"""
🎲 Mock Data Generator
======================

Generador de datos mock para APIs externas.

Autor: Elizabeth Díaz Familia
"""

import random
from datetime import datetime, timedelta
from typing import Dict, List


class MockDataGenerator:
    """Generador de datos mock"""
    
    @staticmethod
    def generate_exchange_rates() -> Dict:
        """Generar tasas de cambio mock"""
        return {
            "base": "USD",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "rates": {
                "EUR": round(random.uniform(0.85, 0.95), 4),
                "GBP": round(random.uniform(0.75, 0.85), 4),
                "JPY": round(random.uniform(110, 150), 2),
                "CAD": round(random.uniform(1.2, 1.4), 4),
                "AUD": round(random.uniform(1.3, 1.5), 4),
                "CNY": round(random.uniform(6.5, 7.5), 4),
            }
        }
    
    @staticmethod
    def generate_weather_data(city: str = "Demo City") -> Dict:
        """Generar datos meteorológicos mock"""
        return {
            "name": city,
            "main": {
                "temp": round(random.uniform(15, 30), 1),
                "feels_like": round(random.uniform(14, 29), 1),
                "humidity": random.randint(40, 80),
                "pressure": random.randint(1000, 1020)
            },
            "weather": [
                {
                    "main": random.choice(["Clear", "Clouds", "Rain"]),
                    "description": random.choice(["clear sky", "few clouds", "light rain"])
                }
            ],
            "wind": {
                "speed": round(random.uniform(0, 15), 1)
            }
        }
    
    @staticmethod
    def generate_news_articles(count: int = 5) -> Dict:
        """Generar noticias mock"""
        articles = []
        topics = ["5G", "IoT", "Cloud Computing", "Fiber Optic", "Mobile Networks"]
        
        for i in range(count):
            article = {
                "title": f"Latest developments in {random.choice(topics)}",
                "description": f"Mock article about telecommunications industry trends #{i+1}",
                "publishedAt": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
                "source": {"name": f"Tech News {random.randint(1, 10)}"},
                "url": f"https://example.com/article-{i+1}"
            }
            articles.append(article)
        
        return {
            "status": "ok",
            "totalResults": count,
            "articles": articles
        }
    
    @staticmethod
    def generate_economic_indicator() -> Dict:
        """Generar indicador económico mock"""
        years = [datetime.now().year - i for i in range(5)]
        return {
            "indicator": {
                "id": "NY.GDP.MKTP.CD",
                "value": "GDP (current US$)"
            },
            "data": [
                {
                    "country": "Demo Country",
                    "countryiso3code": "DMO",
                    "date": str(year),
                    "value": round(random.uniform(1e12, 5e12), 2)
                }
                for year in years
            ]
        }


if __name__ == "__main__":
    generator = MockDataGenerator()
    
    print("💱 Exchange Rates Mock:")
    rates = generator.generate_exchange_rates()
    print(rates)
    
    print("\n🌤️ Weather Mock:")
    weather = generator.generate_weather_data("New York")
    print(weather)
    
    print("\n📰 News Mock:")
    news = generator.generate_news_articles(3)
    print(f"Total articles: {news['totalResults']}")
