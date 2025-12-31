"""
📦 Telecom X - Customer Churn Analysis
=======================================

Sistema completo de análisis de churn para empresas de telecomunicaciones.

Este paquete contiene todos los módulos necesarios para:
- Extracción, transformación y carga de datos (ETL)
- Integración con APIs externas
- Análisis exploratorio y estadístico
- Visualizaciones interactivas
- Generación de reportes (CSV, Excel, PDF)
- Machine Learning (clustering, forecasting, anomalías)
- Soporte multiidioma (7 idiomas)

Módulos principales:
    - etl: Pipeline completo ETL
    - api: Integración con APIs públicas
    - analysis: Análisis de datos y churn
    - visualization: Gráficos Plotly, Matplotlib, Excel
    - reports: Exportación de reportes
    - ml: Machine Learning preview
    - i18n: Sistema de internacionalización
    - utils: Utilidades y helpers

Autor: Elizabeth Díaz Familia
Fecha: 2025
Versión: 1.0.0

Repositorio: https://github.com/Lizzy0981/telecom-x-churn-analysis
LinkedIn: https://linkedin.com/in/eli-familia/
Twitter: @Lizzyfamilia

---

Ejemplo de uso:

    from src.etl.pipeline import ETLPipeline
    from src.api.api_manager import APIManager
    from src.analysis.churn_analysis import ChurnAnalysis
    from src.visualization.plotly_charts import PlotlyCharts
    from src.reports.report_generator import ReportGenerator
    
    # Ejecutar pipeline ETL completo
    pipeline = ETLPipeline()
    results = pipeline.run_full_pipeline(
        source_type='mock',
        n_records=1000,
        base_filename='telecom_churn'
    )
    
    # Análisis de churn
    analyzer = ChurnAnalysis()
    churn_rate = analyzer.calculate_churn_rate(df)
    
    # Visualizaciones
    charts = PlotlyCharts()
    fig = charts.create_pie_chart(df, 'Churn', 'Customer Churn Distribution')
    
    # Generar reportes
    generator = ReportGenerator()
    paths = generator.generate_all(df, 'churn_report')

---

Tecnologías utilizadas:
    - Python 3.8+
    - Pandas, NumPy
    - Plotly, Matplotlib, Seaborn
    - Scikit-learn, SciPy
    - OpenPyXL, ReportLab
    - Requests

Licencia: MIT
Copyright (c) 2025 Elizabeth Díaz Familia
"""

__version__ = '1.0.0'
__author__ = 'Elizabeth Díaz Familia'
__email__ = 'lizzyfamilia@gmail.com'
__license__ = 'MIT'

# Importar componentes principales para acceso directo
from .etl.pipeline import ETLPipeline
from .api.api_manager import APIManager
from .analysis.churn_analysis import ChurnAnalysis
from .visualization.plotly_charts import PlotlyCharts
from .reports.report_generator import ReportGenerator

# Configurar namespace público
__all__ = [
    'ETLPipeline',
    'APIManager',
    'ChurnAnalysis',
    'PlotlyCharts',
    'ReportGenerator',
    '__version__',
    '__author__',
]

# Información del proyecto
PROJECT_INFO = {
    'name': 'Telecom X - Customer Churn Analysis',
    'version': __version__,
    'author': __author__,
    'description': 'Sistema completo de análisis de churn para telecomunicaciones',
    'github': 'https://github.com/Lizzy0981/telecom-x-churn-analysis',
    'linkedin': 'https://linkedin.com/in/eli-familia/',
    'twitter': '@Lizzyfamilia',
    'supported_languages': ['es', 'en', 'pt', 'fr', 'ar', 'he', 'zh'],
    'supported_formats': ['CSV', 'Excel', 'PDF'],
    'apis_integrated': [
        'ExchangeRate-API',
        'World Bank API',
        'OpenWeatherMap',
        'NewsAPI',
        'OpenStreetMap Nominatim'
    ]
}


def get_project_info():
    """
    Obtener información del proyecto
    
    Returns:
        dict: Información completa del proyecto
    """
    return PROJECT_INFO


def print_welcome_message():
    """Imprimir mensaje de bienvenida"""
    print("=" * 70)
    print("📊 TELECOM X - CUSTOMER CHURN ANALYSIS")
    print("=" * 70)
    print(f"Versión: {__version__}")
    print(f"Autor: {__author__}")
    print("\n🌍 Idiomas soportados: 🇪🇸 🇺🇸 🇧🇷 🇫🇷 🇸🇦 🇮🇱 🇨🇳")
    print("📊 Formatos: CSV, Excel, PDF")
    print("🌐 APIs integradas: 5+ servicios públicos")
    print("\n🔗 GitHub: https://github.com/Lizzy0981")
    print("🔗 LinkedIn: https://linkedin.com/in/eli-familia/")
    print("=" * 70)


# Mostrar mensaje al importar
if __name__ != "__main__":
    # Solo mostrar en modo interactivo
    import sys
    if hasattr(sys, 'ps1'):
        print_welcome_message()
