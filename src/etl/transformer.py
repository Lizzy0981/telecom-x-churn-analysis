"""
🔧 Data Transformer Module
===========================

Módulo para transformar y limpiar datos:
- Limpieza de datos
- Creación de variables derivadas
- Encoding de variables categóricas
- Normalización y escalado
- Feature engineering

Autor: Elizabeth Díaz Familia
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Optional, Any
from datetime import datetime


class DataTransformer:
    """
    Clase para transformar y limpiar datos
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Inicializar el transformador de datos
        
        Args:
            config: Configuración del transformador
        """
        self.config = config or {}
        self.transformations_log = []
        
    def clean_column_names(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Limpiar nombres de columnas
        
        Args:
            df: DataFrame a limpiar
            
        Returns:
            DataFrame con nombres de columnas limpios
        """
        df_clean = df.copy()
        df_clean.columns = df_clean.columns.str.strip().str.replace(' ', '_')
        
        self.transformations_log.append('Column names cleaned')
        print("✅ Nombres de columnas limpiados")
        return df_clean
    
    def handle_missing_values(self, df: pd.DataFrame, 
                             strategy: str = 'drop',
                             fill_value: Any = None) -> pd.DataFrame:
        """
        Manejar valores faltantes
        
        Args:
            df: DataFrame
            strategy: 'drop', 'fill', 'mean', 'median', 'mode'
            fill_value: Valor para rellenar (si strategy='fill')
            
        Returns:
            DataFrame sin valores faltantes
        """
        df_clean = df.copy()
        missing_before = df_clean.isnull().sum().sum()
        
        if strategy == 'drop':
            df_clean = df_clean.dropna()
        elif strategy == 'fill':
            df_clean = df_clean.fillna(fill_value)
        elif strategy == 'mean':
            numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
            df_clean[numeric_cols] = df_clean[numeric_cols].fillna(df_clean[numeric_cols].mean())
        elif strategy == 'median':
            numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
            df_clean[numeric_cols] = df_clean[numeric_cols].fillna(df_clean[numeric_cols].median())
        elif strategy == 'mode':
            for col in df_clean.columns:
                df_clean[col] = df_clean[col].fillna(df_clean[col].mode()[0] if not df_clean[col].mode().empty else None)
        
        missing_after = df_clean.isnull().sum().sum()
        
        self.transformations_log.append(f'Missing values handled: {missing_before} → {missing_after}')
        print(f"✅ Valores faltantes manejados: {missing_before} → {missing_after}")
        return df_clean
    
    def remove_duplicates(self, df: pd.DataFrame, 
                         subset: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Eliminar registros duplicados
        
        Args:
            df: DataFrame
            subset: Columnas a considerar para duplicados
            
        Returns:
            DataFrame sin duplicados
        """
        df_clean = df.copy()
        duplicates_before = df_clean.duplicated(subset=subset).sum()
        df_clean = df_clean.drop_duplicates(subset=subset)
        duplicates_after = df_clean.duplicated(subset=subset).sum()
        
        self.transformations_log.append(f'Duplicates removed: {duplicates_before}')
        print(f"✅ Duplicados eliminados: {duplicates_before}")
        return df_clean
    
    def convert_data_types(self, df: pd.DataFrame, 
                          type_map: Dict[str, str]) -> pd.DataFrame:
        """
        Convertir tipos de datos
        
        Args:
            df: DataFrame
            type_map: Diccionario {columna: tipo}
            
        Returns:
            DataFrame con tipos convertidos
        """
        df_clean = df.copy()
        
        for col, dtype in type_map.items():
            if col in df_clean.columns:
                try:
                    df_clean[col] = df_clean[col].astype(dtype)
                    print(f"✅ {col} convertido a {dtype}")
                except Exception as e:
                    print(f"⚠️ Error convirtiendo {col}: {str(e)}")
        
        self.transformations_log.append('Data types converted')
        return df_clean
    
    def create_tenure_groups(self, df: pd.DataFrame, 
                            tenure_col: str = 'tenure') -> pd.DataFrame:
        """
        Crear grupos de tenure
        
        Args:
            df: DataFrame
            tenure_col: Nombre de la columna de tenure
            
        Returns:
            DataFrame con columna TenureGroup
        """
        df_new = df.copy()
        
        df_new['TenureGroup'] = pd.cut(
            df_new[tenure_col],
            bins=[0, 12, 24, 48, 73],
            labels=['0-12 months', '12-24 months', '24-48 months', '48+ months'],
            include_lowest=True
        )
        
        self.transformations_log.append('Tenure groups created')
        print("✅ Grupos de tenure creados")
        return df_new
    
    def create_charges_groups(self, df: pd.DataFrame,
                             charges_col: str = 'MonthlyCharges') -> pd.DataFrame:
        """
        Crear grupos de cargos mensuales
        
        Args:
            df: DataFrame
            charges_col: Nombre de la columna de cargos
            
        Returns:
            DataFrame con columna ChargesGroup
        """
        df_new = df.copy()
        
        df_new['ChargesGroup'] = pd.cut(
            df_new[charges_col],
            bins=[0, 35, 70, 120],
            labels=['Low', 'Medium', 'High'],
            include_lowest=True
        )
        
        self.transformations_log.append('Charges groups created')
        print("✅ Grupos de cargos creados")
        return df_new
    
    def calculate_total_services(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calcular total de servicios por cliente
        
        Args:
            df: DataFrame
            
        Returns:
            DataFrame con columna TotalServices
        """
        df_new = df.copy()
        
        service_cols = [
            'PhoneService', 'InternetService', 'OnlineSecurity',
            'OnlineBackup', 'DeviceProtection', 'TechSupport',
            'StreamingTV', 'StreamingMovies'
        ]
        
        df_new['TotalServices'] = 0
        for col in service_cols:
            if col in df_new.columns:
                df_new['TotalServices'] += (df_new[col] == 'Yes').astype(int)
        
        self.transformations_log.append('Total services calculated')
        print("✅ Total de servicios calculado")
        return df_new
    
    def calculate_clv(self, df: pd.DataFrame,
                     total_charges_col: str = 'TotalCharges',
                     multiplier: float = 1.2) -> pd.DataFrame:
        """
        Calcular Customer Lifetime Value estimado
        
        Args:
            df: DataFrame
            total_charges_col: Columna de cargos totales
            multiplier: Multiplicador para estimar CLV
            
        Returns:
            DataFrame con columna CLV_Estimate
        """
        df_new = df.copy()
        
        df_new['CLV_Estimate'] = (df_new[total_charges_col] * multiplier).round(2)
        
        self.transformations_log.append('CLV calculated')
        print("✅ Customer Lifetime Value estimado")
        return df_new
    
    def encode_categorical(self, df: pd.DataFrame,
                          columns: List[str],
                          method: str = 'label') -> pd.DataFrame:
        """
        Codificar variables categóricas
        
        Args:
            df: DataFrame
            columns: Columnas a codificar
            method: 'label' o 'onehot'
            
        Returns:
            DataFrame con variables codificadas
        """
        df_encoded = df.copy()
        
        if method == 'label':
            from sklearn.preprocessing import LabelEncoder
            le = LabelEncoder()
            
            for col in columns:
                if col in df_encoded.columns:
                    df_encoded[f'{col}_Encoded'] = le.fit_transform(df_encoded[col].astype(str))
                    print(f"✅ {col} codificado (Label Encoding)")
        
        elif method == 'onehot':
            df_encoded = pd.get_dummies(df_encoded, columns=columns, prefix=columns)
            print(f"✅ Variables codificadas (One-Hot Encoding)")
        
        self.transformations_log.append(f'Categorical encoding: {method}')
        return df_encoded
    
    def normalize_numeric(self, df: pd.DataFrame,
                         columns: List[str],
                         method: str = 'minmax') -> pd.DataFrame:
        """
        Normalizar variables numéricas
        
        Args:
            df: DataFrame
            columns: Columnas a normalizar
            method: 'minmax' o 'standard'
            
        Returns:
            DataFrame con variables normalizadas
        """
        df_norm = df.copy()
        
        if method == 'minmax':
            from sklearn.preprocessing import MinMaxScaler
            scaler = MinMaxScaler()
            
            for col in columns:
                if col in df_norm.columns:
                    df_norm[f'{col}_Normalized'] = scaler.fit_transform(df_norm[[col]])
                    print(f"✅ {col} normalizado (MinMax)")
        
        elif method == 'standard':
            from sklearn.preprocessing import StandardScaler
            scaler = StandardScaler()
            
            for col in columns:
                if col in df_norm.columns:
                    df_norm[f'{col}_Scaled'] = scaler.fit_transform(df_norm[[col]])
                    print(f"✅ {col} escalado (Standard)")
        
        self.transformations_log.append(f'Numeric normalization: {method}')
        return df_norm
    
    def add_timestamp(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Agregar timestamp de procesamiento
        
        Args:
            df: DataFrame
            
        Returns:
            DataFrame con timestamp
        """
        df_new = df.copy()
        df_new['ProcessedAt'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        print("✅ Timestamp agregado")
        return df_new
    
    def apply_all_transformations(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Aplicar todas las transformaciones en secuencia
        
        Args:
            df: DataFrame original
            
        Returns:
            DataFrame completamente transformado
        """
        print("\n🔧 Iniciando transformaciones...")
        print("=" * 60)
        
        df_transformed = df.copy()
        
        # 1. Limpiar nombres de columnas
        df_transformed = self.clean_column_names(df_transformed)
        
        # 2. Manejar valores faltantes
        df_transformed = self.handle_missing_values(df_transformed, strategy='drop')
        
        # 3. Eliminar duplicados
        df_transformed = self.remove_duplicates(df_transformed)
        
        # 4. Crear variables derivadas
        if 'tenure' in df_transformed.columns:
            df_transformed = self.create_tenure_groups(df_transformed)
        
        if 'MonthlyCharges' in df_transformed.columns:
            df_transformed = self.create_charges_groups(df_transformed)
        
        df_transformed = self.calculate_total_services(df_transformed)
        
        if 'TotalCharges' in df_transformed.columns:
            df_transformed = self.calculate_clv(df_transformed)
        
        # 5. Agregar timestamp
        df_transformed = self.add_timestamp(df_transformed)
        
        print("=" * 60)
        print(f"✅ Transformaciones completadas")
        print(f"📊 Registros: {len(df)} → {len(df_transformed)}")
        print(f"📋 Columnas: {len(df.columns)} → {len(df_transformed.columns)}")
        
        return df_transformed
    
    def get_transformation_log(self) -> List[str]:
        """
        Obtener log de transformaciones aplicadas
        
        Returns:
            Lista de transformaciones
        """
        return self.transformations_log


if __name__ == "__main__":
    # Ejemplo de uso
    from extractor import DataExtractor
    
    # Extraer datos
    extractor = DataExtractor()
    df = extractor.generate_mock_data(100)
    
    # Transformar datos
    transformer = DataTransformer()
    df_transformed = transformer.apply_all_transformations(df)
    
    print("\n📋 Log de transformaciones:")
    for i, trans in enumerate(transformer.get_transformation_log(), 1):
        print(f"   {i}. {trans}")
