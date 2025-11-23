'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  // Prevent hydration mismatch by not rendering until client-side
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative inline-flex h-8 w-14 md:h-9 md:w-16 items-center rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse">
        <span className="h-6 w-6 md:h-7 md:w-7 transform rounded-full bg-white shadow-lg translate-x-1 flex items-center justify-center">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-400 rounded-full"></div>
        </span>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-8 w-14 md:h-9 md:w-16 items-center rounded-full 
        transition-all duration-300 ease-in-out 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 dark:focus:ring-offset-dark-800
        focus:ring-white dark:focus:ring-gray-300
        hover:scale-105 active:scale-95
        shadow-md hover:shadow-lg
        border border-blue-500/30 dark:border-gray-600/30
        ${isDark ? 'bg-gradient-to-r from-gray-700 to-gray-600' : 'bg-gradient-to-r from-yellow-300 to-orange-300'}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background glow effect */}
      <span
        className={`
          absolute inset-0 rounded-full
          transition-opacity duration-300
          ${isDark ? 'bg-blue-500 opacity-0' : 'bg-yellow-400 opacity-20'}
        `}
      />
      
      {/* Toggle circle */}
      <span
        className={`
          relative h-6 w-6 md:h-7 md:w-7 transform rounded-full 
          bg-white dark:bg-blue-900 shadow-lg 
          transition-all duration-300 ease-in-out
          flex items-center justify-center
          ${isDark ? 'translate-x-7 md:translate-x-9' : 'translate-x-1'}
        `}
      >
        {/* Icon container with smooth transition */}
        <span
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300 ease-in-out
            ${isDark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}
          `}
        >
          <Moon className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-200" />
        </span>
        <span
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300 ease-in-out
            ${isDark ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}
          `}
        >
          <Sun className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
        </span>
      </span>
    </button>
  );
}
