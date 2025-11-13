/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    AUTHPROVIDER - CHRONOS SYSTEM                          ║
 * ║  Context de autenticación con Firebase Auth + Firestore                   ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../config/firebase';

// ============================================================================
// TYPES
// ============================================================================

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'manager' | 'user';
  permissions: string[];
  empresa: string;
  departamento?: string;
  telefono?: string;
  createdAt: any;
  lastLogin: any;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: 'admin' | 'manager' | 'user') => boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // ============================================================================
  // CARGAR DATOS DE USUARIO DESDE FIRESTORE
  // ============================================================================
  const loadUserData = async (user: User) => {
    try {
      const userDocRef = doc(db, 'usuarios', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;

        // Verificar si el usuario está activo
        if (!data.isActive) {
          toast.error('Tu cuenta ha sido desactivada. Contacta al administrador.');
          await firebaseSignOut(auth);
          return;
        }

        setUserData(data);

        // Actualizar último login
        await setDoc(
          userDocRef,
          {
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        // Crear usuario en Firestore si no existe (primer login con Google)
        const newUserData: UserData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user',
          permissions: ['read'],
          empresa: 'Sin asignar',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          isActive: true,
        };

        await setDoc(userDocRef, newUserData);
        setUserData(newUserData);

        toast.success('¡Bienvenido! Tu cuenta ha sido creada.');
      }
    } catch (err) {
      console.error('Error cargando datos de usuario:', err);
      setError('Error al cargar datos del usuario');
      toast.error('Error al cargar tu perfil');
    }
  };

  // ============================================================================
  // AUTH STATE LISTENER
  // ============================================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        await loadUserData(user);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ============================================================================
  // SIGN IN
  // ============================================================================
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const result = await signInWithEmailAndPassword(auth, email, password);

      toast.success(`¡Bienvenido ${result.user.displayName || 'de nuevo'}!`);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error en signIn:', err);

      let errorMessage = 'Error al iniciar sesión';

      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuario no encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Usuario deshabilitado';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Intenta más tarde';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de red. Verifica tu conexión';
          break;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SIGN IN WITH GOOGLE
  // ============================================================================
  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);

      toast.success(`¡Bienvenido ${result.user.displayName}!`);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error en signInWithGoogle:', err);

      let errorMessage = 'Error al iniciar sesión con Google';

      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Inicio de sesión cancelado';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup bloqueado. Permite popups para este sitio';
      }

      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SIGN UP
  // ============================================================================
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      setLoading(true);

      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Actualizar perfil
      await updateProfile(result.user, { displayName });

      // Crear documento en Firestore
      const newUserData: UserData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName,
        photoURL: null,
        role: 'user',
        permissions: ['read'],
        empresa: 'Sin asignar',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        isActive: true,
      };

      await setDoc(doc(db, 'usuarios', result.user.uid), newUserData);

      toast.success(`¡Cuenta creada exitosamente! Bienvenido ${displayName}`);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error en signUp:', err);

      let errorMessage = 'Error al crear cuenta';

      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'El email ya está registrado';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // SIGN OUT
  // ============================================================================
  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setUserData(null);
      toast.success('Sesión cerrada correctamente');
      navigate('/login');
    } catch (err) {
      console.error('Error en signOut:', err);
      setError('Error al cerrar sesión');
      toast.error('Error al cerrar sesión');
      throw err;
    }
  };

  // ============================================================================
  // RESET PASSWORD
  // ============================================================================
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      toast.success('Email de recuperación enviado. Revisa tu bandeja.');
    } catch (err: any) {
      console.error('Error en resetPassword:', err);

      let errorMessage = 'Error al enviar email de recuperación';

      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }

      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // ============================================================================
  // UPDATE USER PROFILE
  // ============================================================================
  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!user) return;

    try {
      setError(null);

      const userDocRef = doc(db, 'usuarios', user.uid);
      await setDoc(userDocRef, data, { merge: true });

      // Recargar datos
      await loadUserData(user);

      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      setError('Error al actualizar perfil');
      toast.error('Error al actualizar perfil');
      throw err;
    }
  };

  // ============================================================================
  // PERMISSION HELPERS
  // ============================================================================
  const hasPermission = (permission: string): boolean => {
    if (!userData) return false;

    // Admin tiene todos los permisos
    if (userData.role === 'admin') return true;

    return userData.permissions.includes(permission);
  };

  const hasRole = (role: 'admin' | 'manager' | 'user'): boolean => {
    if (!userData) return false;

    const roleHierarchy = {
      admin: 3,
      manager: 2,
      user: 1,
    };

    return roleHierarchy[userData.role] >= roleHierarchy[role];
  };

  // ============================================================================
  // VALUE
  // ============================================================================
  const value: AuthContextType = {
    user,
    userData,
    loading,
    error,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    updateUserProfile,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
