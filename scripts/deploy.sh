#!/bin/bash

# 🚀 Telecom X - Deploy Script
# Deploys frontend and backend to production

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }

main() {
    clear
    print_header "🚀 TELECOM X - DEPLOYMENT"
    echo ""
    
    # Check if we're on main/master branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
        print_warning "You're on branch '$CURRENT_BRANCH'"
        read -p "Continue deployment? (y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        print_error "You have uncommitted changes"
        git status -s
        exit 1
    fi
    
    # Run tests before deploying
    print_header "🧪 Running Tests"
    ./scripts/test.sh
    
    if [ $? -ne 0 ]; then
        print_error "Tests failed. Aborting deployment."
        exit 1
    fi
    
    # Build project
    print_header "🔨 Building Project"
    ./scripts/build.sh
    
    if [ $? -ne 0 ]; then
        print_error "Build failed. Aborting deployment."
        exit 1
    fi
    
    # Deploy Frontend
    print_header "📤 Deploying Frontend"
    cd frontend
    
    if command -v vercel >/dev/null 2>&1; then
        print_info "Deploying to Vercel..."
        vercel --prod
        print_success "Frontend deployed to Vercel"
    elif command -v netlify >/dev/null 2>&1; then
        print_info "Deploying to Netlify..."
        netlify deploy --prod
        print_success "Frontend deployed to Netlify"
    else
        print_warning "No deployment tool found (vercel/netlify)"
        print_info "Manual deployment required"
    fi
    
    cd ..
    
    # Deploy Backend
    print_header "📤 Deploying Backend"
    cd backend
    
    if command -v railway >/dev/null 2>&1; then
        print_info "Deploying to Railway..."
        railway up
        print_success "Backend deployed to Railway"
    elif command -v render >/dev/null 2>&1; then
        print_info "Deploying to Render..."
        render deploy
        print_success "Backend deployed to Render"
    else
        print_warning "No deployment tool found (railway/render)"
        print_info "Manual deployment required"
    fi
    
    cd ..
    
    # Tag release
    print_header "🏷️  Tagging Release"
    
    read -p "Enter version tag (e.g., v1.0.0): " VERSION
    if [[ -n "$VERSION" ]]; then
        git tag -a "$VERSION" -m "Release $VERSION"
        git push origin "$VERSION"
        print_success "Release tagged: $VERSION"
    fi
    
    # Final message
    print_header "✅ Deployment Complete!"
    echo ""
    print_success "Telecom X has been deployed!"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Verify deployment at production URLs"
    echo "  2. Run smoke tests"
    echo "  3. Monitor error logs"
    echo "  4. Update CHANGELOG.md"
    echo ""
    echo -e "${GREEN}Deployment successful! 🎉${NC}"
    echo ""
}

main "$@"
