#!/bin/bash

# Planning Poker - Development Setup and Run Script
# This script helps set up and run the Planning Poker application

echo "🎴 Planning Poker - Setup & Run"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found:${NC} $(node --version)"
echo -e "${GREEN}✓ npm found:${NC} $(npm --version)"
echo ""

# Install dependencies
install_deps() {
    echo -e "${YELLOW}Installing dependencies...${NC}"
    
    echo "📦 Installing server dependencies..."
    cd server
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Server dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install server dependencies${NC}"
        exit 1
    fi
    cd ..
    
    echo "📦 Installing client dependencies..."
    cd client
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Client dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install client dependencies${NC}"
        exit 1
    fi
    cd ..
    
    echo ""
    echo -e "${GREEN}✓ All dependencies installed!${NC}"
    echo ""
}

# Run the application
run_app() {
    echo -e "${YELLOW}Starting Planning Poker...${NC}"
    echo ""
    echo "⚠️  You need to run these commands in separate terminal windows:"
    echo ""
    echo -e "${GREEN}Terminal 1 (Server):${NC}"
    echo "  cd server"
    echo "  npm run dev"
    echo ""
    echo -e "${GREEN}Terminal 2 (Client):${NC}"
    echo "  cd client"
    echo "  npm run dev"
    echo ""
    echo "Then open your browser to: http://localhost:3000"
    echo ""
}

# Main menu
if [ $# -eq 0 ]; then
    echo "Available commands:"
    echo "  ./setup.sh install    - Install all dependencies"
    echo "  ./setup.sh dev        - Show instructions to run the app"
    echo "  ./setup.sh help       - Show this message"
    echo ""
    exit 1
fi

case "$1" in
    install)
        install_deps
        ;;
    dev)
        run_app
        ;;
    help)
        echo "Planning Poker - Setup Script"
        echo ""
        echo "Commands:"
        echo "  install              Install all dependencies"
        echo "  dev                  Show how to run the development servers"
        echo "  help                 Show this help message"
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Use './setup.sh help' for available commands"
        exit 1
        ;;
esac
