import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MemorySearch = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedMemory, setSelectedMemory] = useState(null);

  const memoryTypes = [
    { id: 'all', label: 'All Memories' },
    { id: 'network_scan', label: 'Network Scans' },
    { id: 'system_stats', label: 'System Stats' },
    { id: 'wifi_analysis', label: 'WiFi Analysis' }
  ];

  const searchMemories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedType !== 'all') params.append('type', selectedType);
      
      const response = await axios.get(`/api/memory/search?${params}`);
      setMemories(response.data.memories);
    } catch (err) {
      setError('Failed to search memories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchMemories();
  }, [selectedType]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getMemoryIcon = (type) => {
    switch (type) {
      case 'network_scan':
        return 'fas fa-network-wired';
      case 'system_stats':
        return 'fas fa-microchip';
      case 'wifi_analysis':
        return 'fas fa-wifi';
      default:
        return 'fas fa-memory';
    }
  };

  const getMemoryColor = (type) => {
    switch (type) {
      case 'network_scan':
        return 'text-blue-600';
      case 'system_stats':
        return 'text-green-600';
      case 'wifi_analysis':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderMemoryContent = (memory) => {
    try {
      const data = JSON.parse(memory.data);
      return (
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex">
              <span className="font-medium w-1/3">{key}:</span>
              <span className="w-2/3">
                {typeof value === 'object' 
                  ? JSON.stringify(value, null, 2)
                  : value.toString()}
              </span>
            </div>
          ))}
        </div>
      );
    } catch (err) {
      return <p className="text-red-500">Error parsing memory data</p>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          <i className="fas fa-memory mr-2"></i>
          Memory Search
        </h2>
      </div>

      {/* Search Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {memoryTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={searchMemories}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-search mr-2"></i>
            Search
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Results */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : memories.length > 0 ? (
          <div className="divide-y">
            {memories.map((memory) => (
              <div
                key={memory.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedMemory(memory)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className={`${getMemoryIcon(memory.type)} ${getMemoryColor(memory.type)} text-xl`}></i>
                    <div>
                      <p className="font-medium text-gray-800">
                        {memory.type.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(memory.timestamp)}
                      </p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <i className="fas fa-folder-open text-4xl mb-2"></i>
            <p>No memories found</p>
          </div>
        )}
      </div>

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  <i className={`${getMemoryIcon(selectedMemory.type)} ${getMemoryColor(selectedMemory.type)} mr-2`}></i>
                  {selectedMemory.type.replace('_', ' ').toUpperCase()}
                </h3>
                <button
                  onClick={() => setSelectedMemory(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                Recorded on {formatDate(selectedMemory.timestamp)}
              </p>

              <div className="bg-gray-50 rounded-lg p-4">
                {renderMemoryContent(selectedMemory)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemorySearch;
