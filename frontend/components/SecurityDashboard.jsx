import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SecurityDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const eventTypes = [
    { id: 'all', label: 'All Events', icon: 'fa-shield-halved' },
    { id: 'file_integrity', label: 'File Integrity', icon: 'fa-file-shield' },
    { id: 'covert_signal', label: 'Covert Signals', icon: 'fa-network-wired' },
    { id: 'memory_anomaly', label: 'Memory Anomalies', icon: 'fa-memory' }
  ];

  const dateRanges = [
    { id: '1h', label: 'Last Hour' },
    { id: '24h', label: 'Last 24 Hours' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' }
  ];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('type', filter);
      params.append('range', dateRange);
      
      const response = await axios.get(`/api/security/events?${params}`);
      setEvents(response.data.events);
    } catch (err) {
      setError('Failed to fetch security events: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    
    // Set up auto-refresh if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchEvents, 30000); // 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [filter, dateRange, autoRefresh]);

  const getEventIcon = (type) => {
    const eventType = eventTypes.find(t => t.id === type) || eventTypes[0];
    return eventType.icon;
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'file_integrity':
        return 'text-yellow-600';
      case 'covert_signal':
        return 'text-red-600';
      case 'memory_anomaly':
        return 'text-purple-600';
      default:
        return 'text-blue-600';
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[severity] || colors.low;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    }).format(date);
  };

  const renderEventDetails = (event) => {
    try {
      const details = JSON.parse(event.details);
      return (
        <div className="space-y-4">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="flex border-b border-gray-100 pb-4 last:border-0">
              <span className="font-medium w-1/3 text-gray-600">{key}:</span>
              <div className="w-2/3">
                {typeof value === 'object' ? (
                  <pre className="bg-gray-50 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <span className="text-gray-900">{value.toString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    } catch (err) {
      return (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">Error parsing event details</p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-6 py-8 sm:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                <i className="fas fa-shield-halved mr-3"></i>
                Security Dashboard
              </h2>
              <p className="mt-2 text-blue-100">
                Monitor and analyze security events in real-time
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 bg-opacity-50 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-white">
                    {autoRefresh ? 'Live Updates' : 'Updates Paused'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 text-white transition-colors duration-200"
                title={autoRefresh ? 'Pause Updates' : 'Enable Live Updates'}
              >
                <i className={`fas ${autoRefresh ? 'fa-pause' : 'fa-play'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-wrap gap-2">
            {eventTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setFilter(type.id)}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                  filter === type.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className={`fas ${type.icon} mr-2`}></i>
                {type.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="form-select rounded-lg border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {dateRanges.map(range => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={fetchEvents}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              title="Refresh Events"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-circle text-red-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner"></div>
          </div>
        ) : events.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`text-2xl ${getEventColor(event.eventType)}`}>
                      <i className={`fas ${getEventIcon(event.eventType)}`}></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {event.description}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(event.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getSeverityBadge(event.severity)
                    }`}>
                      {event.severity}
                    </span>
                    <i className="fas fa-chevron-right text-gray-400"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <i className="fas fa-shield-check text-4xl mb-2"></i>
            <p>No security events found</p>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden modal-enter">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`text-2xl ${getEventColor(selectedEvent.eventType)}`}>
                  <i className={`fas ${getEventIcon(selectedEvent.eventType)}`}></i>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedEvent.description}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedEvent.timestamp)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {renderEventDetails(selectedEvent)}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Handle event action (e.g., mark as resolved)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Mark as Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;
