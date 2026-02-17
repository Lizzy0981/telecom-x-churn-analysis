#!/bin/bash

# 🔨 Telecom X - Build Script
# Builds frontend and backend for production

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
    print_header "🔨 TELECOM X - BUILD"
    echo ""
    
    START_TIME=$(date +%s)
    
    # Clean previous builds
    print_header "🧹 Cleaning Previous Builds"
    
    print_info "Cleaning frontend build..."
    rm -rf frontend/dist
    print_success "Frontend build cleaned"
    
    print_info "Cleaning backend cache..."
    find backend -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true
    find backend -type f -name "*.pyc" -delete 2>/dev/null || true
    print_success "Backend cache cleaned"
    
    echo ""
    
    # Build Frontend
    print_header "📦 Building Frontend"
    cd frontend
    
    print_info "Installing dependencies..."
    npm ci --silent
    print_success "Dependencies installed"
    
    print_info "Running TypeScript compiler..."
    npx tsc --noEmit
    print_success "TypeScript compilation passed"
    
    print_info "Building production bundle..."
    NODE_ENV=production npm run build
    
    if [ -d "dist" ]; then
        BUNDLE_SIZE=$(du -sh dist | awk '{print $1}')
        print_success "Frontend built successfully (Size: $BUNDLE_SIZE)"
        
        # Analyze bundle size
        print_info "Analyzing bundle..."
        if [ -f "dist/index.html" ]; then
            print_success "index.html generated"
        fi
        
        JS_FILES=$(find dist -name "*.js" | wc -l)
        CSS_FILES=$(find dist -name "*.css" | wc -l)
        print_info "Generated: $JS_FILES JS files, $CSS_FILES CSS files"
        
    else
        print_error "Build failed - dist folder not created"
        exit 1
    fi
    
    cd ..
    echo ""
    
    # Build Backend
    print_header "🐍 Preparing Backend"
    cd backend
    
    # Activate virtual environment
    source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
    
    print_info "Installing production dependencies..."
    pip install --quiet -r requirements.txt
    print_success "Dependencies installed"
    
    print_info "Compiling Python files..."
    python -m compileall app/ -q
    print_success "Python files compiled"
    
    # Check if ML models exist
    if [ -d "../frontend/public/models" ]; then
        print_success "ML models found"
    else
        print_warning "ML models not found (optional)"
    fi
    
    cd ..
    echo ""
    
    # Create production archive (optional)
    print_header "📦 Creating Production Archive"
    
    read -p "Create production archive? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ARCHIVE_NAME="telecom-x-$(date +%Y%m%d-%H%M%S).tar.gz"
        print_info "Creating archive: $ARCHIVE_NAME"
        
        tar -czf "$ARCHIVE_NAME" \
            frontend/dist \
            backend/app \
            backend/requirements.txt \
            backend/Dockerfile \
            backend/docker-compose.yml \
            --exclude='__pycache__' \
            --exclude='*.pyc' \
            --exclude='venv' \
            --exclude='.env'
        
        ARCHIVE_SIZE=$(du -sh "$ARCHIVE_NAME" | awk '{print $1}')
        print_success "Archive created: $ARCHIVE_NAME ($ARCHIVE_SIZE)"
    fi
    
    echo ""
    
    # Build Docker images (optional)
    print_header "🐳 Docker Images"
    
    if command -v docker >/dev/null 2>&1; then
        read -p "Build Docker images? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Building backend Docker image..."
            cd backend
            docker build -t telecom-x-backend:latest .
            print_success "Backend image built"
            cd ..
            
            print_info "Building frontend Docker image..."
            cd frontend
            if [ -f "Dockerfile" ]; then
                docker build -t telecom-x-frontend:latest .
                print_success "Frontend image built"
            else
                print_warning "Frontend Dockerfile not found"
            fi
            cd ..
        fi
    else
        print_warning "Docker not installed (optional)"
    fi
    
    echo ""
    
    # Build summary
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    print_header "✅ BUILD COMPLETE"
    echo ""
    print_success "Frontend: Built to frontend/dist/"
    print_success "Backend: Ready for deployment"
    print_info "Build time: ${DURATION}s"
    echo ""
    
    # Next steps
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Test the build:"
    echo "     cd frontend && npm run preview"
    echo ""
    echo "  2. Deploy to production:"
    echo "     ./scripts/deploy.sh"
    echo ""
    echo "  3. Or deploy manually:"
    echo "     - Frontend: Upload frontend/dist/ to your hosting"
    echo "     - Backend: Deploy backend/ to your server"
    echo ""
    echo -e "${GREEN}Build successful! 🎉${NC}"
    echo ""
}

main "$@"
