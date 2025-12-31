#!/bin/bash
################################################################################
# Telecom X - Customer Churn Analysis
# Setup Script - Instalación y configuración inicial del proyecto
#
# Autor: Elizabeth Díaz Familia
# Versión: 1.0.0
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if running on Unix-like system
if [[ "$OSTYPE" != "linux-gnu"* ]] && [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script requires a Unix-like system (Linux/macOS)"
    exit 1
fi

print_header "TELECOM X - Setup & Installation"
echo ""

# Step 1: Check Python installation
print_info "Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "Python $PYTHON_VERSION found"
else
    print_error "Python 3 not found. Please install Python 3.8 or higher."
    exit 1
fi

# Step 2: Create virtual environment
print_info "Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_info "Virtual environment already exists"
fi

# Step 3: Activate virtual environment
print_info "Activating virtual environment..."
source venv/bin/activate
print_success "Virtual environment activated"

# Step 4: Upgrade pip
print_info "Upgrading pip..."
pip install --upgrade pip > /dev/null 2>&1
print_success "pip upgraded"

# Step 5: Install dependencies
print_info "Installing Python dependencies..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    print_success "Dependencies installed from requirements.txt"
else
    print_error "requirements.txt not found"
fi

# Step 6: Install development dependencies
print_info "Installing development dependencies..."
pip install pytest pytest-cov black flake8 mypy > /dev/null 2>&1
print_success "Development tools installed"

# Step 7: Create necessary directories
print_info "Creating project directories..."
mkdir -p data/raw data/processed data/external
mkdir -p logs
mkdir -p reports/pdf reports/excel
mkdir -p visualizations/static visualizations/interactive
print_success "Project directories created"

# Step 8: Copy configuration templates
print_info "Setting up configuration files..."
if [ -f "config/api_keys.example.json" ] && [ ! -f "config/api_keys.json" ]; then
    cp config/api_keys.example.json config/api_keys.json
    print_success "API keys template copied (remember to add your keys!)"
fi

# Step 9: Setup pre-commit hooks (optional)
print_info "Setting up pre-commit hooks..."
if command -v pre-commit &> /dev/null; then
    pre-commit install > /dev/null 2>&1
    print_success "Pre-commit hooks installed"
else
    print_info "pre-commit not found (optional)"
fi

# Step 10: Run initial tests
print_info "Running initial tests..."
if command -v pytest &> /dev/null; then
    if pytest tests/ -q --tb=no > /dev/null 2>&1; then
        print_success "All tests passed"
    else
        print_error "Some tests failed (check with: pytest tests/ -v)"
    fi
else
    print_info "pytest not found, skipping tests"
fi

# Step 11: Display project info
echo ""
print_header "Installation Complete!"
echo ""
print_success "Project: Telecom X - Customer Churn Analysis"
print_success "Version: 1.0.0"
print_success "Author: Elizabeth Díaz Familia"
echo ""
print_info "Next steps:"
echo "  1. Activate virtual environment: source venv/bin/activate"
echo "  2. Configure API keys in: config/api_keys.json"
echo "  3. Run ETL pipeline: python scripts/run_etl.py"
echo "  4. Generate reports: python scripts/generate_reports.py"
echo ""
print_info "For more information, see: README.md"
echo ""

exit 0
