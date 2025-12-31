"""
💾 Data Loader Module
=====================

Módulo para cargar datos procesados en diferentes formatos:
- CSV
- Excel
- Parquet
- JSON
- Bases de datos

Autor: Elizabeth Díaz Familia
"""

import pandas as pd
from pathlib import Path
from typing import Optional, Dict, Any
import json
from datetime import datetime


class DataLoader:
    """
    Clase para cargar datos procesados
    """
    
    def __init__(self, output_dir: str = 'data/processed'):
        """
        Inicializar el loader de datos
        
        Args:
            output_dir: Directorio de salida
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.loaded_files = []
        
    def save_to_csv(self, df: pd.DataFrame, filename: str, **kwargs) -> str:
        """
        Guardar DataFrame en CSV
        
        Args:
            df: DataFrame a guardar
            filename: Nombre del archivo
            **kwargs: Argumentos adicionales para to_csv
            
        Returns:
            Ruta del archivo guardado
        """
        filepath = self.output_dir / filename
        df.to_csv(filepath, index=False, **kwargs)
        
        self.loaded_files.append(str(filepath))
        print(f"✅ CSV guardado: {filepath}")
        print(f"   📊 Registros: {len(df):,}")
        return str(filepath)
    
    def save_to_excel(self, df: pd.DataFrame, filename: str, 
                      sheet_name: str = 'Data', **kwargs) -> str:
        """
        Guardar DataFrame en Excel
        
        Args:
            df: DataFrame a guardar
            filename: Nombre del archivo
            sheet_name: Nombre de la hoja
            **kwargs: Argumentos adicionales para to_excel
            
        Returns:
            Ruta del archivo guardado
        """
        filepath = self.output_dir / filename
        df.to_excel(filepath, sheet_name=sheet_name, index=False, **kwargs)
        
        self.loaded_files.append(str(filepath))
        print(f"✅ Excel guardado: {filepath}")
        print(f"   📊 Registros: {len(df):,}")
        return str(filepath)
    
    def save_to_parquet(self, df: pd.DataFrame, filename: str, **kwargs) -> str:
        """
        Guardar DataFrame en Parquet
        
        Args:
            df: DataFrame a guardar
            filename: Nombre del archivo
            **kwargs: Argumentos adicionales para to_parquet
            
        Returns:
            Ruta del archivo guardado
        """
        filepath = self.output_dir / filename
        df.to_parquet(filepath, index=False, **kwargs)
        
        self.loaded_files.append(str(filepath))
        print(f"✅ Parquet guardado: {filepath}")
        print(f"   📊 Registros: {len(df):,}")
        return str(filepath)
    
    def save_to_json(self, data: Dict, filename: str) -> str:
        """
        Guardar diccionario en JSON
        
        Args:
            data: Diccionario a guardar
            filename: Nombre del archivo
            
        Returns:
            Ruta del archivo guardado
        """
        filepath = self.output_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        
        self.loaded_files.append(str(filepath))
        print(f"✅ JSON guardado: {filepath}")
        return str(filepath)
    
    def save_metadata(self, df: pd.DataFrame, filename: str = 'metadata.json') -> str:
        """
        Guardar metadata del DataFrame
        
        Args:
            df: DataFrame
            filename: Nombre del archivo de metadata
            
        Returns:
            Ruta del archivo guardado
        """
        metadata = {
            'processed_at': datetime.now().isoformat(),
            'total_records': int(len(df)),
            'total_columns': int(len(df.columns)),
            'columns': list(df.columns),
            'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()},
            'memory_usage_mb': float(df.memory_usage(deep=True).sum() / 1024**2),
            'null_values': int(df.isnull().sum().sum()),
            'duplicates': int(df.duplicated().sum())
        }
        
        # Agregar estadísticas numéricas
        numeric_cols = df.select_dtypes(include=['number']).columns
        if len(numeric_cols) > 0:
            metadata['numeric_summary'] = df[numeric_cols].describe().to_dict()
        
        filepath = self.save_to_json(metadata, filename)
        return filepath
    
    def save_all_formats(self, df: pd.DataFrame, base_filename: str) -> Dict[str, str]:
        """
        Guardar DataFrame en todos los formatos
        
        Args:
            df: DataFrame a guardar
            base_filename: Nombre base del archivo (sin extensión)
            
        Returns:
            Diccionario con rutas de archivos guardados
        """
        print("\n💾 Guardando en múltiples formatos...")
        print("=" * 60)
        
        paths = {
            'csv': self.save_to_csv(df, f'{base_filename}.csv'),
            'excel': self.save_to_excel(df, f'{base_filename}.xlsx'),
            'parquet': self.save_to_parquet(df, f'{base_filename}.parquet'),
            'metadata': self.save_metadata(df, f'{base_filename}_metadata.json')
        }
        
        print("=" * 60)
        print("✅ Datos guardados en todos los formatos")
        
        return paths
    
    def get_loaded_files(self) -> list:
        """
        Obtener lista de archivos guardados
        
        Returns:
            Lista de rutas de archivos
        """
        return self.loaded_files


if __name__ == "__main__":
    # Ejemplo de uso
    from extractor import DataExtractor
    from transformer import DataTransformer
    
    # Pipeline simple
    extractor = DataExtractor()
    df = extractor.generate_mock_data(100)
    
    transformer = DataTransformer()
    df_transformed = transformer.apply_all_transformations(df)
    
    loader = DataLoader()
    paths = loader.save_all_formats(df_transformed, 'telecom_churn_clean')
    
    print("\n📁 Archivos guardados:")
    for format_type, path in paths.items():
        print(f"   {format_type}: {path}")
