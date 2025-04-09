import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  linkWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Observador de estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Registro con email y contraseña
  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Inicio de sesión con email y contraseña
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Inicio de sesión con Google
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error) {
      console.error('Error en login con Google:', error);
      throw error;
    }
  };

  // Vincular cuenta con proveedor
  const linkAccount = async (provider) => {
    if (!auth.currentUser) throw new Error('No hay usuario autenticado');
    try {
      const result = await linkWithPopup(auth.currentUser, provider);
      return result;
    } catch (error) {
      console.error('Error al vincular cuenta:', error);
      throw error;
    }
  };

  // Inicio de sesión con GitHub
  const loginWithGithub = async () => {
    const provider = new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        const email = error.customData?.email;
        
        if (email) {
          // Obtener los métodos de inicio de sesión disponibles
          const methods = await fetchSignInMethodsForEmail(auth, email);
          
          if (methods.length > 0) {
            throw new Error(`Esta cuenta ya está registrada. Por favor, inicia sesión con: ${methods.join(', ')}`);
          }
        }
      }
      console.error('Error en login con GitHub:', error);
      throw error;
    }
  };

  // Cerrar sesión
  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithGoogle,
    loginWithGithub,
    linkAccount,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}