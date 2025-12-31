"""
📥 Data Extractor Module
========================

Módulo para extraer datos desde múltiples fuentes:
- Archivos CSV
- Archivos Excel
- APIs REST
- Bases de datos
- Datos mock generados

Autor: Elizabeth Díaz Familia
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional, Dict, Any
import requests
import json


class DataExtractor:
    """
    Clase para extraer datos desde múltiples fuentes
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Inicializar el extractor de datos
        
        Args:
            config: Configuración del extractor
        """
        self.config = config or {}
        self.data = None
        
    def extract_from_csv(self, filepath: str, **kwargs) -> pd.DataFrame:
        """
        Extraer datos desde archivo CSV
        
        Args:
            filepath: Ruta al archivo CSV
            **kwargs: Argumentos adicionales para pd.read_csv
            
        Returns:
            DataFrame con los datos extraídos
        """
        try:
            df = pd.read_csv(filepath, **kwargs)
            print(f"✅ Datos extraídos desde CSV: {len(df):,} registros")
            self.data = df
            return df
        except Exception as e:
            print(f"❌ Error al extraer CSV: {str(e)}")
            raise
    
    def extract_from_excel(self, filepath: str, sheet_name: str = 0, **kwargs) -> pd.DataFrame:
        """
        Extraer datos desde archivo Excel
        
        Args:
            filepath: Ruta al archivo Excel
            sheet_name: Nombre o índice de la hoja
            **kwargs: Argumentos adicionales para pd.read_excel
            
        Returns:
            DataFrame con los datos extraídos
        """
        try:
            df = pd.read_excel(filepath, sheet_name=sheet_name, **kwargs)
            print(f"✅ Datos extraídos desde Excel: {len(df):,} registros")
            self.data = df
            return df
        except Exception as e:
            print(f"❌ Error al extraer Excel: {str(e)}")
            raise
    
    def extract_from_api(self, url: str, params: Optional[Dict] = None, 
                         headers: Optional[Dict] = None) -> Dict:
        """
        Extraer datos desde API REST
        
        Args:
            url: URL de la API
            params: Parámetros de la petición
            headers: Headers de la petición
            
        Returns:
            Diccionario con la respuesta de la API
        """
        try:
            response = requests.get(url, params=params, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            print(f"✅ Datos extraídos desde API: {url}")
            return data
        except Exception as e:
            print(f"❌ Error al extraer desde API: {str(e)}")
            raise
    
    def generate_mock_data(self, n_records: int = 1000) -> pd.DataFrame:
        """
        Generar datos mock para demostración
        
        Args:
            n_records: Número de registros a generar
            
        Returns:
            DataFrame con datos mock
        """
        np.random.seed(42)
        
        data = {
            'CustomerID': [f'CUST{i:05d}' for i in range(1, n_records + 1)],
            'Gender': np.random.choice(['Male', 'Female'], n_records),
            'SeniorCitizen': np.random.choice([0, 1], n_records, p=[0.84, 0.16]),
            'Partner': np.random.choice(['Yes', 'No'], n_records, p=[0.48, 0.52]),
            'Dependents': np.random.choice(['Yes', 'No'], n_records, p=[0.30, 0.70]),
            'tenure': np.random.randint(1, 73, n_records),
            'PhoneService': np.random.choice(['Yes', 'No'], n_records, p=[0.90, 0.10]),
            'MultipleLines': np.random.choice(['Yes', 'No', 'No phone service'], n_records),
            'InternetService': np.random.choice(['DSL', 'Fiber optic', 'No'], n_records, p=[0.34, 0.44, 0.22]),
            'OnlineSecurity': np.random.choice(['Yes', 'No', 'No internet service'], n_records),
            'OnlineBackup': np.random.choice(['Yes', 'No', 'No internet service'], n_records),
            'DeviceProtection': np.random.choice(['Yes', 'No', 'No internet service'], n_records),
            'TechSupport': np.random.choice(['Yes', 'No', 'No internet service'], n_records),
            'StreamingTV': np.random.choice(['Yes', 'No', 'No internet service'], n_records),
            'StreamingMovies': np.random.choice(['Yes', 'No', 'No internet service'], n_records),
            'Contract': np.random.choice(['Month-to-month', 'One year', 'Two year'], n_records, p=[0.55, 0.21, 0.24]),
            'PaperlessBilling': np.random.choice(['Yes', 'No'], n_records, p=[0.59, 0.41]),
            'PaymentMethod': np.random.choice(
                ['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)'],
                n_records,
                p=[0.34, 0.23, 0.22, 0.21]
            ),
            'MonthlyCharges': np.random.uniform(18.0, 120.0, n_records),
        }
        
        df = pd.DataFrame(data)
        
        # TotalCharges basado en tenure y MonthlyCharges
        df['TotalCharges'] = df['tenure'] * df['MonthlyCharges'] + np.random.uniform(-50, 50, n_records)
        df['TotalCharges'] = df['TotalCharges'].clip(lower=0).round(2)
        df['MonthlyCharges'] = df['MonthlyCharges'].round(2)
        
        # Generar Churn con lógica realista
        churn_prob = 0.27  # probabilidad base
        
        # Factores que afectan churn
        churn_factors = np.zeros(n_records)
        churn_factors += (df['Contract'] == 'Month-to-month').astype(int) * 0.3
        churn_factors += (df['tenure'] < 12).astype(int) * 0.2
        churn_factors += (df['InternetService'] == 'Fiber optic').astype(int) * 0.1
        churn_factors += (df['SeniorCitizen'] == 1).astype(int) * 0.1
        churn_factors += (df['PaperlessBilling'] == 'Yes').astype(int) * 0.05
        
        df['Churn'] = np.random.random(n_records) < (churn_prob + churn_factors * 0.5)
        df['Churn'] = df['Churn'].map({True: 'Yes', False: 'No'})
        
        print(f"✅ Datos mock generados: {len(df):,} registros")
        print(f"   📊 Tasa de Churn: {(df['Churn'] == 'Yes').mean():.2%}")
        
        self.data = df
        return df
    
    def extract_from_json(self, filepath: str) -> Dict:
        """
        Extraer datos desde archivo JSON
        
        Args:
            filepath: Ruta al archivo JSON
            
        Returns:
            Diccionario con los datos
        """
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f"✅ Datos extraídos desde JSON: {filepath}")
            return data
        except Exception as e:
            print(f"❌ Error al extraer JSON: {str(e)}")
            raise
    
    def get_data_info(self) -> Dict[str, Any]:
        """
        Obtener información sobre los datos extraídos
        
        Returns:
            Diccionario con información del dataset
        """
        if self.data is None:
            return {"error": "No hay datos cargados"}
        
        return {
            'rows': len(self.data),
            'columns': len(self.data.columns),
            'column_names': list(self.data.columns),
            'memory_usage': f"{self.data.memory_usage(deep=True).sum() / 1024**2:.2f} MB",
            'null_values': self.data.isnull().sum().sum(),
            'duplicates': self.data.duplicated().sum()
        }


if __name__ == "__main__":
    # Ejemplo de uso
    extractor = DataExtractor()
    
    # Generar datos mock
    df = extractor.generate_mock_data(1000)
    
    # Información del dataset
    info = extractor.get_data_info()
    print("\n📊 Información del Dataset:")
    for key, value in info.items():
        print(f"   {key}: {value}")
