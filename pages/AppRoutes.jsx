/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                         CHRONOS APP ROUTES                                 ║
 * ║                Sistema de Rutas con React Router v6                        ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Configuración completa de rutas:
 * - React Router v6
 * - Protected routes con Auth
 * - Lazy loading de páginas
 * - Layout wrapper con sidebar
 * - Navigation system
 *
 * @module AppRoutes
 * @author CHRONOS System
 * @version 1.0.0
 */
import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Spinner } from '../components/animations/AnimationSystem';
import { PageLayout } from '../components/layout/LayoutComponents';

// ============================================================================
// LAZY LOADED PAGES
// ============================================================================

const MasterDashboard = lazy(() => import('./MasterDashboard'));

// Placeholder pages (to be created)
const VentasPage = lazy(() => import('./VentasPage'));
const ComprasPage = lazy(() => import('./ComprasPage'));
const InventarioPage = lazy(() => import('./InventarioPage'));
const ClientesPage = lazy(() => import('./ClientesPage'));
const BancosPage = lazy(() => import('./BancosPage'));
const ReportesPage = lazy(() => import('./ReportesPage'));
const ConfiguracionPage = lazy(() => import('./ConfiguracionPage'));

// ============================================================================
// LOADING FALLBACK
// ============================================================================

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-4 text-white/60">Cargando...</p>
    </div>
  </div>
);

// ============================================================================
// PROTECTED ROUTE
// ============================================================================

const ProtectedRoute = ({ children }) => {
  // TODO: Add real authentication check
  const isAuthenticated = true; // Placeholder

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ============================================================================
// APP ROUTES
// ============================================================================

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPlaceholder />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MasterDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ventas"
            element={
              <ProtectedRoute>
                <VentasPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/compras"
            element={
              <ProtectedRoute>
                <ComprasPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventario"
            element={
              <ProtectedRoute>
                <InventarioPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <ClientesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bancos"
            element={
              <ProtectedRoute>
                <BancosPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reportes"
            element={
              <ProtectedRoute>
                <ReportesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/configuracion"
            element={
              <ProtectedRoute>
                <ConfiguracionPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

// ============================================================================
// PLACEHOLDER PAGES
// ============================================================================

const LoginPlaceholder = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
    <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
      <h1 className="text-3xl font-bold text-white mb-4">CHRONOS Login</h1>
      <p className="text-white/60">Authentication page (to be implemented)</p>
    </div>
  </div>
);

const NotFoundPage = () => (
  <PageLayout>
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
      <p className="text-xl text-white/60 mb-8">Página no encontrada</p>
      <a
        href="/"
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity"
      >
        Volver al Dashboard
      </a>
    </div>
  </PageLayout>
);

export default AppRoutes;
