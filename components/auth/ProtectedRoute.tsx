/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                   PROTECTEDROUTE - CHRONOS SYSTEM                         ║
 * ║  HOC para proteger rutas que requieren autenticación y permisos           ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { motion } from 'framer-motion';
import { AlertCircle, Lock, Shield } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'user';
  requiredPermissions?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermissions = [],
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, userData, loading } = useAuth();
  const location = useLocation();

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {/* Spinner Premium */}
          <div className="relative mx-auto mb-6 h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">
            Verificando autenticación...
          </h3>
          <p className="text-gray-400">
            Por favor espera un momento
          </p>
        </motion.div>
      </div>
    );
  }

  // ============================================================================
  // NOT AUTHENTICATED
  // ============================================================================
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // ============================================================================
  // CHECK ROLE
  // ============================================================================
  if (requiredRole && userData) {
    const roleHierarchy = {
      admin: 3,
      manager: 2,
      user: 1,
    };

    const userRoleLevel = roleHierarchy[userData.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-950">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-md text-center"
          >
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 backdrop-blur-xl">
              <Lock className="h-10 w-10 text-red-400" />
            </div>

            {/* Message */}
            <h1 className="mb-3 text-3xl font-bold text-white">
              Acceso Denegado
            </h1>
            <p className="mb-6 text-gray-400">
              No tienes los permisos necesarios para acceder a esta sección.
            </p>

            {/* Info */}
            <div className="mb-6 rounded-xl bg-white/5 p-4 backdrop-blur-xl border border-white/10">
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Rol requerido:</span>{' '}
                <span className="text-blue-400 uppercase">{requiredRole}</span>
              </p>
              <p className="mt-2 text-sm text-gray-300">
                <span className="font-semibold">Tu rol actual:</span>{' '}
                <span className="text-gray-400 uppercase">{userData?.role}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all backdrop-blur-xl border border-white/10"
              >
                Volver
              </button>
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium transition-all shadow-lg shadow-blue-500/50"
              >
                Ir al Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      );
    }
  }

  // ============================================================================
  // CHECK PERMISSIONS
  // ============================================================================
  if (requiredPermissions.length > 0 && userData) {
    const hasAllPermissions = requiredPermissions.every((permission) => {
      // Admin siempre tiene todos los permisos
      if (userData.role === 'admin') return true;
      return userData.permissions.includes(permission);
    });

    if (!hasAllPermissions) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-950">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-md text-center"
          >
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/20 backdrop-blur-xl">
              <Shield className="h-10 w-10 text-orange-400" />
            </div>

            {/* Message */}
            <h1 className="mb-3 text-3xl font-bold text-white">
              Permisos Insuficientes
            </h1>
            <p className="mb-6 text-gray-400">
              Necesitas permisos adicionales para acceder a esta funcionalidad.
            </p>

            {/* Info */}
            <div className="mb-6 rounded-xl bg-white/5 p-4 backdrop-blur-xl border border-white/10 text-left">
              <p className="text-sm font-semibold text-gray-300 mb-2">
                Permisos requeridos:
              </p>
              <ul className="space-y-1">
                {requiredPermissions.map((perm) => (
                  <li key={perm} className="flex items-center gap-2 text-sm text-blue-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    {perm}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all backdrop-blur-xl border border-white/10"
              >
                Volver
              </button>
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium transition-all shadow-lg shadow-blue-500/50"
              >
                Ir al Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      );
    }
  }

  // ============================================================================
  // CHECK IF USER IS ACTIVE
  // ============================================================================
  if (userData && !userData.isActive) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md text-center"
        >
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 backdrop-blur-xl">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>

          {/* Message */}
          <h1 className="mb-3 text-3xl font-bold text-white">
            Cuenta Desactivada
          </h1>
          <p className="mb-6 text-gray-400">
            Tu cuenta ha sido desactivada. Por favor contacta al administrador.
          </p>

          {/* Action */}
          <button
            onClick={() => {
              import('./AuthProvider').then(({ useAuth }) => {
                // Cerrar sesión
                const auth = useAuth();
                auth.signOut();
              });
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium transition-all shadow-lg shadow-blue-500/50"
          >
            Cerrar Sesión
          </button>
        </motion.div>
      </div>
    );
  }

  // ============================================================================
  // AUTHORIZED - RENDER CHILDREN
  // ============================================================================
  return <>{children}</>;
}

// ============================================================================
// HELPER HOOK: useRequireAuth
// ============================================================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [user, loading, navigate, location]);

  return { user, loading };
}

// ============================================================================
// PERMISSION WRAPPER COMPONENT
// ============================================================================

interface RequirePermissionProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}

export function RequirePermission({ children, permission, fallback = null }: RequirePermissionProps) {
  const { userData } = useAuth();

  if (!userData) return null;

  // Admin tiene todos los permisos
  if (userData.role === 'admin') return <>{children}</>;

  // Verificar permiso
  if (userData.permissions.includes(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// ============================================================================
// ROLE WRAPPER COMPONENT
// ============================================================================

interface RequireRoleProps {
  children: React.ReactNode;
  role: 'admin' | 'manager' | 'user';
  fallback?: React.ReactNode;
}

export function RequireRole({ children, role, fallback = null }: RequireRoleProps) {
  const { userData } = useAuth();

  if (!userData) return null;

  const roleHierarchy = {
    admin: 3,
    manager: 2,
    user: 1,
  };

  const userRoleLevel = roleHierarchy[userData.role];
  const requiredRoleLevel = roleHierarchy[role];

  if (userRoleLevel >= requiredRoleLevel) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
