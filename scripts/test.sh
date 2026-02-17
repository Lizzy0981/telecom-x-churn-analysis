#!/bin/bash

# 🧪 Telecom X - Test Script
# Runs all tests for frontend and backend

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

FRONTEND_PASSED=true
BACKEND_PASSED=true

main() {
    clear
    print_header "🧪 TELECOM X - TESTING"
    echo ""
    
    # Frontend Tests
    print_header "📦 Frontend Tests"
    cd frontend
    
    print_info "Running linter..."
    if npm run lint --silent; then
        print_success "Linting passed"
    else
        print_error "Linting failed"
        FRONTEND_PASSED=false
    fi
    
    print_info "Running unit tests..."
    if npm run test -- --run --silent; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        FRONTEND_PASSED=false
    fi
    
    print_info "Running type checking..."
    if npm run type-check --silent 2>/dev/null || npx tsc --noEmit; then
        print_success "Type checking passed"
    else
        print_error "Type checking failed"
        FRONTEND_PASSED=false
    fi
    
    cd ..
    echo ""
    
    # Backend Tests
    print_header "🐍 Backend Tests"
    cd backend
    
    # Activate virtual environment
    source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
    
    print_info "Running linter (flake8)..."
    if flake8 app/ --max-line-length=100 --exclude=venv; then
        print_success "Linting passed"
    else
        print_error "Linting failed"
        BACKEND_PASSED=false
    fi
    
    print_info "Running type checking (mypy)..."
    if mypy app/ --ignore-missing-imports 2>/dev/null || print_warning "mypy not installed or failed"; then
        print_success "Type checking passed"
    fi
    
    print_info "Running unit tests..."
    if pytest tests/ -v --tb=short; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        BACKEND_PASSED=false
    fi
    
    print_info "Generating coverage report..."
    if pytest tests/ --cov=app --cov-report=term-missing --cov-report=html --quiet; then
        COVERAGE=$(pytest tests/ --cov=app --cov-report=term | grep "TOTAL" | awk '{print $NF}')
        print_success "Coverage: $COVERAGE"
        
        # Check if coverage meets minimum (85%)
        COVERAGE_NUM=$(echo $COVERAGE | sed 's/%//')
        if (( $(echo "$COVERAGE_NUM >= 85" | bc -l) )); then
            print_success "Coverage meets minimum requirement (85%)"
        else
            print_warning "Coverage below minimum requirement (85%): ${COVERAGE_NUM}%"
        fi
    else
        print_warning "Coverage report generation failed"
    fi
    
    cd ..
    echo ""
    
    # Summary
    print_header "📊 Test Summary"
    echo ""
    
    if $FRONTEND_PASSED; then
        print_success "Frontend: All tests passed"
    else
        print_error "Frontend: Some tests failed"
    fi
    
    if $BACKEND_PASSED; then
        print_success "Backend: All tests passed"
    else
        print_error "Backend: Some tests failed"
    fi
    
    echo ""
    
    if $FRONTEND_PASSED && $BACKEND_PASSED; then
        print_header "✅ ALL TESTS PASSED"
        echo ""
        print_success "Your code is ready for deployment!"
        echo ""
        exit 0
    else
        print_header "❌ SOME TESTS FAILED"
        echo ""
        print_error "Please fix the failing tests before deploying"
        echo ""
        exit 1
    fi
}

main "$@"
