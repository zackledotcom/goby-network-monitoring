import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WifiAnalyzer = () => {
  const [wifiInfo, setWifiInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchWifiInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/network/wifi');
      setWifiInfo(response.data.wifi);
      
      // Add to history
      setHistory(prev => {
        const newHistory = [...prev, {
          ...response.data.wifi,
          timestamp: new Date()
        }].slice(-20); // Keep last 20 readings
        return newHistory;
      });

      // Store in memory
      await axios.post('/api/memory', {
        type: 'wifi_analysis',
        data: response.data.wifi
      });
    } catch (err) {
      setError('Failed to fetch WiFi information: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWifiInfo();
    const interval = setInterval(fetchWifiInfo, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getSignalStrengthIndicator = (strength) => {
    // Assuming strength is in dBm
    if (strength >= -50) return { icon: 'fas fa-wifi', color: 'text-green-500', label: 'Excellent' };
    if (strength >= -60) return { icon: 'fas fa-wifi', color: 'text-green-400', label: 'Good' };
    if (strength >= -70) return { icon: 'fas fa-wifi', color: 'text-yellow-500', label: 'Fair' };
    return { icon: 'fas fa-wifi', color: 'text-red-500', label: 'Poor' };
  };

  const getSpeedQuality = (speed) => {
    if (speed >= 100) return { color: 'text-green-500', label: 'Excellent' };
    if (speed >= 50) return { color: 'text-green-400', label: 'Good' };
    if (speed >= 25) return { color: 'text-yellow-500', label: 'Fair' };
    return { color: 'text-red-500', label: 'Poor' };
  };

  if (loading && !wifiInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !wifiInfo) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          <i className="fas fa-wifi mr-2"></i>
          WiFi Analysis
        </h2>
        <button
          onClick={fetchWifiInfo}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Refresh
        </button>
      </div>

      {/* Current Status */}
      {wifiInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Signal Strength Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Signal Strength</h3>
            <div className="flex items-center justify-center space-x-4">
              <i className={`${getSignalStrengthIndicator(wifiInfo.signalStrength).icon} text-4xl ${getSignalStrengthIndicator(wifiInfo.signalStrength).color}`}></i>
              <div>
                <p className="text-2xl font-bold">{wifiInfo.signalStrength} dBm</p>
                <p className={`${getSignalStrengthIndicator(wifiInfo.signalStrength).color}`}>
                  {getSignalStrengthIndicator(wifiInfo.signalStrength).label}
                </p>
              </div>
            </div>
          </div>

          {/* Connection Speed Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Connection Speed</h3>
            <div className="text-center">
              <p className="text-3xl font-bold mb-2">{wifiInfo.speed} Mbps</p>
              <p className={`${getSpeedQuality(wifiInfo.speed).color}`}>
                {getSpeedQuality(wifiInfo.speed).label}
              </p>
            </div>
          </div>

          {/* Network Details Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Network Details</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Interface:</span> {wifiInfo.interface}</p>
              <p><span className="font-medium">Channel:</span> {wifiInfo.channel}</p>
              <p><span className="font-medium">Frequency:</span> {wifiInfo.frequency} GHz</p>
              <p><span className="font-medium">State:</span> {wifiInfo.state}</p>
            </div>
          </div>
        </div>
      )}

      {/* Signal History Graph */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Signal History</h3>
        <div className="h-64">
          {history.length > 0 ? (
            <div className="relative h-full">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-600">
                <span>-30 dBm</span>
                <span>-50 dBm</span>
                <span>-70 dBm</span>
                <span>-90 dBm</span>
              </div>
              
              {/* Graph */}
              <div className="ml-12 h-full flex items-end">
                {history.map((reading, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col justify-end group relative"
                  >
                    <div
                      className={`w-full ${getSignalStrengthIndicator(reading.signalStrength).color}`}
                      style={{
                        height: `${((reading.signalStrength + 90) / 60) * 100}%`,
                        minHeight: '1px'
                      }}
                    >
                      {/* Tooltip */}
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 mb-1">
                        {reading.signalStrength} dBm
                        <br />
                        {new Date(reading.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Collecting signal history...
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">
          <i className="fas fa-lightbulb mr-2"></i>
          WiFi Optimization Tips
        </h4>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          {wifiInfo && wifiInfo.signalStrength < -70 && (
            <li>Signal strength is weak. Consider moving closer to the router or checking for interference.</li>
          )}
          {wifiInfo && wifiInfo.speed < 50 && (
            <li>Connection speed is below optimal. Try changing WiFi channels or updating router firmware.</li>
          )}
          <li>Keep router away from metal objects and electronic devices</li>
          <li>Regularly update router firmware for best performance</li>
          <li>Consider using 5GHz band for less interference</li>
        </ul>
      </div>
    </div>
  );
};

export default WifiAnalyzer;
