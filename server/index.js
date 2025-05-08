const express = require('express');
const path = require('path');
const os = require('os');
const { initSecurityMonitor, checkNetworkActivity, logSecurityEvent } = require('./securityMonitor');
const { exec } = require('child_process');
const si = require('systeminformation');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Initialize SQLite database
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('memory.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    
    // Create memories table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create security_events table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS security_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventType TEXT NOT NULL,
      description TEXT,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  }
});

// Security middleware to check for suspicious activity
app.use((req, res, next) => {
  checkNetworkActivity(req);
  next();
});

// Security API Routes
app.get('/api/security/events', (req, res) => {
  const { limit = 100, type } = req.query;
  let sql = 'SELECT * FROM security_events';
  const params = [];

  if (type) {
    sql += ' WHERE eventType = ?';
    params.push(type);
  }

  sql += ' ORDER BY timestamp DESC LIMIT ?';
  params.push(limit);

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve security events' });
    }
    res.json({ events: rows });
  });
});

app.post('/api/security/events', (req, res) => {
  const { eventType, description, details } = req.body;
  if (!eventType || !description) {
    return res.status(400).json({ error: 'Event type and description are required' });
  }

  const stmt = db.prepare('INSERT INTO security_events (eventType, description, details) VALUES (?, ?, ?)');
  stmt.run(eventType, description, JSON.stringify(details || {}), function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to log security event' });
    }
    res.json({ id: this.lastID });
  });
});

// API Routes
app.get('/api/network/scan', async (req, res) => {
  try {
    const command = 'nmap -sn 192.168.1.0/24';
    const fallbackCommand = 'arp -a';
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // Fallback to arp if nmap fails
        exec(fallbackCommand, (err, output) => {
          if (err) {
            return res.status(500).json({ error: 'Network scan failed' });
          }
          const devices = output.split('\n')
            .filter(line => line.trim())
            .map(line => {
              const parts = line.split(' ');
              return {
                ip: parts[1]?.replace(/[()]/g, ''),
                mac: parts[3],
                threatLevel: 'unknown'
              };
            });
          return res.json({ devices });
        });
      } else {
        const devices = stdout.split('\n')
          .filter(line => line.includes('Nmap scan report'))
          .map(line => {
            const ip = line.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/)?.[0];
            return {
              ip,
              threatLevel: 'scanning'
            };
          });
        return res.json({ devices });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Network scan failed' });
  }
});

app.get('/api/system/info', async (req, res) => {
  try {
    const [cpu, mem, osInfo] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo()
    ]);
    
    res.json({
      cpu,
      memory: mem,
      os: osInfo,
      uptime: os.uptime()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get system information' });
  }
});

app.get('/api/system/disk', async (req, res) => {
  try {
    const fsSize = await si.fsSize();
    res.json({ diskUsage: fsSize });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get disk usage' });
  }
});

app.get('/api/network/wifi', async (req, res) => {
  try {
    const networkInterfaces = await si.networkInterfaces();
    const wifiInterface = networkInterfaces.find(iface => 
      iface.type.toLowerCase().includes('wireless')
    );
    
    if (!wifiInterface) {
      return res.status(404).json({ error: 'No WiFi interface found' });
    }

    const wifiInfo = {
      interface: wifiInterface.iface,
      speed: wifiInterface.speed,
      state: wifiInterface.operstate,
      // Add more WiFi specific info here based on OS-specific commands
    };

    res.json({ wifi: wifiInfo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get WiFi information' });
  }
});

// Store memory
app.post('/api/memory', (req, res) => {
  const { type, data } = req.body;
  
  if (!type || !data) {
    return res.status(400).json({ error: 'Type and data are required' });
  }

  const stmt = db.prepare('INSERT INTO memories (type, data) VALUES (?, ?)');
  stmt.run(type, JSON.stringify(data), function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to store memory' });
    }
    res.json({ id: this.lastID });
  });
});

// Search memories
app.get('/api/memory/search', (req, res) => {
  const { query, type } = req.query;
  
  let sql = 'SELECT * FROM memories WHERE 1=1';
  const params = [];

  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }

  if (query) {
    sql += ' AND data LIKE ?';
    params.push(`%${query}%`);
  }

  sql += ' ORDER BY timestamp DESC LIMIT 100';

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to search memories' });
    }
    res.json({ memories: rows });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Initialize security monitoring
  initSecurityMonitor();
});

// Periodic system stats logging (every 30 seconds)
setInterval(async () => {
  try {
    const stats = {
      cpu: await si.currentLoad(),
      memory: await si.mem(),
      time: new Date().toISOString()
    };

    const stmt = db.prepare('INSERT INTO memories (type, data) VALUES (?, ?)');
    stmt.run('system_stats', JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to log system stats:', error);
  }
}, 30000);
