import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSystemInfo = async () => {
    try {
      const response = await axios.get('/api/system/info');
      setSystemInfo(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch system information: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchSystemInfo, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return parts.join(' ') || '< 1m';
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageBackground = (percentage) => {
    if (percentage >= 90) return 'bg-red-100';
    if (percentage >= 70) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Auto-refresh Control */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">System Information</h2>
        <div className="flex items-center space-x-4">
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="form-select rounded-lg border-gray-300 text-sm"
          >
            <option value={5000}>Refresh: 5s</option>
            <option value={10000}>Refresh: 10s</option>
            <option value={30000}>Refresh: 30s</option>
          </select>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              autoRefresh ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
            title={autoRefresh ? 'Pause Auto-refresh' : 'Enable Auto-refresh'}
          >
            <i className={`fas ${autoRefresh ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Uptime Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3">
              <i className="fas fa-clock text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatUptime(systemInfo.uptime)}
              </p>
            </div>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3">
              <i className="fas fa-microchip text-purple-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-2xl font-semibold text-gray-900">
                {systemInfo.cpu.load.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3">
              <i className="fas fa-memory text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-semibold text-gray-900">
                {((systemInfo.memory.used / systemInfo.memory.total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* OS Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-full p-3">
              <i className="fas fa-desktop text-indigo-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Operating System</p>
              <p className="text-lg font-semibold text-gray-900 truncate">
                {systemInfo.os.platform}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">CPU Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Model</span>
              <span className="font-medium text-gray-900">{systemInfo.cpu.model}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cores</span>
              <span className="font-medium text-gray-900">{systemInfo.cpu.cores}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Speed</span>
              <span className="font-medium text-gray-900">{systemInfo.cpu.speed} GHz</span>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Load</span>
                <span className={`font-medium ${getUsageColor(systemInfo.cpu.load)}`}>
                  {systemInfo.cpu.load.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getUsageBackground(systemInfo.cpu.load)}`}
                  style={{ width: `${systemInfo.cpu.load}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Memory Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Memory Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Memory</span>
              <span className="font-medium text-gray-900">
                {formatBytes(systemInfo.memory.total)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Used Memory</span>
              <span className="font-medium text-gray-900">
                {formatBytes(systemInfo.memory.used)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Free Memory</span>
              <span className="font-medium text-gray-900">
                {formatBytes(systemInfo.memory.free)}
              </span>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Usage</span>
                <span className={`font-medium ${
                  getUsageColor((systemInfo.memory.used / systemInfo.memory.total) * 100)
                }`}>
                  {((systemInfo.memory.used / systemInfo.memory.total) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    getUsageBackground((systemInfo.memory.used / systemInfo.memory.total) * 100)
                  }`}
                  style={{
                    width: `${(systemInfo.memory.used / systemInfo.memory.total) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;
