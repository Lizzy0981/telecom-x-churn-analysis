#!/bin/bash

# 🚀 Telecom X - Setup Script
# Configures the development environment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup
main() {
    clear
    print_header "🚀 TELECOM X - SETUP"
    echo ""
    print_info "This script will set up your development environment"
    echo ""

    # Check prerequisites
    print_header "📋 Checking Prerequisites"
    
    # Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js >= 18.0.0"
        exit 1
    fi

    # npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm installed: $NPM_VERSION"
    else
        print_error "npm not found"
        exit 1
    fi

    # Python
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python installed: $PYTHON_VERSION"
    else
        print_error "Python not found. Please install Python >= 3.11"
        exit 1
    fi

    # pip
    if command_exists pip3; then
        PIP_VERSION=$(pip3 --version)
        print_success "pip installed: $PIP_VERSION"
    else
        print_error "pip not found"
        exit 1
    fi

    # PostgreSQL (optional)
    if command_exists psql; then
        POSTGRES_VERSION=$(psql --version)
        print_success "PostgreSQL installed: $POSTGRES_VERSION"
    else
        print_warning "PostgreSQL not found (optional for local development)"
    fi

    echo ""

    # Setup Frontend
    print_header "📦 Setting up Frontend"
    
    cd frontend || exit 1
    
    print_info "Installing frontend dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi

    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_info "Creating .env file from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success ".env file created"
        else
            cat > .env << EOF
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_ENABLE_PWA=true
VITE_MAX_FILE_SIZE=500
VITE_MAX_FILES=10
EOF
            print_success ".env file created with defaults"
        fi
    else
        print_warning ".env file already exists"
    fi

    cd ..
    echo ""

    # Setup Backend
    print_header "🐍 Setting up Backend"
    
    cd backend || exit 1

    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_info "Creating Python virtual environment..."
        python3 -m venv venv
        print_success "Virtual environment created"
    else
        print_warning "Virtual environment already exists"
    fi

    # Activate virtual environment
    print_info "Activating virtual environment..."
    source venv/bin/activate || . venv/Scripts/activate

    # Install dependencies
    print_info "Installing backend dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt

    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi

    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_info "Creating .env file from env.example..."
        if [ -f env.example ]; then
            cp env.example .env
            print_success ".env file created"
        else
            cat > .env << EOF
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/telecom_x

# JWT
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Environment
ENVIRONMENT=development
DEBUG=True
EOF
            print_success ".env file created with defaults"
        fi
    else
        print_warning ".env file already exists"
    fi

    cd ..
    echo ""

    # Database setup
    print_header "🗄️  Database Setup"
    
    if command_exists psql; then
        read -p "Do you want to create the database now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Creating database..."
            createdb telecom_x 2>/dev/null || print_warning "Database may already exist"
            
            cd backend
            print_info "Running migrations..."
            alembic upgrade head
            
            if [ $? -eq 0 ]; then
                print_success "Database migrations applied"
            else
                print_warning "Migrations failed (this is ok if Alembic is not set up yet)"
            fi
            
            cd ..
        fi
    else
        print_warning "PostgreSQL not installed. Skipping database setup."
        print_info "You can use a cloud database (Supabase, Railway, etc.)"
    fi

    echo ""

    # Git hooks setup
    print_header "🔧 Git Hooks Setup"
    
    if [ -d ".git" ]; then
        print_info "Setting up Git hooks..."
        
        # Pre-commit hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Run linting before commit

echo "Running linters..."

# Frontend
cd frontend
npm run lint --silent || exit 1
cd ..

# Backend
cd backend
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
flake8 app/ || exit 1
cd ..

echo "✓ Linting passed"
EOF
        
        chmod +x .git/hooks/pre-commit
        print_success "Git hooks configured"
    else
        print_warning "Not a Git repository. Skipping Git hooks setup."
    fi

    echo ""

    # Final message
    print_header "✅ Setup Complete!"
    echo ""
    print_success "Your development environment is ready!"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo ""
    echo "  1. Start the backend:"
    echo "     cd backend"
    echo "     source venv/bin/activate"
    echo "     uvicorn app.main:app --reload"
    echo ""
    echo "  2. Start the frontend (in another terminal):"
    echo "     cd frontend"
    echo "     npm run dev"
    echo ""
    echo "  3. Open your browser:"
    echo "     http://localhost:5173"
    echo ""
    echo -e "${YELLOW}Documentation:${NC}"
    echo "  - README.md"
    echo "  - docs/API.md"
    echo "  - docs/ML.md"
    echo "  - docs/DEPLOYMENT.md"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
    echo ""
}

# Run main function
main
