// components/Layout.js
import { useState, useEffect } from 'react';
import { Menu, X, Download, Shield, Wifi, WifiOff, Bell } from 'lucide-react';

const Layout = ({ children, activeSection, onSectionChange, leagues, selectedLeague, onLeagueChange, onDownloadPDF, liveMatchCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add notification for live matches
  useEffect(() => {
    if (liveMatchCount > 0) {
      const notification = {
        id: 'live-matches',
        type: 'live',
        message: `${liveMatchCount} match${liveMatchCount > 1 ? 'es' : ''} live now!`,
        persistent: true
      };
      
      setNotifications(prev => {
        const filtered = prev.filter(n => n.id !== 'live-matches');
        return [...filtered, notification];
      });
    } else {
      setNotifications(prev => prev.filter(n => n.id !== 'live-matches'));
    }
  }, [liveMatchCount]);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', alwaysShow: true },
    { id: 'schedule', label: 'Schedule', icon: '📅', requiresLeague: true },
    { id: 'table', label: 'League Table', icon: '📊', requiresLeague: true },
    { id: 'teams', label: 'Teams', icon: '👥', requiresLeague: true },
    { id: 'statistics', label: 'Statistics', icon: '📈', requiresLeague: true }
  ];

  const handleSectionChange = (section) => {
    onSectionChange(section);
    setIsMobileMenuOpen(false);
  };

  const selectedLeagueData = leagues.find(l => l._id === selectedLeague);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900">
      
      {/* Header */}
      <header className="bg-slate-800 shadow-2xl border-b-2 border-blue-500 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo and League Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg p-1 flex items-center justify-center shadow-lg">
                  {selectedLeagueData?.logo ? (
                    <img 
                      src={selectedLeagueData.logo} 
                      alt={selectedLeagueData.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img 
                      src="/logo-icon.png" 
                      alt="The Horse Futsal League"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                
                {/* Title */}
                <div className="hidden md:block">
                  <img 
                    src="/logo.png" 
                    alt="The Horse Futsal League"
                    className="h-8 max-w-xs object-contain"
                  />
                </div>
              </div>

              {/* League Selector */}
              <div className="hidden md:block">
                <select
                  value={selectedLeague || ''}
                  onChange={(e) => onLeagueChange(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none min-w-48"
                >
                  <option value="">Select a League</option>
                  {leagues.map(league => (
                    <option key={league._id} value={league._id}>
                      {league.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Side - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isOnline ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'
              }`}>
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>

              {/* Live Indicator */}
              {liveMatchCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                  <span className="text-white text-sm font-bold">
                    {liveMatchCount} LIVE
                  </span>
                </div>
              )}

              {/* Download Button */}
              {selectedLeague && onDownloadPDF && (
                <button
                  onClick={onDownloadPDF}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden lg:inline">Download</span>
                </button>
              )}

              {/* Admin Link */}
              <a
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden lg:inline">Admin</span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile League Selector */}
          <div className="md:hidden pb-4">
            <select
              value={selectedLeague || ''}
              onChange={(e) => onLeagueChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select a League</option>
              {leagues.map(league => (
                <option key={league._id} value={league._id}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed top-0 right-0 w-64 h-full bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              
              {/* Close Button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-2">
                {navigationItems.map(item => {
                  const shouldShow = item.alwaysShow || (item.requiresLeague && selectedLeague);
                  
                  if (!shouldShow) return null;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSectionChange(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Actions */}
              <div className="mt-8 space-y-3">
                
                {/* Connection Status */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isOnline ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'
                }`}>
                  {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  <span>{isOnline ? 'Online' : 'Offline'}</span>
                </div>

                {/* Live Indicator */}
                {liveMatchCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-500 rounded-lg animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <span className="text-white font-bold">
                      {liveMatchCount} LIVE MATCH{liveMatchCount > 1 ? 'ES' : ''}
                    </span>
                  </div>
                )}

                {/* Download Button */}
                {selectedLeague && onDownloadPDF && (
                  <button
                    onClick={() => {
                      onDownloadPDF();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download Schedule
                  </button>
                )}

                {/* Admin Link */}
                <a
                  href="/admin"
                  className="w-full flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-4">
            {navigationItems.map(item => {
              const shouldShow = item.alwaysShow || (item.requiresLeague && selectedLeague);
              
              if (!shouldShow) return null;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-blue-600 text-white shadow-lg transform -translate-y-0.5'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:transform hover:-translate-y-0.5'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 md:top-32 right-4 z-30 space-y-2">
          {notifications.map(notification => (
            <NotificationCard 
              key={notification.id}
              notification={notification}
              onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="/logo-icon.png" 
                alt="League Logo"
                className="w-8 h-8"
              />
              <div className="text-slate-400 text-sm">
                © 2024 The Horse Futsal League. Live scores and statistics.
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-slate-400 text-sm">
              <span>🌊 Maldives</span>
              <span>⚽ Futsal</span>
              <span>🐎 Horse League</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Notification Component
const NotificationCard = ({ notification, onDismiss }) => {
  useEffect(() => {
    if (!notification.persistent) {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.persistent, onDismiss]);

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'live':
        return 'bg-red-500 border-red-400';
      case 'success':
        return 'bg-green-500 border-green-400';
      case 'warning':
        return 'bg-yellow-500 border-yellow-400';
      case 'info':
        return 'bg-blue-500 border-blue-400';
      default:
        return 'bg-slate-600 border-slate-500';
    }
  };

  return (
    <div className={`${getNotificationStyle(notification.type)} border-l-4 rounded-lg p-4 shadow-lg max-w-sm animate-slide-in`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {notification.type === 'live' && (
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          )}
          <span className="text-white font-medium">{notification.message}</span>
        </div>
        
        {!notification.persistent && (
          <button
            onClick={() => onDismiss(notification.id)}
            className="text-white hover:text-gray-200 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Layout;