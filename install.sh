#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Goby installation...${NC}"

# Check for required system tools
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${YELLOW}Installing $1...${NC}"
        if [ -x "$(command -v apt-get)" ]; then
            sudo apt-get update && sudo apt-get install -y $1
        elif [ -x "$(command -v yum)" ]; then
            sudo yum install -y $1
        elif [ -x "$(command -v brew)" ]; then
            brew install $1
        else
            echo -e "${RED}Could not install $1. Please install it manually.${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✓ $1 is already installed${NC}"
    fi
}

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Installing...${NC}"
    if [ -x "$(command -v apt-get)" ]; then
        curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [ -x "$(command -v yum)" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
        sudo yum install -y nodejs
    elif [ -x "$(command -v brew)" ]; then
        brew install node
    else
        echo -e "${RED}Could not install Node.js. Please install it manually.${NC}"
        exit 1
    fi
fi

# Check for required system tools
echo -e "${GREEN}Checking required system tools...${NC}"
check_command "nmap"
check_command "sqlite3"
check_command "netstat" || check_command "net-tools"

# Create necessary directories
echo -e "${GREEN}Creating necessary directories...${NC}"
mkdir -p frontend/components
mkdir -p frontend/styles
mkdir -p backend/db
mkdir -p api

# Install Node.js dependencies
echo -e "${GREEN}Installing Node.js dependencies...${NC}"
npm install

# Initialize SQLite database
echo -e "${GREEN}Initializing database...${NC}"
sqlite3 memory.db << EOF
CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventType TEXT NOT NULL,
    description TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_memories_timestamp ON memories(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(eventType);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
EOF

# Initialize security baseline
echo -e "${GREEN}Initializing security baseline...${NC}"
node << EOF
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const criticalFiles = [
    'package.json',
    'server/index.js',
    'frontend/main.jsx',
    'frontend/App.jsx',
    'server/securityMonitor.js'
];

const baselineFile = 'security_baseline.json';
const baseline = {};

criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const data = fs.readFileSync(file);
        baseline[file] = crypto.createHash('sha256').update(data).digest('hex');
    }
});

fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2));
EOF

# Make scripts executable and set proper permissions
echo -e "${GREEN}Setting up permissions...${NC}"
chmod +x install.sh
chmod +x goby_sanity_check.sh

# Set proper permissions for security-sensitive files
chmod 600 security_baseline.json

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${GREEN}Creating .env file...${NC}"
    cat > .env << EOF
PORT=3000
NODE_ENV=development
EOF
fi

# Run sanity checks
echo -e "${GREEN}Running sanity checks...${NC}"
./goby_sanity_check.sh

echo -e "${GREEN}Installation complete!${NC}"
echo -e "To start Goby, run: ${YELLOW}npm start${NC}"
