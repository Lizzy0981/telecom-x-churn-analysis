# 📄 Tutorial 4: Report Generation

Learn to generate professional PDF and Excel reports.

---

## 📋 What You'll Learn

- Generating executive reports
- Creating technical reports
- Building Excel dashboards
- Customizing report templates

**Time:** ~25 minutes  
**Level:** Intermediate  
**Prerequisites:** Tutorials 1-3 completed

---

## 📊 Report Generator Basics

### Setup

```python
from src.reports.report_generator import ReportGenerator
import pandas as pd
from datetime import datetime

# Load data
df = pd.read_csv('data/processed/dataset_final.csv')

# Initialize generator
generator = ReportGenerator(df)
```

---

## 📄 Executive PDF Report

### Basic Executive Report

```python
# Generate executive report
generator.generate_executive_report(
    output_path='reports/pdf/executive_2025.pdf',
    title='Executive Churn Analysis Report',
    author='Elizabeth Díaz Familia',
    date=datetime.now().strftime('%Y-%m-%d')
)
```

**What's Included:**
- Executive summary
- Key performance indicators
- High-level visualizations
- Strategic recommendations

### Customized Executive Report

```python
generator.generate_executive_report(
    output_path='reports/pdf/executive_custom.pdf',
    title='Q4 2024 Churn Analysis',
    author='Data Analytics Team',
    include_kpis=True,
    include_charts=True,
    include_recommendations=True,
    logo_path='assets/images/logo.png',
    color_scheme='corporate'
)
```

---

## 🔬 Technical PDF Report

### Basic Technical Report

```python
generator.generate_technical_report(
    output_path='reports/pdf/technical_2025.pdf',
    include_statistics=True,
    include_ml_metrics=True,
    include_code_snippets=True
)
```

**What's Included:**
- Detailed statistical analysis
- ML model metrics (accuracy, precision, recall)
- Feature importance
- Correlation matrices
- Technical methodology

### Advanced Technical Report

```python
generator.generate_technical_report(
    output_path='reports/pdf/technical_detailed.pdf',
    include_statistics=True,
    include_ml_metrics=True,
    include_code_snippets=True,
    include_data_dictionary=True,
    include_assumptions=True,
    code_language='python',
    syntax_highlighting=True
)
```

---

## 📊 Excel Dashboard

### Basic Excel Dashboard

```python
generator.generate_excel_dashboard(
    output_path='reports/excel/dashboard_2025.xlsx'
)
```

**Sheets Created:**
- Summary - KPIs and overview
- Data - Full dataset
- Charts - Embedded visualizations
- Pivot Tables - Interactive analysis

### Advanced Excel Dashboard

```python
generator.generate_excel_dashboard(
    output_path='reports/excel/dashboard_advanced.xlsx',
    include_summary=True,
    include_charts=True,
    include_pivot_tables=True,
    include_raw_data=True,
    include_formulas=True,
    chart_types=['pie', 'bar', 'line', 'scatter'],
    freeze_panes=True,
    conditional_formatting=True
)
```

---

## 🎨 Custom Reports

### Create Custom Report Template

```python
custom_sections = [
    {
        'type': 'cover',
        'title': 'Custom Churn Analysis',
        'subtitle': 'Q4 2024 Report',
        'author': 'Analytics Team'
    },
    {
        'type': 'toc',
        'title': 'Table of Contents'
    },
    {
        'type': 'summary',
        'title': 'Executive Summary',
        'content': 'Brief overview of findings...'
    },
    {
        'type': 'kpis',
        'title': 'Key Performance Indicators',
        'metrics': ['churn_rate', 'retention_rate', 'avg_revenue']
    },
    {
        'type': 'charts',
        'title': 'Visual Analysis',
        'charts': [
            {'type': 'pie', 'data': 'churn_distribution'},
            {'type': 'bar', 'data': 'charges_by_contract'}
        ]
    },
    {
        'type': 'recommendations',
        'title': 'Strategic Recommendations'
    }
]

generator.generate_custom_report(
    output_path='reports/pdf/custom_report.pdf',
    sections=custom_sections,
    template='modern'
)
```

