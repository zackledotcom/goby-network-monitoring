import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DeviceScanner = () => {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [portScanResults, setPortScanResults] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  const scanNetwork = async () => {
    try {
      setScanning(true);
      setError(null);
      const response = await axios.get('/api/network/scan');
      
      // Analyze and assign threat levels
      const analyzedDevices = response.data.devices.map(device => ({
        ...device,
        threatLevel: analyzeThreatLevel(device),
        lastSeen: new Date().toISOString()
      }));
      
      setDevices(analyzedDevices);
      
      // Update scan history
      setScanHistory(prev => [
        {
          timestamp: new Date().toISOString(),
          deviceCount: analyzedDevices.length,
          threatCount: analyzedDevices.filter(d => d.threatLevel === 'high').length
        },
        ...prev.slice(0, 9) // Keep last 10 scans
      ]);
      
      // Store scan results in memory
      await axios.post('/api/memory', {
        type: 'network_scan',
        data: analyzedDevices
      });
    } catch (err) {
      setError('Failed to scan network: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  const analyzeThreatLevel = (device) => {
    let level = 'low';
    
    // Known IoT devices (example patterns)
    const iotPatterns = ['nest', 'ring', 'alexa', 'echo'];
    const suspiciousPatterns = ['unknown', 'unidentified'];
    
    if (device.name) {
      const nameLower = device.name.toLowerCase();
      if (iotPatterns.some(pattern => nameLower.includes(pattern))) {
        level = 'medium'; // IoT devices might need monitoring
      } else if (suspiciousPatterns.some(pattern => nameLower.includes(pattern))) {
        level = 'high';
      }
    } else {
      level = 'medium'; // Unknown devices are medium threat by default
    }
    
    return level;
  };

  const scanPorts = async (ip) => {
    try {
      setSelectedDevice({ ...selectedDevice, scanning: true });
      const response = await axios.get(`/api/network/ports/${ip}`);
      setPortScanResults(response.data.ports);
    } catch (err) {
      setError('Failed to scan ports: ' + err.message);
    } finally {
      setSelectedDevice({ ...selectedDevice, scanning: false });
    }
  };

  const getThreatColor = (level) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 border-red-500 text-red-700';
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      default:
        return 'bg-green-100 border-green-500 text-green-700';
    }
  };

  const getFilteredDevices = () => {
    if (filterStatus === 'all') return devices;
    return devices.filter(device => device.threatLevel === filterStatus);
  };

  useEffect(() => {
    scanNetwork();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3">
              <i className="fas fa-laptop text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Devices</p>
              <p className="text-2xl font-semibold text-gray-900">{devices.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-3">
              <i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Medium Risk</p>
              <p className="text-2xl font-semibold text-gray-900">
                {devices.filter(d => d.threatLevel === 'medium').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-full p-3">
              <i className="fas fa-shield-alt text-red-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Risk</p>
              <p className="text-2xl font-semibold text-gray-900">
                {devices.filter(d => d.threatLevel === 'high').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={scanNetwork}
              disabled={scanning}
              className={`inline-flex items-center px-4 py-2 rounded-lg ${
                scanning
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } transition-colors duration-200`}
            >
              {scanning ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <i className="fas fa-sync-alt mr-2"></i>
                  Scan Network
                </>
              )}
            </button>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select rounded-lg border-gray-300 text-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Devices</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>

          {scanHistory.length > 0 && (
            <div className="text-sm text-gray-500">
              Last scan: {new Date(scanHistory[0].timestamp).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getFilteredDevices().map((device, index) => (
          <div
            key={index}
            onClick={() => setSelectedDevice(device)}
            className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedDevice?.ip === device.ip ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getThreatColor(device.threatLevel)}`}>
                {device.threatLevel.toUpperCase()}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scanPorts(device.ip);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Scan Ports"
              >
                <i className="fas fa-search"></i>
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <i className="fas fa-network-wired text-gray-400"></i>
                <span className="font-medium text-gray-900">{device.ip}</span>
              </div>
              
              {device.mac && (
                <div className="flex items-center space-x-2">
                  <i className="fas fa-microchip text-gray-400"></i>
                  <span className="text-gray-600">{device.mac}</span>
                </div>
              )}
              
              {device.name && (
                <div className="flex items-center space-x-2">
                  <i className="fas fa-tag text-gray-400"></i>
                  <span className="text-gray-600">{device.name}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <i className="fas fa-clock text-gray-400"></i>
                <span className="text-sm text-gray-500">
                  Last seen: {new Date(device.lastSeen).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Port Scan Results Modal */}
      {selectedDevice && portScanResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full modal-enter">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Port Scan Results: {selectedDevice.ip}
                </h3>
                <button
                  onClick={() => {
                    setSelectedDevice(null);
                    setPortScanResults(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-4">
                  {portScanResults.map((port, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b last:border-b-0"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          port.state === 'open' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium">Port {port.number}</span>
                        <span className="text-gray-500">{port.service}</span>
                      </div>
                      <span className={`text-sm ${
                        port.state === 'open' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {port.state}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceScanner;
