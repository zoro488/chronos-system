/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                      LOGINSCREEN - CHRONOS SYSTEM                         ║
 * ║  Pantalla de login premium con animaciones y múltiples métodos            ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import { motion } from 'framer-motion';
import { Chrome, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import ChronosLogo from '../brand/ChronosLogo';
import { useAuth } from './AuthProvider';

export default function LoginScreen() {
  const { signIn, signInWithGoogle, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Validaciones
    if (!email || !password) {
      setLocalError('Por favor completa todos los campos');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalError('Email inválido');
      return;
    }

    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (isSignUp && !displayName) {
      setLocalError('Por favor ingresa tu nombre');
      return;
    }

    try {
      setLoading(true);

      if (isSignUp) {
        await useAuth().signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      console.error('Error en login:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error('Error en Google sign in:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900/20 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl"
        />

        {/* Animated grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="relative overflow-hidden rounded-3xl bg-white/5 p-8 shadow-2xl backdrop-blur-xl border border-white/10">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <ChronosLogo size="large" animated />
          </div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? 'Crear Cuenta' : 'Bienvenido a CHRONOS'}
            </h1>
            <p className="text-gray-400">
              {isSignUp ? 'Regístrate para comenzar' : 'Sistema de gestión empresarial'}
            </p>
          </motion.div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mb-6 flex items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-gray-900 font-medium transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Chrome className="h-5 w-5" />
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-900 px-4 text-gray-400">O continúa con email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name (solo en sign up) */}
            {isSignUp && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre Completo
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all backdrop-blur-xl"
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all backdrop-blur-xl"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all backdrop-blur-xl"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {(localError || error) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400"
              >
                {localError || error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/50 transition-all hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-purple-500/60"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {isSignUp ? 'Creando cuenta...' : 'Iniciando sesión...'}
                </div>
              ) : (
                isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'
              )}
            </button>

            {/* Toggle Sign Up / Sign In */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setLocalError('');
                }}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>

            {/* Forgot Password (solo en login) */}
            {!isSignUp && (
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-gray-400 hover:text-purple-300 transition-colors"
                  onClick={() => {
                    if (email) {
                      toast.promise(
                        useAuth().resetPassword(email),
                        {
                          loading: 'Enviando email...',
                          success: 'Email enviado. Revisa tu bandeja.',
                          error: 'Error al enviar email',
                        }
                      );
                    } else {
                      toast.error('Ingresa tu email primero');
                    }
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center text-sm text-gray-500"
        >
          CHRONOS System © 2025. Todos los derechos reservados.
        </motion.div>
      </motion.div>
    </div>
  );
}
