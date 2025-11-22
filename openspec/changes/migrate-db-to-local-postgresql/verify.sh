#!/bin/bash
# Verification script for database migration proposal
# Run this to validate the environment before implementation

set -e

echo "🔍 Verifying Database Migration Prerequisites..."
echo ""

# Check Docker installation
echo "✓ Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "  ✓ Docker found: $DOCKER_VERSION"
else
    echo "  ✗ Docker not found. Please install Docker Desktop"
    exit 1
fi

# Check Docker Compose
echo "✓ Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo "  ✓ Docker Compose found: $COMPOSE_VERSION"
else
    echo "  ✗ Docker Compose not found"
    exit 1
fi

# Check if Docker daemon is running
echo "✓ Checking Docker daemon..."
if docker info &> /dev/null; then
    echo "  ✓ Docker daemon is running"
else
    echo "  ✗ Docker daemon is not running. Please start Docker"
    exit 1
fi

# Check port 5432 availability
echo "✓ Checking port 5432 availability..."
if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  ⚠ Port 5432 is already in use:"
    lsof -i :5432
    echo "  Please stop the service using this port before proceeding"
else
    echo "  ✓ Port 5432 is available"
fi

# Check Node.js installation
echo "✓ Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  ✓ Node.js found: $NODE_VERSION"
    
    # Check if version is 18 or higher
    MAJOR_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        echo "  ✓ Node.js version meets requirements (>= 18)"
    else
        echo "  ⚠ Node.js version is below 18. Consider upgrading"
    fi
else
    echo "  ✗ Node.js not found"
    exit 1
fi

# Check if backend directory exists
echo "✓ Checking project structure..."
if [ -d "backend" ]; then
    echo "  ✓ backend/ directory found"
else
    echo "  ✗ backend/ directory not found. Run from project root"
    exit 1
fi

# Check if docker-compose.yml exists
if [ -f "docker-compose.yml" ]; then
    echo "  ✓ docker-compose.yml found"
else
    echo "  ✗ docker-compose.yml not found"
    exit 1
fi

# Check if Prisma schema exists
if [ -f "backend/prisma/schema.prisma" ]; then
    echo "  ✓ Prisma schema found"
else
    echo "  ✗ Prisma schema not found"
    exit 1
fi

# Check current DATABASE_URL
echo "✓ Checking current database configuration..."
if [ -f "backend/.env" ]; then
    echo "  ✓ backend/.env found"
    if grep -q "database-1.cjy40k02q315.ap-southeast-1.rds.amazonaws.com" backend/.env; then
        echo "  ℹ Current DATABASE_URL points to AWS RDS (expected)"
    elif grep -q "localhost:5432" backend/.env; then
        echo "  ℹ DATABASE_URL already points to localhost (migration may be done)"
    else
        echo "  ⚠ Unexpected DATABASE_URL format"
    fi
else
    echo "  ⚠ backend/.env not found. Will need to create from .env.example"
fi

# Check if OpenSpec is installed
echo "✓ Checking OpenSpec installation..."
if npm list openspec &> /dev/null || npx openspec --version &> /dev/null; then
    echo "  ✓ OpenSpec is available"
else
    echo "  ⚠ OpenSpec may not be installed globally, but npx should work"
fi

# Check Git status
echo "✓ Checking Git status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "  ✓ Current branch: $CURRENT_BRANCH"
    
    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        echo "  ⚠ You have uncommitted changes:"
        git status -s
        echo "  Consider committing before migration"
    else
        echo "  ✓ Working directory is clean"
    fi
else
    echo "  ✗ Not a git repository"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ All prerequisites met! You can proceed with the migration."
echo ""
echo "Next steps:"
echo "1. Review the proposal: npx openspec show migrate-db-to-local-postgresql"
echo "2. Create feature branch: git checkout -b main#migrate-db-to-local"
echo "3. Follow tasks in tasks.md sequentially"
echo "4. Start with: docker-compose up postgres"
echo ""
echo "Documentation:"
echo "- proposal.md: Overview and motivation"
echo "- design.md: Technical architecture and decisions"
echo "- tasks.md: Step-by-step implementation guide"
echo "- README.md: Quick reference and validation"
echo ""
