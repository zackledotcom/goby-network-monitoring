import React, { useState, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load the dashboard components
const NetworkDashboard = React.lazy(() => import('./components/NetworkDashboard'));
const SecurityDashboard = React.lazy(() => import('./components/SecurityDashboard'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="loading-spinner mx-auto mb-4"></div>
      <p className="text-gray-600">Loading dashboard...</p>
    </div>
  </div>
);

const App = () => {
  const [currentView, setCurrentView] = useState('network');

  const navigationItems = [
    { 
      id: 'network', 
      label: 'Network Monitor', 
      icon: 'fa-network-wired',
      description: 'Monitor network devices and traffic'
    },
    { 
      id: 'security', 
      label: 'Security Monitor', 
      icon: 'fa-shield-halved',
      description: 'Track security events and threats'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <i className="fas fa-network-wired text-blue-600 text-2xl"></i>
                <span className="font-bold text-xl text-gray-800">
                  Goby Network Monitor
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label={item.description}
                  title={item.description}
                >
                  <i className={`fas ${item.icon} ${currentView === item.id ? 'mr-2' : 'mr-2'}`}></i>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
              
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              
              <a
                href="https://github.com/zackledotcom/goby"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
                aria-label="View source on GitHub"
                title="View source on GitHub"
              >
                <i className="fab fa-github text-xl"></i>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            {currentView === 'network' ? (
              <NetworkDashboard />
            ) : (
              <SecurityDashboard />
            )}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <i className="fas fa-shield-alt text-blue-600"></i>
              <p className="text-gray-500 text-sm">
                Goby Network Monitor - A powerful network monitoring and security analysis tool
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <i className="fas fa-code-branch text-gray-400"></i>
                <span className="text-sm text-gray-400">v1.0.0</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-1"
                >
                  <i className="fas fa-book"></i>
                  <span>Docs</span>
                </a>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-1"
                >
                  <i className="fas fa-question-circle"></i>
                  <span>Support</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