---

## 📈 Report Automation

### Scheduled Reports

```python
from datetime import datetime
import schedule

def generate_weekly_report():
    """Generate weekly executive report."""
    timestamp = datetime.now().strftime("%Y%m%d")
    filename = f'reports/pdf/weekly_report_{timestamp}.pdf'
    
    generator.generate_executive_report(
        output_path=filename,
        title=f'Weekly Report - {timestamp}'
    )
    
    print(f"Report generated: {filename}")

# Schedule weekly reports
schedule.every().monday.at("09:00").do(generate_weekly_report)
```

### Batch Report Generation

```python
def generate_all_reports():
    """Generate all report types."""
    timestamp = datetime.now().strftime("%Y%m%d")
    
    # Executive PDF
    generator.generate_executive_report(
        output_path=f'reports/pdf/executive_{timestamp}.pdf'
    )
    
    # Technical PDF
    generator.generate_technical_report(
        output_path=f'reports/pdf/technical_{timestamp}.pdf'
    )
    
    # Excel Dashboard
    generator.generate_excel_dashboard(
        output_path=f'reports/excel/dashboard_{timestamp}.xlsx'
    )
    
    print("All reports generated successfully!")

generate_all_reports()
```

---

## 🎯 Report Configuration

### Create Report Config

```json
{
  "report_settings": {
    "page_size": "letter",
    "orientation": "portrait",
    "margin": {
      "top": 1.0,
      "bottom": 1.0,
      "left": 1.0,
      "right": 1.0
    },
    "font": {
      "family": "Arial",
      "size": 11
    },
    "colors": {
      "primary": "#667eea",
      "secondary": "#f093fb",
      "text": "#333333"
    }
  },
  "branding": {
    "logo": "assets/images/logo.png",
    "company_name": "Telecom X",
    "tagline": "Customer Intelligence Platform"
  },
  "sections": {
    "cover_page": true,
    "table_of_contents": true,
    "executive_summary": true,
    "appendix": true
  }
}
```

Load in code:

```python
import json

with open('config/report_config.json') as f:
    config = json.load(f)

generator.generate_report(config=config)
```

---

## 💡 Best Practices

### 1. Clear Titles

```python
# Good
title = "Q4 2024 Customer Churn Analysis Report"

# Bad
title = "Report"
```

### 2. Include Metadata

```python
metadata = {
    'title': 'Churn Analysis Report',
    'author': 'Elizabeth Díaz Familia',
    'department': 'Data Analytics',
    'date': '2025-01-15',
    'version': '1.0',
    'confidentiality': 'Internal Use Only'
}

generator.add_metadata(metadata)
```

### 3. Consistent Branding

```python
# Use company colors throughout
BRAND_COLORS = {
    'primary': '#667eea',
    'secondary': '#f093fb',
    'success': '#51CF66',
    'error': '#FF6B6B'
}

generator.set_colors(BRAND_COLORS)
```

---

## 🎯 Exercises

### Exercise 1: Monthly Report

Create an automated monthly report that includes:
- Summary of month's data
- Trend comparisons
- Month-over-month changes

### Exercise 2: Multi-Language Report

Generate the same report in multiple languages.

### Exercise 3: Interactive PDF

Create a PDF with clickable table of contents and cross-references.

---

## ✅ Completion

Congratulations! You've completed all Telecom X tutorials.

**You've learned:**
- ✅ Getting started with Telecom X
- ✅ ETL pipeline deep dive
- ✅ Creating visualizations
- ✅ Generating professional reports

---

## 📚 Further Reading

- [Installation Guide](../INSTALLATION.md)
- [Usage Guide](../USAGE_GUIDE.md)
- [API Documentation](../API_DOCUMENTATION.md)
- [Architecture Guide](../ARCHITECTURE.md)

---

**Developed with 💜 by Elizabeth Díaz Familia**
