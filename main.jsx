/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS SYSTEM - MAIN ENTRY POINT                      ║
 * ║  Punto de entrada principal de la aplicación                             ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Crear root y renderizar app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
