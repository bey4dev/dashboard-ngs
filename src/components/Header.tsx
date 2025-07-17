import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Database, Calendar, LogOut, ChevronDown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: Date | null;
}

const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading, lastUpdated }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Belum pernah dimuat';
    
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Database className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
            Dashboard NogoGini Store
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Monitoring Hutang Piutang & Rekap Penjualan
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Update terakhir: {formatLastUpdated(lastUpdated)}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {/* User Dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                    {user.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`
                inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900'
                }
                transition-colors duration-200
              `}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Memuat...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
