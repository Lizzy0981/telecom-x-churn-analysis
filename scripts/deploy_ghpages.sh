#!/bin/bash
################################################################################
# Telecom X - GitHub Pages Deployment Script
# Deploy web interface to GitHub Pages
#
# Author: Elizabeth Díaz Familia
# Version: 1.0.0
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_header "TELECOM X - GitHub Pages Deployment"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "git is not installed"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not a git repository"
    exit 1
fi

# Check if web directory exists
if [ ! -d "web" ]; then
    print_error "web/ directory not found"
    exit 1
fi

print_info "Preparing deployment..."

# Create gh-pages branch if it doesn't exist
if ! git show-ref --verify --quiet refs/heads/gh-pages; then
    print_info "Creating gh-pages branch..."
    git checkout --orphan gh-pages
    git reset --hard
    git commit --allow-empty -m "Initial gh-pages commit"
    git checkout main || git checkout master
    print_success "gh-pages branch created"
fi

# Build step (if needed)
print_info "Building web assets..."

# Copy web files to temporary directory
TMP_DIR=$(mktemp -d)
cp -r web/* "$TMP_DIR/"
print_success "Files copied to temporary directory"

# Switch to gh-pages branch
print_info "Switching to gh-pages branch..."
git checkout gh-pages

# Clean existing files (except .git)
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +

# Copy new files
cp -r "$TMP_DIR"/* .
print_success "New files copied"

# Create .nojekyll file (for GitHub Pages)
touch .nojekyll
print_success ".nojekyll file created"

# Add and commit changes
print_info "Committing changes..."
git add .
git commit -m "Deploy to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')" || {
    print_info "No changes to commit"
}

# Push to GitHub
print_info "Pushing to GitHub..."
git push origin gh-pages --force

# Switch back to main branch
git checkout main || git checkout master

# Clean up
rm -rf "$TMP_DIR"

echo ""
print_header "Deployment Complete!"
echo ""
print_success "Web interface deployed to GitHub Pages"
print_info "Your site will be available at:"
print_info "  https://YOUR_USERNAME.github.io/YOUR_REPO/"
echo ""
print_info "Note: It may take a few minutes for changes to appear"
echo ""

exit 0
