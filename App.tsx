/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS SYSTEM - MAIN APP                              ║
 * ║  Aplicación principal con autenticación, routing y providers             ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// Auth components
import { AuthProvider, LoginScreen, ProtectedRoute, SplashScreen } from './components/auth';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import AppRoutes from './pages/AppRoutes';

// ============================================================================
// REACT QUERY CONFIG
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicialización de la aplicación
  useEffect(() => {
    // Simular inicialización de servicios
    const initializeApp = async () => {
      try {
        // Aquí puedes cargar configuraciones iniciales, verificar conexión, etc.
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsInitialized(true);
      } catch (error) {
        console.error('Error inicializando app:', error);
        setIsInitialized(true); // Continuar de todos modos
      }
    };

    initializeApp();
  }, []);

  // Mostrar splash hasta que la app esté inicializada
  if (showSplash && !isInitialized) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {showSplash ? (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        ) : (
          <AuthProvider>
            <Routes>
              {/* Ruta pública: Login */}
              <Route path="/login" element={<LoginScreen />} />

              {/* Rutas protegidas con autenticación */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AppRoutes />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Redirect raíz a dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Ruta 404 */}
              <Route
                path="*"
                element={
                  <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-950">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                      <p className="text-gray-400 mb-8">Página no encontrada</p>
                      <a
                        href="/dashboard"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:shadow-lg transition-all"
                      >
                        Volver al Dashboard
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(15, 23, 42, 0.95)',
                  color: '#fff',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProvider>
        )}
      </BrowserRouter>

      {/* React Query Devtools (solo en desarrollo) */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
