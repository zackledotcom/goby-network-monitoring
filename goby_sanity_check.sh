#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Running Goby sanity checks...${NC}"

# Function to check if a command exists
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}✗ $1 is not installed${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $1 is installed${NC}"
        return 0
    fi
}

# Function to check if a port is available
check_port() {
    if ! lsof -i:$1 > /dev/null; then
        echo -e "${GREEN}✓ Port $1 is available${NC}"
        return 0
    else
        echo -e "${RED}✗ Port $1 is in use${NC}"
        return 1
    fi
}

# Check system requirements
echo -e "\n${YELLOW}Checking system requirements...${NC}"
REQUIREMENTS_MET=true

# Check Node.js
if check_command "node"; then
    NODE_VERSION=$(node -v)
    echo "  Node.js version: $NODE_VERSION"
else
    REQUIREMENTS_MET=false
fi

# Check npm
if check_command "npm"; then
    NPM_VERSION=$(npm -v)
    echo "  npm version: $NPM_VERSION"
else
    REQUIREMENTS_MET=false
fi

# Check required system tools
echo -e "\n${YELLOW}Checking required system tools...${NC}"
for tool in "nmap" "sqlite3" "netstat"; do
    if ! check_command $tool; then
        REQUIREMENTS_MET=false
    fi
done

# Check if required ports are available
echo -e "\n${YELLOW}Checking required ports...${NC}"
for port in 3000 8000; do
    if ! check_port $port; then
        REQUIREMENTS_MET=false
    fi
done

# Check if required directories exist
echo -e "\n${YELLOW}Checking directory structure...${NC}"
for dir in "frontend" "backend" "api" "server"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓ $dir directory exists${NC}"
    else
        echo -e "${RED}✗ $dir directory is missing${NC}"
        REQUIREMENTS_MET=false
    fi
done

# Check database and security features
echo -e "\n${YELLOW}Checking database and security features...${NC}"
if [ -f "memory.db" ]; then
    echo -e "${GREEN}✓ Database file exists${NC}"
    
    # Check if memories table exists
    if sqlite3 memory.db "SELECT name FROM sqlite_master WHERE type='table' AND name='memories';" | grep -q "memories"; then
        echo -e "${GREEN}✓ Memories table exists${NC}"
    else
        echo -e "${RED}✗ Memories table is missing${NC}"
        REQUIREMENTS_MET=false
    fi
    
    # Check if security_events table exists
    if sqlite3 memory.db "SELECT name FROM sqlite_master WHERE type='table' AND name='security_events';" | grep -q "security_events"; then
        echo -e "${GREEN}✓ Security events table exists${NC}"
    else
        echo -e "${RED}✗ Security events table is missing${NC}"
        REQUIREMENTS_MET=false
    fi
    
    # Check if required indexes exist
    echo -e "\n${YELLOW}Checking database indexes...${NC}"
    for index in "idx_memories_type" "idx_memories_timestamp" "idx_security_events_type" "idx_security_events_timestamp"; do
        if sqlite3 memory.db "SELECT name FROM sqlite_master WHERE type='index' AND name='$index';" | grep -q "$index"; then
            echo -e "${GREEN}✓ Index $index exists${NC}"
        else
            echo -e "${RED}✗ Index $index is missing${NC}"
            REQUIREMENTS_MET=false
        fi
    done
else
    echo -e "${RED}✗ Database file is missing${NC}"
    REQUIREMENTS_MET=false
fi

# Check security baseline
echo -e "\n${YELLOW}Checking security baseline...${NC}"
if [ -f "security_baseline.json" ]; then
    echo -e "${GREEN}✓ Security baseline file exists${NC}"
    # Check if file has proper permissions (600)
    if [ "$(stat -c %a security_baseline.json)" = "600" ]; then
        echo -e "${GREEN}✓ Security baseline file has correct permissions${NC}"
    else
        echo -e "${RED}✗ Security baseline file has incorrect permissions${NC}"
        REQUIREMENTS_MET=false
    fi
    
    # Validate JSON format
    if jq empty security_baseline.json 2>/dev/null; then
        echo -e "${GREEN}✓ Security baseline file is valid JSON${NC}"
    else
        echo -e "${RED}✗ Security baseline file is not valid JSON${NC}"
        REQUIREMENTS_MET=false
    fi
else
    echo -e "${RED}✗ Security baseline file is missing${NC}"
    REQUIREMENTS_MET=false
fi

# Check security monitor and other components
echo -e "\n${YELLOW}Checking security components...${NC}"
if [ -f "server/securityMonitor.js" ]; then
    echo -e "${GREEN}✓ Security monitor exists${NC}"
else
    echo -e "${RED}✗ Security monitor is missing${NC}"
    REQUIREMENTS_MET=false
fi

if [ -f "frontend/components/SecurityDashboard.jsx" ]; then
    echo -e "${GREEN}✓ Security dashboard component exists${NC}"
else
    echo -e "${RED}✗ Security dashboard component is missing${NC}"
    REQUIREMENTS_MET=false
fi

# Check package.json and node_modules
echo -e "\n${YELLOW}Checking Node.js dependencies...${NC}"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓ package.json exists${NC}"
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✓ node_modules exists${NC}"
    else
        echo -e "${RED}✗ node_modules is missing. Run 'npm install'${NC}"
        REQUIREMENTS_MET=false
    fi
else
    echo -e "${RED}✗ package.json is missing${NC}"
    REQUIREMENTS_MET=false
fi

# Check for required environment variables
echo -e "\n${YELLOW}Checking environment variables...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    # Check if required variables are set
    if grep -q "PORT=" .env && grep -q "NODE_ENV=" .env; then
        echo -e "${GREEN}✓ Required environment variables are set${NC}"
    else
        echo -e "${RED}✗ Some required environment variables are missing${NC}"
        REQUIREMENTS_MET=false
    fi
else
    echo -e "${RED}✗ .env file is missing${NC}"
    REQUIREMENTS_MET=false
fi

# Final status
echo -e "\n${YELLOW}Sanity check complete!${NC}"
if [ "$REQUIREMENTS_MET" = true ]; then
    echo -e "${GREEN}✓ All checks passed. Goby is ready to run!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please fix the issues above before running Goby.${NC}"
    exit 1
fi
