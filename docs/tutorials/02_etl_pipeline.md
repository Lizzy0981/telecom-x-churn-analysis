# 🔄 Tutorial 2: ETL Pipeline Deep Dive

Learn how to extract, transform, and load data in Telecom X.

---

## 📋 What You'll Learn

- Understanding ETL components
- Customizing data transformation
- Working with different data formats
- Error handling and validation

**Time:** ~30 minutes  
**Level:** Intermediate  
**Prerequisites:** Tutorial 1 completed

---

## 🧩 ETL Components

### 1. Extractor

**Purpose:** Load data from various sources

```python
from src.etl.extractor import Extractor

extractor = Extractor()

# Extract from CSV
df_csv = extractor.extract_csv('data/raw/customers.csv')

# Extract from Excel
df_excel = extractor.extract_excel('data/raw/customers.xlsx')

# Extract from JSON
df_json = extractor.extract_json('data/raw/customers.json')
```

**Supported Formats:**
- CSV (comma, semicolon, tab-delimited)
- Excel (.xlsx, .xls)
- JSON (records, columns format)

---

### 2. Transformer

**Purpose:** Clean and enrich data

```python
from src.etl.transformer import Transformer

transformer = Transformer()

# Clean data
clean_df = transformer.clean_data(raw_df)

# Create features
enriched_df = transformer.create_features(clean_df)

# Segment customers
segmented_df = transformer.segment_customers(enriched_df)
```

**Transformations:**
- Missing value handling
- Data type conversion
- Feature engineering
- Customer segmentation
- Risk score calculation

---

### 3. Loader

**Purpose:** Save processed data

```python
from src.etl.loader import Loader

loader = Loader()

# Save to CSV
loader.save_csv(df, 'output.csv')

# Save to Excel
loader.save_excel(df, 'output.xlsx')

# Save to JSON
loader.save_json(df, 'output.json')
```

---

## 🛠️ Custom ETL Pipeline

### Basic Pipeline

```python
from src.etl.extractor import Extractor
from src.etl.transformer import Transformer
from src.etl.loader import Loader

# 1. Extract
extractor = Extractor()
raw_data = extractor.extract_csv('data/raw/input.csv')

# 2. Transform
transformer = Transformer()
transformed_data = transformer.transform(raw_data)

# 3. Load
loader = Loader()
loader.save_csv(transformed_data, 'data/processed/output.csv')
```

### Advanced Pipeline with Validation

```python
from src.utils.validator import Validator
import logging

logger = logging.getLogger(__name__)

# Extract
raw_data = extractor.extract_csv('input.csv')
logger.info(f"Extracted {len(raw_data)} records")

# Validate
validator = Validator()
validation_result = validator.validate(raw_data)

if not validation_result['is_valid']:
    logger.warning(f"Validation issues: {validation_result['errors']}")
    # Handle errors
    
# Transform
clean_data = transformer.clean_data(raw_data)
enriched_data = transformer.create_features(clean_data)

# Load
loader.save_csv(enriched_data, 'output.csv')
logger.info("Pipeline completed successfully")
```

---

## 📊 Data Transformation Examples

### Example 1: Feature Engineering

```python
import pandas as pd

# Create tenure groups
df['TenureGroup'] = pd.cut(
    df['tenure'],
    bins=[0, 12, 24, 48, 100],
    labels=['0-12', '12-24', '24-48', '48+']
)

# Calculate average charge per month
df['AvgChargePerMonth'] = df['TotalCharges'] / df['tenure']

# Create contract commitment score
contract_scores = {
    'Month-to-month': 1,
    'One Year': 2,
    'Two Year': 3
}
df['ContractScore'] = df['Contract'].map(contract_scores)
```

### Example 2: Customer Segmentation

```python
def segment_customer(row):
    """Assign customer to segment based on behavior."""
    if row['MonthlyCharges'] < 40:
        return 'Entry'
    elif row['MonthlyCharges'] < 70:
        return 'Standard'
    elif row['MonthlyCharges'] < 90:
        return 'Premium'
    else:
        return 'Power User'

df['Segment'] = df.apply(segment_customer, axis=1)
```

### Example 3: Risk Score Calculation

```python
def calculate_risk_score(row):
    """Calculate churn risk score (0-100)."""
    score = 0
    
    # Tenure factor (lower tenure = higher risk)
    if row['tenure'] < 12:
        score += 30
    elif row['tenure'] < 24:
        score += 15
        
    # Contract factor
    if row['Contract'] == 'Month-to-month':
        score += 25
        
    # Payment method factor
    if row['PaymentMethod'] == 'Electronic check':
        score += 20
        
    # Charges factor
    if row['MonthlyCharges'] > 80:
        score += 15
        
    return min(score, 100)

df['RiskScore'] = df.apply(calculate_risk_score, axis=1)
```

---

## 🔧 Configuration

Create `config/etl_config.json`:

```json
{
  "extraction": {
    "chunk_size": 10000,
    "encoding": "utf-8",
    "skip_rows": 0
  },
  "transformation": {
    "handle_missing": "drop",
    "outlier_method": "iqr",
    "segmentation_bins": 4
  },
  "loading": {
    "compression": "gzip",
    "decimal_places": 2
  }
}
```

Load in code:

```python
import json

with open('config/etl_config.json') as f:
    config = json.load(f)

# Use in pipeline
chunk_size = config['extraction']['chunk_size']
```

---

## ⚠️ Error Handling

```python
try:
    raw_data = extractor.extract_csv('input.csv')
except FileNotFoundError:
    logger.error("Input file not found")
    sys.exit(1)
except pd.errors.EmptyDataError:
    logger.error("Input file is empty")
    sys.exit(1)
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    sys.exit(1)
```

---

## 🎯 Exercises

### Exercise 1: Custom Feature

Add a new feature "ServiceCount":

```python
service_columns = [
    'PhoneService', 'MultipleLines', 'InternetService',
    'OnlineSecurity', 'OnlineBackup', 'DeviceProtection',
    'TechSupport', 'StreamingTV', 'StreamingMovies'
]

df['ServiceCount'] = (df[service_columns] != 'No').sum(axis=1)
```

### Exercise 2: Data Quality Check

```python
def check_data_quality(df):
    """Check data quality metrics."""
    quality_report = {
        'total_rows': len(df),
        'missing_values': df.isnull().sum().to_dict(),
        'duplicates': df.duplicated().sum(),
        'unique_customers': df['customerID'].nunique()
    }
    return quality_report

report = check_data_quality(df)
print(json.dumps(report, indent=2))
```

---

## 📚 Next Steps

- [Tutorial 3: Visualization](03_visualization.md)
- [Tutorial 4: Report Generation](04_report_generation.md)

---

**Developed with 💜 by Elizabeth Díaz Familia**
