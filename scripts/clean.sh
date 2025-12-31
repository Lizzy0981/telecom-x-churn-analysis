#!/bin/bash
################################################################################
# Telecom X - Clean Script
# Remove temporary files, caches, and build artifacts
#
# Author: Elizabeth Díaz Familia
# Version: 1.0.0
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_header "TELECOM X - Clean Temporary Files"
echo ""

# Remove Python cache files
print_info "Removing Python cache files..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -type f -name "*.pyo" -delete 2>/dev/null || true
find . -type f -name "*.pyd" -delete 2>/dev/null || true
find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "*.egg" -exec rm -rf {} + 2>/dev/null || true
print_success "Python cache cleaned"

# Remove pytest cache
print_info "Removing pytest cache..."
find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
rm -rf .pytest_cache 2>/dev/null || true
print_success "Pytest cache cleaned"

# Remove coverage files
print_info "Removing coverage files..."
rm -f .coverage 2>/dev/null || true
rm -rf htmlcov/ 2>/dev/null || true
rm -f coverage.xml 2>/dev/null || true
print_success "Coverage files cleaned"

# Remove build artifacts
print_info "Removing build artifacts..."
rm -rf build/ 2>/dev/null || true
rm -rf dist/ 2>/dev/null || true
rm -rf .eggs/ 2>/dev/null || true
print_success "Build artifacts cleaned"

# Remove log files (optional)
read -p "Remove log files? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Removing log files..."
    rm -rf logs/*.log 2>/dev/null || true
    print_success "Log files cleaned"
else
    print_info "Log files kept"
fi

# Remove temporary data files (optional)
read -p "Remove temporary data files in data/processed/? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Removing temporary data files..."
    rm -f data/processed/temp_* 2>/dev/null || true
    print_success "Temporary data cleaned"
else
    print_info "Data files kept"
fi

# Remove node_modules if exists (for web assets)
if [ -d "node_modules" ]; then
    read -p "Remove node_modules/? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Removing node_modules..."
        rm -rf node_modules/
        print_success "node_modules removed"
    fi
fi

# Remove macOS files
if [[ "$OSTYPE" == "darwin"* ]]; then
    print_info "Removing macOS system files..."
    find . -name ".DS_Store" -delete 2>/dev/null || true
    print_success "macOS files cleaned"
fi

# Remove editor backup files
print_info "Removing editor backup files..."
find . -name "*~" -delete 2>/dev/null || true
find . -name "*.swp" -delete 2>/dev/null || true
find . -name "*.swo" -delete 2>/dev/null || true
print_success "Editor backups cleaned"

echo ""
print_header "Cleanup Complete!"
echo ""
print_success "All temporary files removed"
echo ""

exit 0
