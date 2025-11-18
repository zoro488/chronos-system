import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component } from 'react';

/**
 * Error Boundary Component
 *
 * Captura errores en componentes hijos y muestra UI premium de error.
 * Sigue el patrón de CHRONOS con glassmorphism y animaciones.
 *
 * @example
 * ```jsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 *
 * @example Con fallback personalizado
 * ```jsx
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <ComponenteRiesgoso />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Actualiza el estado cuando hay un error
   */
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log del error para monitoreo (Sentry, etc.)
   */
  componentDidCatch(error, errorInfo) {
    console.error('🔴 Error capturado por ErrorBoundary:', error);
    console.error('📍 Stack trace:', errorInfo);

    // TODO: Enviar a Sentry o servicio de logging
    // Sentry.captureException(error, { extra: errorInfo });

    this.setState({
      errorInfo,
    });
  }

  /**
   * Resetea el error y recarga el componente
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Si hay un fallback personalizado, úsalo
      if (fallback) {
        return fallback;
      }

      // UI premium de error por defecto
      return (
        <div className="min-h-screen bg-chronos-dark flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl w-full"
          >
            {/* Card con glassmorphism */}
            <div className="relative overflow-hidden rounded-2xl border border-neon-red/30 bg-chronos-dark/80 backdrop-blur-xl shadow-2xl shadow-neon-red/20 p-8">
              {/* Gradiente de fondo */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-red/5 via-transparent to-neon-blue/5 pointer-events-none" />

              {/* Contenido */}
              <div className="relative z-10">
                {/* Icono y título */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-neon-red/20 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-neon-red" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      ¡Algo salió mal!
                    </h1>
                    <p className="text-gray-400 text-lg">
                      La aplicación encontró un error inesperado
                    </p>
                  </div>
                </div>

                {/* Mensaje de error */}
                <div className="mb-6 p-4 rounded-lg bg-neon-red/10 border border-neon-red/30">
                  <p className="text-neon-red font-mono text-sm">
                    {error?.message || 'Error desconocido'}
                  </p>
                </div>

                {/* Stack trace (solo en desarrollo) */}
                {process.env.NODE_ENV === 'development' && errorInfo && (
                  <details className="mb-6">
                    <summary className="cursor-pointer text-gray-400 hover:text-white transition-colors mb-2">
                      Ver detalles técnicos
                    </summary>
                    <div className="p-4 rounded-lg bg-black/50 border border-gray-700 overflow-auto max-h-64">
                      <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  </details>
                )}

                {/* Acciones */}
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={this.handleReset}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/30 hover:border-neon-cyan transition-all duration-300 font-semibold"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Reintentar
                  </button>

                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-chronos-dark/50 border border-gray-600 text-gray-300 hover:bg-chronos-dark hover:border-gray-500 transition-all duration-300"
                  >
                    Volver al inicio
                  </button>
                </div>

                {/* Información adicional */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-gray-500 text-sm">
                    Si el problema persiste, por favor contacta al soporte técnico.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
