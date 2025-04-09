import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged
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
  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Inicio de sesión con GitHub
  const loginWithGithub = async () => {
    const provider = new GithubAuthProvider();
    try {
      return await signInWithPopup(auth, provider);
    } catch (error) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        const email = error.customData?.email;
        const pendingCredential = GithubAuthProvider.credentialFromError(error);

        if (email && pendingCredential) {
          try {
            // Obtener los métodos de inicio de sesión asociados al email
            const methods = await auth.fetchSignInMethodsForEmail(email);

            if (methods.includes('google.com')) {
              const googleProvider = new GoogleAuthProvider();
              const result = await signInWithPopup(auth, googleProvider);

              // Vincular las credenciales pendientes
              await result.user.linkWithCredential(pendingCredential);
              return result;
            }
          } catch (linkError) {
            console.error('Error al vincular las credenciales:', linkError);
            throw new Error('No se pudo vincular la cuenta. Intenta de nuevo.');
          }
        }
      }
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
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}