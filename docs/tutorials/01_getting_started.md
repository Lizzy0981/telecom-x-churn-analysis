# 🚀 Tutorial 1: Getting Started with Telecom X

Welcome to Telecom X! This tutorial will guide you through your first steps.

---

## 📋 What You'll Learn

- Setting up the development environment
- Running your first ETL pipeline
- Viewing results in the web interface
- Understanding project structure

**Time:** ~15 minutes  
**Level:** Beginner

---

## ✅ Prerequisites

- Python 3.8+ installed
- Git installed
- Basic command line knowledge
- Text editor or IDE

---

## Step 1: Installation

### Clone Repository

```bash
git clone https://github.com/Lizzy0981/telecom-x-churn.git
cd telecom-x-churn
```

### Run Setup Script

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

The setup script will:
- ✅ Create virtual environment
- ✅ Install dependencies
- ✅ Create necessary directories
- ✅ Run initial tests

### Activate Virtual Environment

```bash
# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

---

## Step 2: Verify Installation

```bash
# Check Python version
python --version  # Should be 3.8+

# Check installed packages
pip list | grep pandas
pip list | grep plotly

# Run tests
pytest tests/ -v
```

All tests should pass ✅

---

## Step 3: Run ETL Pipeline

```bash
python scripts/run_etl.py
```

**What happens:**
1. Extracts data from `data/raw/telecom_churn_raw.csv`
2. Cleans and transforms data
3. Creates customer segments
4. Saves to `data/processed/`

**Output:**
```
TELECOM X - ETL PIPELINE STARTED
Step 1/4: Extracting data...
✓ Extracted 500 records
Step 2/4: Validating data...
✓ Data validation passed
Step 3/4: Transforming data...
✓ Transformed 500 records
Step 4/4: Loading data...
✓ Saved CSV: data/processed/dataset_final.csv
✓ Saved Excel: data/processed/dataset_final.xlsx
✓ Saved JSON: data/processed/dataset_final.json
ETL PIPELINE COMPLETED SUCCESSFULLY
Duration: 3.45 seconds
```

---

## Step 4: View Results

### Option A: CSV File

```bash
# View first few lines
head data/processed/dataset_final.csv

# Or open in Excel/LibreOffice
```

### Option B: Web Interface

```bash
cd web/
python -m http.server 8000
```

Visit: `http://localhost:8000`

You'll see:
- 📊 Interactive dashboard
- 📈 Charts and visualizations
- 🔍 Customer search
- 📄 Report generation

---

## Step 5: Explore Project Structure

```
telecom-x-churn/
├── data/             # Data files
│   ├── raw/          # Original data
│   └── processed/    # Cleaned data
├── src/              # Source code
│   ├── etl/          # ETL pipeline
│   ├── analysis/     # Analytics
│   └── reports/      # Reports
├── web/              # Web interface
├── scripts/          # Automation scripts
├── tests/            # Unit tests
└── docs/             # Documentation
```

---

## Step 6: Generate Your First Report

```bash
python scripts/generate_reports.py --type executive
```

**Output:**
```
TELECOM X - REPORT GENERATION
Loading data from: data/processed/dataset_final.csv
✓ Loaded 500 records
Generating Executive Report (PDF)...
✓ Executive PDF: reports/pdf/executive_report_20250115.pdf
REPORT GENERATION COMPLETED
```

Open the PDF in `reports/pdf/` to see your first report!

---

## 🎯 Quick Exercises

### Exercise 1: Modify Data

1. Edit `data/raw/telecom_churn_raw.csv`
2. Add a new customer row
3. Run ETL pipeline again
4. Verify new customer appears in output

### Exercise 2: Change Language

1. Open `http://localhost:8000`
2. Click language selector
3. Try different languages (ES, EN, PT, FR, AR, HE, ZH)

### Exercise 3: Explore Charts

1. In web interface, click different charts
2. Hover over data points
3. Try zooming and panning

---

## 🔍 Troubleshooting

### "python: command not found"

**Solution:** Use `python3` instead:
```bash
python3 scripts/run_etl.py
```

### "Permission denied" on scripts

**Solution:** Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### Port 8000 already in use

**Solution:** Use different port:
```bash
python -m http.server 8001
```

---

## ✅ What You've Learned

- ✅ Installed Telecom X
- ✅ Ran ETL pipeline
- ✅ Viewed results in web interface
- ✅ Generated a report
- ✅ Understood project structure

---

## 🚀 Next Steps

Continue to:
- [Tutorial 2: ETL Pipeline](02_etl_pipeline.md) - Deep dive into ETL
- [Tutorial 3: Visualization](03_visualization.md) - Create custom charts
- [Tutorial 4: Report Generation](04_report_generation.md) - Advanced reports

---

**Developed with 💜 by Elizabeth Díaz Familia**
