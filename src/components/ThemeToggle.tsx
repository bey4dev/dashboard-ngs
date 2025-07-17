import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    console.log('Theme toggle clicked, current theme:', theme);
    console.log('Document classes before toggle:', document.documentElement.className);
    toggleTheme();
    // Check after a small delay to see the effect
    setTimeout(() => {
      console.log('Document classes after toggle:', document.documentElement.className);
    }, 100);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Debug indicator */}
      <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
        {theme}
      </span>
      
      <button
        onClick={handleToggle}
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-300 dark:border-gray-600"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <SunIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;
