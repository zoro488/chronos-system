/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS SYSTEM - MAIN ENTRY POINT                      ║
 * ║  Punto de entrada principal de la aplicación React                       ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Suppress browser extension errors that may appear in console
if (typeof window !== 'undefined') {
  // Prevent Chrome extension errors from appearing in console
  const originalError = console.error;
  console.error = (...args: any[]) => {
    // Filter out common browser extension errors
    const errorStr = args.join(' ');
    if (
      errorStr.includes('onMessage listener') ||
      errorStr.includes('Extension context invalidated') ||
      errorStr.includes('chrome.runtime')
    ) {
      return; // Suppress these errors
    }
    originalError.apply(console, args);
  };

  // Suppress Firefox Components deprecation warning
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const warnStr = args.join(' ');
    if (warnStr.includes('Components') && warnStr.includes('obsoleto')) {
      return; // Suppress this warning
    }
    originalWarn.apply(console, args);
  };
}

// Render the application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
