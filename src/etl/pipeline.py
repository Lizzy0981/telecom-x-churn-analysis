"""
🔄 ETL Pipeline Module
======================

Pipeline completo de ETL que integra:
- Extracción (DataExtractor)
- Transformación (DataTransformer)
- Carga (DataLoader)
- Validación (DataValidator)

Autor: Elizabeth Díaz Familia
"""

import pandas as pd
from typing import Dict, Any, Optional
from datetime import datetime
import json

from .extractor import DataExtractor
from .transformer import DataTransformer
from .loader import DataLoader
from .validator import DataValidator


class ETLPipeline:
    """
    Pipeline completo de ETL
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Inicializar el pipeline ETL
        
        Args:
            config: Configuración del pipeline
        """
        self.config = config or {}
        self.extractor = DataExtractor(config.get('extractor', {}))
        self.transformer = DataTransformer(config.get('transformer', {}))
        self.loader = DataLoader(config.get('output_dir', 'data/processed'))
        self.validator = DataValidator()
        
        self.execution_log = []
        self.start_time = None
        self.end_time = None
        
    def log_step(self, step: str, status: str, details: str = ""):
        """
        Registrar paso del pipeline
        
        Args:
            step: Nombre del paso
            status: Estado (success/error/warning)
            details: Detalles adicionales
        """
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'step': step,
            'status': status,
            'details': details
        }
        self.execution_log.append(log_entry)
        
        icon = "✅" if status == "success" else "❌" if status == "error" else "⚠️"
        print(f"{icon} {step}: {details}")
    
    def extract_data(self, source_type: str = 'mock', **kwargs) -> pd.DataFrame:
        """
        Paso 1: Extraer datos
        
        Args:
            source_type: Tipo de fuente ('mock', 'csv', 'excel', 'api')
            **kwargs: Argumentos específicos del tipo de fuente
            
        Returns:
            DataFrame con datos extraídos
        """
        print("\n" + "=" * 70)
        print("📥 PASO 1: EXTRACCIÓN DE DATOS")
        print("=" * 70)
        
        try:
            if source_type == 'mock':
                df = self.extractor.generate_mock_data(kwargs.get('n_records', 1000))
            elif source_type == 'csv':
                df = self.extractor.extract_from_csv(kwargs.get('filepath'))
            elif source_type == 'excel':
                df = self.extractor.extract_from_excel(
                    kwargs.get('filepath'),
                    kwargs.get('sheet_name', 0)
                )
            elif source_type == 'api':
                api_data = self.extractor.extract_from_api(
                    kwargs.get('url'),
                    kwargs.get('params'),
                    kwargs.get('headers')
                )
                df = pd.DataFrame(api_data)
            else:
                raise ValueError(f"Tipo de fuente no soportado: {source_type}")
            
            self.log_step("Extracción", "success", f"{len(df):,} registros extraídos")
            return df
            
        except Exception as e:
            self.log_step("Extracción", "error", str(e))
            raise
    
    def transform_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Paso 2: Transformar datos
        
        Args:
            df: DataFrame a transformar
            
        Returns:
            DataFrame transformado
        """
        print("\n" + "=" * 70)
        print("🔧 PASO 2: TRANSFORMACIÓN DE DATOS")
        print("=" * 70)
        
        try:
            df_transformed = self.transformer.apply_all_transformations(df)
            
            self.log_step(
                "Transformación",
                "success",
                f"{len(df_transformed):,} registros, {len(df_transformed.columns)} columnas"
            )
            return df_transformed
            
        except Exception as e:
            self.log_step("Transformación", "error", str(e))
            raise
    
    def validate_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Paso 3: Validar datos
        
        Args:
            df: DataFrame a validar
            
        Returns:
            Resultados de validación
        """
        print("\n" + "=" * 70)
        print("✅ PASO 3: VALIDACIÓN DE DATOS")
        print("=" * 70)
        
        try:
            validation_results = self.validator.run_full_validation(df)
            
            if len(validation_results['errors']) == 0:
                self.log_step("Validación", "success", "Todos los checks pasaron")
            else:
                self.log_step(
                    "Validación",
                    "warning",
                    f"{len(validation_results['errors'])} errores encontrados"
                )
            
            return validation_results
            
        except Exception as e:
            self.log_step("Validación", "error", str(e))
            raise
    
    def load_data(self, df: pd.DataFrame, base_filename: str = 'telecom_churn') -> Dict[str, str]:
        """
        Paso 4: Cargar datos
        
        Args:
            df: DataFrame a cargar
            base_filename: Nombre base de archivos
            
        Returns:
            Diccionario con rutas de archivos guardados
        """
        print("\n" + "=" * 70)
        print("💾 PASO 4: CARGA DE DATOS")
        print("=" * 70)
        
        try:
            paths = self.loader.save_all_formats(df, base_filename)
            
            self.log_step(
                "Carga",
                "success",
                f"{len(paths)} archivos guardados"
            )
            return paths
            
        except Exception as e:
            self.log_step("Carga", "error", str(e))
            raise
    
    def run_full_pipeline(self, source_type: str = 'mock', 
                         base_filename: str = 'telecom_churn_processed',
                         **extract_kwargs) -> Dict[str, Any]:
        """
        Ejecutar pipeline completo
        
        Args:
            source_type: Tipo de fuente de datos
            base_filename: Nombre base para archivos de salida
            **extract_kwargs: Argumentos para la extracción
            
        Returns:
            Diccionario con resultados del pipeline
        """
        self.start_time = datetime.now()
        
        print("\n" + "═" * 70)
        print("🚀 INICIANDO PIPELINE ETL COMPLETO")
        print("═" * 70)
        print(f"⏰ Inicio: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print("═" * 70)
        
        try:
            # Paso 1: Extracción
            df_raw = self.extract_data(source_type, **extract_kwargs)
            
            # Paso 2: Transformación
            df_transformed = self.transform_data(df_raw)
            
            # Paso 3: Validación
            validation_results = self.validate_data(df_transformed)
            
            # Paso 4: Carga
            output_paths = self.load_data(df_transformed, base_filename)
            
            self.end_time = datetime.now()
            duration = (self.end_time - self.start_time).total_seconds()
            
            # Resumen final
            results = {
                'success': True,
                'start_time': self.start_time.isoformat(),
                'end_time': self.end_time.isoformat(),
                'duration_seconds': duration,
                'records_extracted': len(df_raw),
                'records_loaded': len(df_transformed),
                'columns_original': len(df_raw.columns),
                'columns_final': len(df_transformed.columns),
                'validation_results': validation_results,
                'output_files': output_paths,
                'execution_log': self.execution_log
            }
            
            # Guardar log de ejecución
            log_path = self.loader.output_dir / f'{base_filename}_pipeline_log.json'
            with open(log_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=4, ensure_ascii=False)
            
            print("\n" + "═" * 70)
            print("🎉 PIPELINE COMPLETADO EXITOSAMENTE")
            print("═" * 70)
            print(f"⏱️ Duración: {duration:.2f} segundos")
            print(f"📊 Registros procesados: {len(df_raw):,} → {len(df_transformed):,}")
            print(f"📋 Columnas: {len(df_raw.columns)} → {len(df_transformed.columns)}")
            print(f"💾 Archivos generados: {len(output_paths)}")
            print("═" * 70)
            
            return results
            
        except Exception as e:
            self.end_time = datetime.now()
            duration = (self.end_time - self.start_time).total_seconds()
            
            error_results = {
                'success': False,
                'error': str(e),
                'start_time': self.start_time.isoformat(),
                'end_time': self.end_time.isoformat(),
                'duration_seconds': duration,
                'execution_log': self.execution_log
            }
            
            print("\n" + "═" * 70)
            print("❌ PIPELINE FALLIDO")
            print("═" * 70)
            print(f"🚨 Error: {str(e)}")
            print(f"⏱️ Duración: {duration:.2f} segundos")
            print("═" * 70)
            
            return error_results
    
    def get_execution_summary(self) -> Dict[str, Any]:
        """
        Obtener resumen de la ejecución
        
        Returns:
            Diccionario con resumen
        """
        if not self.execution_log:
            return {"message": "Pipeline no ejecutado"}
        
        summary = {
            'total_steps': len(self.execution_log),
            'successful_steps': sum(1 for log in self.execution_log if log['status'] == 'success'),
            'failed_steps': sum(1 for log in self.execution_log if log['status'] == 'error'),
            'warnings': sum(1 for log in self.execution_log if log['status'] == 'warning'),
            'execution_log': self.execution_log
        }
        
        if self.start_time and self.end_time:
            summary['duration_seconds'] = (self.end_time - self.start_time).total_seconds()
        
        return summary


if __name__ == "__main__":
    # Ejemplo de uso
    print("🔄 ETL Pipeline - Ejemplo de Uso")
    print("=" * 70)
    
    # Configuración del pipeline
    config = {
        'output_dir': 'data/processed',
        'extractor': {},
        'transformer': {}
    }
    
    # Crear pipeline
    pipeline = ETLPipeline(config)
    
    # Ejecutar pipeline completo con datos mock
    results = pipeline.run_full_pipeline(
        source_type='mock',
        n_records=500,
        base_filename='telecom_churn_demo'
    )
    
    # Mostrar resumen
    if results['success']:
        print("\n✅ Pipeline ejecutado exitosamente")
        print(f"📁 Archivos generados:")
        for file_type, path in results['output_files'].items():
            print(f"   - {file_type}: {path}")
    else:
        print(f"\n❌ Pipeline falló: {results.get('error')}")
