/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS SYSTEM - MAIN ENTRY POINT                       ║
 * ║                React 18 + Vite + TypeScript                                ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import './index.css';

// ============================================================================
// ERROR BOUNDARY FOR TOP LEVEL
// ============================================================================
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CHRONOS System Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            padding: '2rem',
          }}
        >
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️ Error</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
            Algo salió mal al cargar CHRONOS System
          </p>
          <pre
            style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '1rem',
              borderRadius: '8px',
              maxWidth: '600px',
              overflow: 'auto',
            }}
          >
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 2rem',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// RENDER APP
// ============================================================================

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Check your index.html file.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
