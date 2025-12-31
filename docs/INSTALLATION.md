# 📦 Installation Guide - Telecom X

Complete installation guide for Telecom X Customer Churn Analysis platform.

---

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Quick Start](#quick-start)
- [Detailed Installation](#detailed-installation)
- [Platform-Specific Instructions](#platform-specific-instructions)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

---

## 🖥️ System Requirements

### Minimum Requirements

- **Operating System:** Windows 10+, macOS 10.14+, or Linux (Ubuntu 20.04+)
- **Python:** 3.8 or higher
- **RAM:** 4 GB minimum, 8 GB recommended
- **Disk Space:** 2 GB free space
- **Internet:** Required for package installation

### Recommended Requirements

- **Python:** 3.10 or 3.11
- **RAM:** 16 GB
- **Processor:** Multi-core CPU
- **Disk Space:** 5 GB free space

### Required Software

- Git (for cloning repository)
- Python 3.8+ with pip
- Virtual environment tools (venv or virtualenv)

---

## ⚡ Quick Start

For experienced users, here's the fastest way to get started:

```bash
# 1. Clone repository
git clone https://github.com/Lizzy0981/telecom-x-churn.git
cd telecom-x-churn

# 2. Run automated setup
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. Activate virtual environment
source venv/bin/activate  # On Linux/macOS
# OR
venv\Scripts\activate  # On Windows

# 4. You're ready!
python scripts/run_etl.py
```

---

## 📖 Detailed Installation

### Step 1: Install Python

#### Windows

1. Download Python from [python.org](https://www.python.org/downloads/)
2. Run installer
3. **Important:** Check "Add Python to PATH"
4. Complete installation

Verify:
```cmd
python --version
pip --version
```

#### macOS

Using Homebrew:
```bash
brew install python@3.11
```

Or download from [python.org](https://www.python.org/downloads/macos/)

Verify:
```bash
python3 --version
pip3 --version
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
```

Verify:
```bash
python3 --version
pip3 --version
```

---

### Step 2: Install Git

#### Windows
Download from [git-scm.com](https://git-scm.com/download/win)

#### macOS
```bash
brew install git
```

#### Linux
```bash
sudo apt install git
```

Verify:
```bash
git --version
```

---

### Step 3: Clone Repository

```bash
# HTTPS (recommended)
git clone https://github.com/Lizzy0981/telecom-x-churn.git

# SSH (if configured)
git clone git@github.com:Lizzy0981/telecom-x-churn.git

# Navigate to directory
cd telecom-x-churn
```

---

### Step 4: Create Virtual Environment

#### Linux/macOS

```bash
# Create virtual environment
python3 -m venv venv

# Activate
source venv/bin/activate

# Verify activation (you should see (venv) in prompt)
which python
```

#### Windows

```cmd
# Create virtual environment
python -m venv venv

# Activate
venv\Scripts\activate

# Verify activation
where python
```

---

### Step 5: Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

# Install development tools (optional)
pip install pytest pytest-cov black flake8 mypy
```

---

### Step 6: Configure Environment

#### API Keys (Optional)

If using external APIs:

1. Copy template:
```bash
cp config/api_keys.example.json config/api_keys.json
```

2. Edit `config/api_keys.json`:
```json
{
  "news_api_key": "YOUR_NEWS_API_KEY_HERE",
  "weather_api_key": "YOUR_WEATHER_API_KEY_HERE",
  "exchange_rate_api_key": "YOUR_EXCHANGE_RATE_API_KEY_HERE"
}
```

#### Logging Configuration

The default logging configuration is in `config/logging.yaml`. Customize if needed.

---

### Step 7: Create Data Directories

```bash
# Create necessary directories
mkdir -p data/raw data/processed data/external
mkdir -p logs
mkdir -p reports/pdf reports/excel
mkdir -p visualizations/static visualizations/interactive
```

Or use the setup script:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

---

## 🔧 Platform-Specific Instructions

### Windows-Specific

#### Using PowerShell

PowerShell may have execution policy restrictions. If you encounter issues:

```powershell
# Check current policy
Get-ExecutionPolicy

# Set policy for current user (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Path Issues

Add Python to PATH manually:
1. Open System Properties → Advanced → Environment Variables
2. Add Python installation directory to PATH
3. Add Python Scripts directory to PATH

### macOS-Specific

#### Apple Silicon (M1/M2)

Some packages may need Rosetta 2:

```bash
# Install Rosetta 2 (if needed)
softwareupdate --install-rosetta
```

#### Permission Issues

```bash
# If you encounter permission errors
sudo chown -R $(whoami) /usr/local/lib/python3.11/site-packages
```

### Linux-Specific

#### Additional Dependencies

```bash
# Install system dependencies for certain Python packages
sudo apt install build-essential libssl-dev libffi-dev python3-dev
```

#### Font Issues (for matplotlib)

```bash
sudo apt install fonts-liberation
```

---

## ✅ Verification

### Verify Installation

Run the verification script:

```bash
python -c "import sys; print(f'Python {sys.version}')"
python -c "import pandas; print(f'Pandas {pandas.__version__}')"
python -c "import numpy; print(f'NumPy {numpy.__version__}')"
```

### Run Tests

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=src --cov-report=html
```

### Test ETL Pipeline

```bash
# Run a quick ETL test
python scripts/run_etl.py --input data/raw/telecom_churn_raw.csv
```

### Verify Web Interface

```bash
# Start local server
cd web/
python -m http.server 8000

# Visit: http://localhost:8000
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. "python: command not found"

**Solution:** Use `python3` instead of `python` on macOS/Linux:
```bash
python3 --version
```

#### 2. "pip: command not found"

**Solution:**
```bash
python3 -m pip install --upgrade pip
```

#### 3. Permission Denied

**Linux/macOS:**
```bash
chmod +x scripts/setup.sh
```

**Windows:** Run as Administrator

#### 4. SSL Certificate Errors

**Solution:**
```bash
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt
```

#### 5. Package Installation Fails

**Solution:**
```bash
# Upgrade pip
pip install --upgrade pip setuptools wheel

# Retry installation
pip install -r requirements.txt
```

#### 6. Virtual Environment Issues

**Solution:** Delete and recreate:
```bash
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 7. Memory Errors

**Solution:** Process data in chunks or increase system RAM.

---

## 📊 Optional Components

### Jupyter Notebook (Optional)

```bash
pip install jupyter
jupyter notebook
```

### Database Support (Optional)

```bash
# PostgreSQL
pip install psycopg2-binary

# MySQL
pip install mysql-connector-python

# SQLite (included in Python)
```

### Additional Visualization Tools (Optional)

```bash
pip install seaborn plotly-express
```

---

## 🚀 Next Steps

After successful installation:

1. **Read Documentation:**
   - [Usage Guide](USAGE_GUIDE.md)
   - [API Documentation](API_DOCUMENTATION.md)
   - [Architecture Guide](ARCHITECTURE.md)

2. **Run Examples:**
   ```bash
   python examples/example_etl.py
   python examples/example_complete_pipeline.py
   ```

3. **Explore Tutorials:**
   - [Getting Started](tutorials/01_getting_started.md)
   - [ETL Pipeline](tutorials/02_etl_pipeline.md)
   - [Visualization](tutorials/03_visualization.md)
   - [Report Generation](tutorials/04_report_generation.md)

4. **Configure for Production:**
   - Set up API keys in `config/api_keys.json`
   - Configure logging in `config/logging.yaml`
   - Customize settings in `config/settings.json`

---

## 📞 Getting Help

- **Issues:** [GitHub Issues](https://github.com/Lizzy0981/telecom-x-churn/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Lizzy0981/telecom-x-churn/discussions)
- **Email:** lizzyfamilia@gmail.com

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Developed with 💜 by Elizabeth Díaz Familia**
