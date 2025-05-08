const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('memory.db');

// Critical files to monitor
const criticalFiles = [
    'package.json',
    'server/index.js',
    'frontend/main.jsx',
    'frontend/App.jsx',
    'server/securityMonitor.js'
];

// Store baseline checksums
let baselineChecksums = {};

// Compute file checksum
const computeChecksum = (filePath) => {
    try {
        const data = fs.readFileSync(filePath);
        return crypto.createHash('sha256').update(data).digest('hex');
    } catch (error) {
        console.error(`Failed to compute checksum for ${filePath}:`, error);
        return null;
    }
};

// Initialize baseline checksums
const initBaseline = () => {
    criticalFiles.forEach(file => {
        const absolutePath = path.join(__dirname, '..', file);
        if (fs.existsSync(absolutePath)) {
            baselineChecksums[file] = computeChecksum(absolutePath);
            console.log(`Baseline established for ${file}`);
        }
    });
};

// Log security events to database
const logSecurityEvent = (eventType, description, details = {}) => {
    const stmt = db.prepare('INSERT INTO security_events (eventType, description, details) VALUES (?, ?, ?)');
    stmt.run(eventType, description, JSON.stringify(details), (err) => {
        if (err) {
            console.error('Failed to log security event:', err);
        }
    });
};

// Check file integrity
const checkFileIntegrity = () => {
    criticalFiles.forEach(file => {
        const absolutePath = path.join(__dirname, '..', file);
        if (fs.existsSync(absolutePath)) {
            const currentChecksum = computeChecksum(absolutePath);
            if (baselineChecksums[file] && currentChecksum !== baselineChecksums[file]) {
                logSecurityEvent(
                    'file_integrity',
                    `File modification detected: ${file}`,
                    {
                        file,
                        baseline: baselineChecksums[file],
                        current: currentChecksum,
                        timestamp: new Date().toISOString()
                    }
                );
                // Update baseline
                baselineChecksums[file] = currentChecksum;
            }
        }
    });
};

// Monitor memory usage for anomalies
const checkMemoryAnomaly = async () => {
    const used = process.memoryUsage();
    const threshold = 0.8; // 80% memory usage threshold

    if (used.heapUsed / used.heapTotal > threshold) {
        logSecurityEvent(
            'memory_anomaly',
            'High memory usage detected',
            {
                heapUsed: used.heapUsed,
                heapTotal: used.heapTotal,
                percentage: (used.heapUsed / used.heapTotal * 100).toFixed(2),
                timestamp: new Date().toISOString()
            }
        );
    }
};

// Check for suspicious network activity
const checkNetworkActivity = (req) => {
    const suspiciousHeaders = [
        'x-covert-signal',
        'x-custom-data',
        'x-binary-transfer'
    ];

    const suspiciousPatterns = suspiciousHeaders.some(header => 
        req.headers[header] !== undefined
    );

    if (suspiciousPatterns) {
        logSecurityEvent(
            'covert_signal',
            'Suspicious network activity detected',
            {
                headers: req.headers,
                ip: req.ip,
                path: req.path,
                timestamp: new Date().toISOString()
            }
        );
        return true;
    }
    return false;
};

// Initialize security monitoring
const initSecurityMonitor = () => {
    // Initialize baseline checksums
    initBaseline();

    // Check file integrity every minute
    setInterval(checkFileIntegrity, 60000);

    // Check memory usage every 30 seconds
    setInterval(checkMemoryAnomaly, 30000);

    console.log('Security monitoring initialized');
};

// Export functions
module.exports = {
    initSecurityMonitor,
    logSecurityEvent,
    checkNetworkActivity
};
