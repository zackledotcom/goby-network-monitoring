import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DiskUsage = () => {
  const [diskData, setDiskData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDisk, setSelectedDisk] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDiskUsage = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/system/disk');
      setDiskData(response.data.diskUsage);
      setError(null);
      
      // Set first disk as selected if none is selected
      if (!selectedDisk && response.data.diskUsage.length > 0) {
        setSelectedDisk(response.data.diskUsage[0]);
      }
    } catch (err) {
      setError('Failed to fetch disk usage: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiskUsage();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchDiskUsage, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    if (usage >= 90) return 'bg-red-600';
    if (usage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          <i className="fas fa-hdd mr-2"></i>
          Disk Usage
        </h2>
        <button
          onClick={fetchDiskInfo}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {diskInfo.map((disk, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {disk.fs || 'Volume'} ({disk.mount})
              </h3>
              <span className={`px-2 py-1 rounded-full text-sm ${
                disk.use >= 90 ? 'bg-red-100 text-red-800' :
                disk.use >= 70 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {disk.use}% Used
              </span>
            </div>

            {/* Usage Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className={`${getUsageColor(disk.use)} h-4 rounded-full transition-all duration-500`}
                style={{ width: `${disk.use}%` }}
              ></div>
            </div>

            {/* Disk Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Size</p>
                <p className="font-medium">{formatSize(disk.size)}</p>
              </div>
              <div>
                <p className="text-gray-600">Used Space</p>
                <p className="font-medium">{formatSize(disk.used)}</p>
              </div>
              <div>
                <p className="text-gray-600">Available Space</p>
                <p className="font-medium">{formatSize(disk.available)}</p>
              </div>
              <div>
                <p className="text-gray-600">Type</p>
                <p className="font-medium">{disk.type || 'Unknown'}</p>
              </div>
            </div>

            {/* Warning Messages */}
            {disk.use >= 90 && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Critical: Disk space is running very low!
              </div>
            )}
            {disk.use >= 70 && disk.use < 90 && (
              <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg">
                <i className="fas fa-exclamation-circle mr-2"></i>
                Warning: Disk space is getting low.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Storage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-medium text-blue-800 mb-2">
          <i className="fas fa-lightbulb mr-2"></i>
          Storage Tips
        </h4>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li>Consider cleaning temporary files to free up space</li>
          <li>Check for large, unused applications</li>
          <li>Move media files to external storage when space is low</li>
          <li>Regular maintenance can prevent storage issues</li>
        </ul>
      </div>
    </div>
  );
};

export default DiskUsage;
