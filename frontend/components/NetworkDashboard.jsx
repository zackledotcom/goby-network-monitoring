import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SystemInfo from './SystemInfo';
import DiskUsage from './DiskUsage';
import DeviceScanner from './DeviceScanner';
import WifiAnalyzer from './WifiAnalyzer';
import MemorySearch from './MemorySearch';

const NetworkDashboard = () => {
  const [activeTab, setActiveTab] = useState('devices');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabs = [
    { 
      id: 'devices', 
      label: 'Network Devices', 
      icon: 'fas fa-network-wired',
      description: 'View and manage connected devices'
    },
    { 
      id: 'system', 
      label: 'System Info', 
      icon: 'fas fa-microchip',
      description: 'Monitor system performance'
    },
    { 
      id: 'disk', 
      label: 'Disk Usage', 
      icon: 'fas fa-hdd',
      description: 'Track storage utilization'
    },
    { 
      id: 'wifi', 
      label: 'WiFi Analysis', 
      icon: 'fas fa-wifi',
      description: 'Analyze wireless networks'
    },
    { 
      id: 'memory', 
      label: 'Memory Analysis', 
      icon: 'fas fa-memory',
      description: 'Monitor memory usage'
    }
  ];

  // Error handler for API calls
  const handleError = (error) => {
    console.error('Dashboard error:', error);
    setError(
      error.response?.data?.message || 
      error.message || 
      'An unexpected error occurred'
    );
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero Section with Network Status Overview */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="text-4xl font-bold text-white mb-4">
                  Network Monitoring Dashboard
                </h1>
                <p className="text-blue-100 text-lg mb-6">
                  Monitor your network, analyze system performance, and track device security
                </p>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setActiveTab('devices')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <i className="fas fa-search mr-2"></i>
                    Scan Network
                  </button>
                  <button 
                    onClick={() => setActiveTab('system')}
                    className="inline-flex items-center px-4 py-2 border border-white rounded-md shadow-sm text-sm font-medium text-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
                  >
                    <i className="fas fa-chart-line mr-2"></i>
                    View Analytics
                  </button>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-400 bg-opacity-20 rounded-full p-3">
                        <i className="fas fa-wifi text-green-400 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-white text-sm">Network Status</p>
                        <p className="text-green-400 font-semibold">Online</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-400 bg-opacity-20 rounded-full p-3">
                        <i className="fas fa-desktop text-blue-400 text-xl"></i>
                      </div>
                      <div>
                        <p className="text-white text-sm">Active Devices</p>
                        <p className="text-blue-400 font-semibold">Loading...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <div className="px-6 flex space-x-4 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-4 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                title={tab.description}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="m-6">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <i className="fas fa-exclamation-circle text-red-400"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setError(null)}
                      className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <span className="sr-only">Dismiss</span>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'devices' && <DeviceScanner />}
          {activeTab === 'system' && <SystemInfo />}
          {activeTab === 'disk' && <DiskUsage />}
          {activeTab === 'wifi' && <WifiAnalyzer />}
          {activeTab === 'memory' && <MemorySearch />}
        </div>
      </div>
    </div>
  );
};

export default NetworkDashboard;
