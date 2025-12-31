# 📘 Usage Guide - Telecom X

Comprehensive guide for using Telecom X Customer Churn Analysis platform.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [ETL Pipeline](#etl-pipeline)
- [Data Analysis](#data-analysis)
- [Visualizations](#visualizations)
- [Report Generation](#report-generation)
- [Web Interface](#web-interface)
- [API Usage](#api-usage)
- [Best Practices](#best-practices)

---

## 🌟 Overview

Telecom X is a comprehensive customer churn analysis platform that provides:

- **ETL Pipeline** - Extract, Transform, Load customer data
- **Churn Prediction** - ML-powered churn probability
- **Interactive Dashboards** - Real-time analytics
- **Automated Reports** - PDF and Excel generation
- **REST API** - Programmatic access

---

## ⚡ Quick Start

### 1. Activate Environment

```bash
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
```

### 2. Run ETL Pipeline

```bash
python scripts/run_etl.py
```

### 3. Generate Reports

```bash
python scripts/generate_reports.py
```

### 4. View Web Interface

```bash
cd web/
python -m http.server 8000
# Visit: http://localhost:8000
```

---

## 📊 ETL Pipeline

### Basic Usage

```bash
# Run complete pipeline
python scripts/run_etl.py

# Custom input/output
python scripts/run_etl.py --input custom_data.csv --output results/

# Skip validation
python scripts/run_etl.py --no-validate
```

### Programmatic Usage

```python
from src.etl.extractor import Extractor
from src.etl.transformer import Transformer
from src.etl.loader import Loader

# Extract
extractor = Extractor()
data = extractor.extract_csv('data/raw/telecom_churn_raw.csv')

# Transform
transformer = Transformer()
clean_data = transformer.clean_data(data)
enriched_data = transformer.create_features(clean_data)

# Load
loader = Loader()
loader.save_csv(enriched_data, 'data/processed/output.csv')
```

### ETL Configuration

Edit `config/settings.json`:

```json
{
  "etl": {
    "chunk_size": 10000,
    "validate": true,
    "encoding": "utf-8"
  }
}
```

---

## 📈 Data Analysis

### Churn Analysis

```python
from src.analysis.churn_analysis import ChurnAnalysis

analyzer = ChurnAnalysis(data)

# Calculate metrics
metrics = analyzer.calculate_metrics()
print(f"Churn Rate: {metrics['churn_rate']:.2f}%")

# Segment analysis
segments = analyzer.analyze_by_segment()
print(segments)
```

### Statistical Analysis

```python
from src.analysis.statistics import Statistics

stats = Statistics(data)

# Descriptive statistics
summary = stats.describe()
print(summary)

# Correlation analysis
correlations = stats.correlations(['tenure', 'MonthlyCharges', 'TotalCharges'])
print(correlations)
```

### ML Predictions

```python
from src.ml.feature_engineering import FeatureEngineering
from sklearn.ensemble import RandomForestClassifier

# Prepare features
fe = FeatureEngineering()
X, y = fe.prepare_ml_dataset(data)

# Train model
model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)

# Predict
predictions = model.predict(X_test)
```

---

## 📊 Visualizations

### Interactive Charts (Plotly)

```python
from src.visualization.plotly_charts import PlotlyCharts

viz = PlotlyCharts(data)

# Pie chart
fig_pie = viz.create_pie_chart('Churn', 'Churn Distribution')
fig_pie.write_html('visualizations/interactive/churn_pie.html')

# Bar chart
fig_bar = viz.create_bar_chart('Contract', 'MonthlyCharges', 'Charges by Contract')
fig_bar.write_html('visualizations/interactive/contract_bar.html')

# Line chart
fig_line = viz.create_line_chart('tenure', 'TotalCharges', 'Revenue by Tenure')
fig_line.write_html('visualizations/interactive/revenue_line.html')
```

### Static Charts (Matplotlib)

```python
from src.visualization.matplotlib_charts import MatplotlibCharts

mat_viz = MatplotlibCharts(data)

# Histogram
mat_viz.create_histogram(
    'tenure',
    bins=20,
    output='visualizations/static/tenure_hist.png'
)

# Heatmap
mat_viz.create_heatmap(
    columns=['tenure', 'MonthlyCharges', 'TotalCharges'],
    output='visualizations/static/correlation.png'
)
```

### Dashboard Creation

```python
# Create complete dashboard
dashboard = viz.create_dashboard(
    charts=[
        {'type': 'pie', 'data': 'Churn'},
        {'type': 'bar', 'x': 'Contract', 'y': 'MonthlyCharges'},
        {'type': 'scatter', 'x': 'tenure', 'y': 'TotalCharges'},
    ],
    title='Telecom X Dashboard',
    layout='grid'
)

with open('visualizations/interactive/dashboard.html', 'w') as f:
    f.write(dashboard)
```

---

## 📄 Report Generation

### Generate Executive Report

```bash
python scripts/generate_reports.py --type executive
```

```python
from src.reports.report_generator import ReportGenerator

generator = ReportGenerator(data)

generator.generate_executive_report(
    output_path='reports/pdf/executive_2025.pdf',
    title='Executive Churn Analysis Report',
    author='Elizabeth Díaz Familia'
)
```

### Generate Technical Report

```bash
python scripts/generate_reports.py --type technical
```

```python
generator.generate_technical_report(
    output_path='reports/pdf/technical_2025.pdf',
    include_ml_metrics=True,
    include_code_snippets=True
)
```

### Generate Excel Dashboard

```bash
python scripts/generate_reports.py --type excel
```

```python
generator.generate_excel_dashboard(
    output_path='reports/excel/dashboard_2025.xlsx',
    include_charts=True,
    include_pivot_tables=True
)
```

---

## 🌐 Web Interface

### Start Web Server

```bash
cd web/
python -m http.server 8000
```

Visit: `http://localhost:8000`

### Features

- **Dashboard** - KPIs and charts
- **Customer Search** - Find customers by ID
- **Reports Center** - Generate and download reports
- **Analytics** - Interactive visualizations
- **Multi-language** - 7 languages supported

### Deploy to GitHub Pages

```bash
./scripts/deploy_ghpages.sh
```

Your site will be available at:
`https://YOUR_USERNAME.github.io/YOUR_REPO/`

---

## 🔌 API Usage

### Python Client

```python
from src.api.api_manager import APIManager

api = APIManager(base_url="http://localhost:8000/api/v1")

# Get customers
customers = api.get_customers(limit=10)

# Get specific customer
customer = api.get_customer("CUST-001")

# Get KPIs
kpis = api.get_kpis()

# Predict churn
prediction = api.predict_churn({
    'customerID': 'CUST-999',
    'tenure': 12,
    'monthlyCharges': 65.50
})
```

### cURL

```bash
# Get customers
curl http://localhost:8000/api/v1/customers

# Predict churn
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{"customerID":"CUST-999","tenure":12,"monthlyCharges":65.50}'
```

---

## 💡 Best Practices

### Data Management

1. **Always validate data before processing**
   ```python
   validator = Validator()
   is_valid = validator.validate(data)
   ```

2. **Use virtual environments**
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

3. **Keep data organized**
   ```
   data/
   ├── raw/          # Original data
   ├── processed/    # Cleaned data
   └── external/     # External sources
   ```

### Performance Optimization

1. **Process data in chunks for large datasets**
   ```python
   for chunk in pd.read_csv('large_file.csv', chunksize=10000):
       process(chunk)
   ```

2. **Use caching for repeated operations**
   ```python
   @cache
   def expensive_operation(data):
       ...
   ```

3. **Profile your code**
   ```bash
   python -m cProfile -o profile.stats script.py
   ```

### Error Handling

1. **Always use try-except blocks**
   ```python
   try:
       result = risky_operation()
   except Exception as e:
       logger.error(f"Error: {e}")
   ```

2. **Log important events**
   ```python
   import logging
   logging.info("Processing started")
   ```

3. **Validate inputs**
   ```python
   assert tenure >= 0, "Tenure must be non-negative"
   ```

### Code Quality

1. **Follow PEP 8 style guide**
   ```bash
   black src/
   flake8 src/
   ```

2. **Write tests**
   ```bash
   pytest tests/ -v --cov=src
   ```

3. **Document your code**
   ```python
   def process_customer(customer_id: str) -> dict:
       """
       Process customer data.
       
       Args:
           customer_id: Unique customer identifier
           
       Returns:
           Processed customer data dictionary
       """
   ```

### Security

1. **Never commit API keys**
   - Use `.env` files
   - Add to `.gitignore`

2. **Sanitize inputs**
   ```python
   from src.utils.validators import sanitize_input
   clean_data = sanitize_input(user_data)
   ```

3. **Use HTTPS in production**

---

## 🔗 Related Documentation

- [Installation Guide](INSTALLATION.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Architecture Guide](ARCHITECTURE.md)
- [Tutorials](tutorials/)

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/Lizzy0981/telecom-x-churn/issues)
- **Email:** lizzyfamilia@gmail.com

---

**Developed with 💜 by Elizabeth Díaz Familia**
