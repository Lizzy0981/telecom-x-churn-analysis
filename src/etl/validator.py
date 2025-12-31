"""
✅ Data Validator Module
=========================

Módulo para validar la calidad de datos:
- Validación de tipos de datos
- Validación de rangos
- Validación de valores únicos
- Detección de outliers
- Reglas de negocio

Autor: Elizabeth Díaz Familia
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any, Optional


class DataValidator:
    """
    Clase para validar calidad de datos
    """
    
    def __init__(self):
        """Inicializar el validador"""
        self.validation_results = []
        self.errors = []
        self.warnings = []
        
    def validate_no_nulls(self, df: pd.DataFrame, columns: Optional[List[str]] = None) -> bool:
        """
        Validar que no existan valores nulos
        
        Args:
            df: DataFrame
            columns: Columnas a validar (None = todas)
            
        Returns:
            True si pasa la validación
        """
        cols_to_check = columns if columns else df.columns
        null_counts = df[cols_to_check].isnull().sum()
        
        has_nulls = null_counts.sum() > 0
        
        if has_nulls:
            null_cols = null_counts[null_counts > 0]
            self.errors.append(f"Valores nulos encontrados en: {dict(null_cols)}")
            print(f"❌ Validación fallida: Valores nulos en {len(null_cols)} columnas")
            return False
        else:
            print("✅ Validación exitosa: Sin valores nulos")
            return True
    
    def validate_no_duplicates(self, df: pd.DataFrame, subset: Optional[List[str]] = None) -> bool:
        """
        Validar que no existan duplicados
        
        Args:
            df: DataFrame
            subset: Columnas a considerar
            
        Returns:
            True si pasa la validación
        """
        duplicates = df.duplicated(subset=subset).sum()
        
        if duplicates > 0:
            self.errors.append(f"Duplicados encontrados: {duplicates}")
            print(f"❌ Validación fallida: {duplicates} registros duplicados")
            return False
        else:
            print("✅ Validación exitosa: Sin duplicados")
            return True
    
    def validate_data_types(self, df: pd.DataFrame, expected_types: Dict[str, str]) -> bool:
        """
        Validar tipos de datos
        
        Args:
            df: DataFrame
            expected_types: Dict {columna: tipo_esperado}
            
        Returns:
            True si pasa la validación
        """
        type_errors = []
        
        for col, expected_type in expected_types.items():
            if col in df.columns:
                actual_type = str(df[col].dtype)
                if expected_type not in actual_type:
                    type_errors.append(f"{col}: esperado {expected_type}, actual {actual_type}")
        
        if type_errors:
            self.errors.extend(type_errors)
            print(f"❌ Validación fallida: Tipos de datos incorrectos")
            for error in type_errors:
                print(f"   - {error}")
            return False
        else:
            print("✅ Validación exitosa: Tipos de datos correctos")
            return True
    
    def validate_value_range(self, df: pd.DataFrame, column: str, 
                            min_val: float, max_val: float) -> bool:
        """
        Validar que valores estén en rango
        
        Args:
            df: DataFrame
            column: Nombre de la columna
            min_val: Valor mínimo permitido
            max_val: Valor máximo permitido
            
        Returns:
            True si pasa la validación
        """
        if column not in df.columns:
            self.errors.append(f"Columna {column} no existe")
            return False
        
        out_of_range = ((df[column] < min_val) | (df[column] > max_val)).sum()
        
        if out_of_range > 0:
            self.warnings.append(f"{column}: {out_of_range} valores fuera de rango [{min_val}, {max_val}]")
            print(f"⚠️ Advertencia: {out_of_range} valores fuera de rango en {column}")
            return False
        else:
            print(f"✅ Validación exitosa: {column} en rango válido")
            return True
    
    def validate_unique_id(self, df: pd.DataFrame, id_column: str) -> bool:
        """
        Validar que los IDs sean únicos
        
        Args:
            df: DataFrame
            id_column: Nombre de la columna de ID
            
        Returns:
            True si pasa la validación
        """
        if id_column not in df.columns:
            self.errors.append(f"Columna {id_column} no existe")
            return False
        
        unique_count = df[id_column].nunique()
        total_count = len(df)
        
        if unique_count != total_count:
            duplicates = total_count - unique_count
            self.errors.append(f"{id_column}: {duplicates} IDs duplicados")
            print(f"❌ Validación fallida: {duplicates} IDs duplicados")
            return False
        else:
            print(f"✅ Validación exitosa: Todos los IDs son únicos")
            return True
    
    def validate_categorical_values(self, df: pd.DataFrame, column: str, 
                                   allowed_values: List[str]) -> bool:
        """
        Validar valores categóricos permitidos
        
        Args:
            df: DataFrame
            column: Nombre de la columna
            allowed_values: Lista de valores permitidos
            
        Returns:
            True si pasa la validación
        """
        if column not in df.columns:
            self.errors.append(f"Columna {column} no existe")
            return False
        
        invalid_values = set(df[column].unique()) - set(allowed_values)
        
        if invalid_values:
            self.errors.append(f"{column}: valores inválidos {invalid_values}")
            print(f"❌ Validación fallida: {column} tiene valores inválidos")
            return False
        else:
            print(f"✅ Validación exitosa: {column} tiene valores válidos")
            return True
    
    def detect_outliers_iqr(self, df: pd.DataFrame, column: str, 
                           threshold: float = 1.5) -> Tuple[bool, int]:
        """
        Detectar outliers usando IQR
        
        Args:
            df: DataFrame
            column: Nombre de la columna
            threshold: Multiplicador de IQR (default 1.5)
            
        Returns:
            (tiene_outliers, cantidad_outliers)
        """
        if column not in df.columns:
            return False, 0
        
        Q1 = df[column].quantile(0.25)
        Q3 = df[column].quantile(0.75)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - threshold * IQR
        upper_bound = Q3 + threshold * IQR
        
        outliers = ((df[column] < lower_bound) | (df[column] > upper_bound)).sum()
        
        if outliers > 0:
            self.warnings.append(f"{column}: {outliers} outliers detectados")
            print(f"⚠️ {column}: {outliers} outliers detectados (IQR)")
            return True, outliers
        else:
            print(f"✅ {column}: Sin outliers significativos")
            return False, 0
    
    def validate_business_rules(self, df: pd.DataFrame) -> bool:
        """
        Validar reglas de negocio específicas para telecomunicaciones
        
        Args:
            df: DataFrame
            
        Returns:
            True si pasa todas las validaciones
        """
        print("\n🔍 Validando reglas de negocio...")
        print("=" * 60)
        
        all_valid = True
        
        # Regla 1: MonthlyCharges debe ser > 0
        if 'MonthlyCharges' in df.columns:
            invalid = (df['MonthlyCharges'] <= 0).sum()
            if invalid > 0:
                self.errors.append(f"MonthlyCharges <= 0: {invalid} registros")
                print(f"❌ {invalid} registros con MonthlyCharges <= 0")
                all_valid = False
        
        # Regla 2: TotalCharges >= MonthlyCharges * tenure (aproximadamente)
        if all(col in df.columns for col in ['TotalCharges', 'MonthlyCharges', 'tenure']):
            expected_min = df['MonthlyCharges'] * df['tenure'] * 0.8  # 80% del esperado
            invalid = (df['TotalCharges'] < expected_min).sum()
            if invalid > 0:
                self.warnings.append(f"TotalCharges inconsistente: {invalid} registros")
                print(f"⚠️ {invalid} registros con TotalCharges inconsistente")
        
        # Regla 3: Tenure debe estar en rango válido (1-72 meses)
        if 'tenure' in df.columns:
            if not self.validate_value_range(df, 'tenure', 1, 72):
                all_valid = False
        
        # Regla 4: Churn debe ser Yes o No
        if 'Churn' in df.columns:
            if not self.validate_categorical_values(df, 'Churn', ['Yes', 'No']):
                all_valid = False
        
        print("=" * 60)
        return all_valid
    
    def run_full_validation(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Ejecutar validación completa
        
        Args:
            df: DataFrame a validar
            
        Returns:
            Diccionario con resultados de validación
        """
        print("\n✅ INICIANDO VALIDACIÓN COMPLETA")
        print("=" * 60)
        
        self.validation_results = []
        self.errors = []
        self.warnings = []
        
        # Validaciones básicas
        results = {
            'total_records': len(df),
            'total_columns': len(df.columns),
            'has_nulls': df.isnull().sum().sum() > 0,
            'null_count': int(df.isnull().sum().sum()),
            'has_duplicates': df.duplicated().sum() > 0,
            'duplicate_count': int(df.duplicated().sum()),
        }
        
        # Validar ID único
        if 'CustomerID' in df.columns:
            results['unique_ids'] = self.validate_unique_id(df, 'CustomerID')
        
        # Validar reglas de negocio
        results['business_rules_valid'] = self.validate_business_rules(df)
        
        # Detectar outliers en columnas numéricas
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        outliers_detected = {}
        for col in numeric_cols:
            has_outliers, count = self.detect_outliers_iqr(df, col)
            if has_outliers:
                outliers_detected[col] = count
        
        results['outliers'] = outliers_detected
        results['errors'] = self.errors
        results['warnings'] = self.warnings
        
        # Resumen final
        print("\n" + "=" * 60)
        print("📊 RESUMEN DE VALIDACIÓN")
        print("=" * 60)
        print(f"Total de registros: {results['total_records']:,}")
        print(f"Total de columnas: {results['total_columns']}")
        print(f"Valores nulos: {results['null_count']}")
        print(f"Duplicados: {results['duplicate_count']}")
        print(f"Errores: {len(self.errors)}")
        print(f"Advertencias: {len(self.warnings)}")
        
        if len(self.errors) == 0:
            print("\n✅ VALIDACIÓN EXITOSA - Datos listos para uso")
        else:
            print("\n❌ VALIDACIÓN FALLIDA - Revisar errores")
        
        print("=" * 60)
        
        return results


if __name__ == "__main__":
    # Ejemplo de uso
    from extractor import DataExtractor
    
    extractor = DataExtractor()
    df = extractor.generate_mock_data(100)
    
    validator = DataValidator()
    results = validator.run_full_validation(df)
    
    if results['errors']:
        print("\n🚨 Errores encontrados:")
        for error in results['errors']:
            print(f"   - {error}")
