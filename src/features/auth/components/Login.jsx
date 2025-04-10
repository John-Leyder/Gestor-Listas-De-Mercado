import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import '../styles/Auth.css';
import { toast } from 'react-toastify';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, loginWithGithub } = useAuth();
  const navigate = useNavigate();

  // Validación básica de email
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Manejador de envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    if (!isEmailValid(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Intenta más tarde o restablece tu contraseña.');
      } else {
        setError('Ocurrió un error al iniciar sesión. Por favor intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Convertir ID de proveedor a nombre legible
  const getProviderName = (providerId) => {
    const providers = {
      'password': 'correo electrónico y contraseña',
      'google.com': 'Google',
      'github.com': 'GitHub'
    };
    
    return providers[providerId] || providerId;
  };

  // Generar mensaje de error para inicio de sesión social
  const generateAuthErrorMessage = (error, provider) => {
    const errorCode = error.code;
    
    // Si el error incluye la información del proveedor que debería usar
    if (errorCode === 'auth/account-exists-with-different-credential' && error.customData?.email) {
      const email = error.customData.email;
      
      // Verificar si hay información sobre el proveedor correcto en el mensaje de error
      if (error.customData?.pendingCredential) {
        const providerId = error.customData._tokenResponse?.verifiedProviderData?.[0]?.providerId;
        
        if (providerId) {
          const providerName = getProviderName(providerId);
          return `El email ${email} ya está registrado. Por favor inicia sesión con ${providerName}.`;
        }
      }
      
      return `El email ${email} ya está registrado con otro método de inicio de sesión.`;
    }
    
    // Otros errores comunes
    switch (errorCode) {
      case 'auth/popup-closed-by-user':
        return `Inicio de sesión con ${provider} cancelado.`;
      case 'auth/cancelled-popup-request':
        return 'Solicitud de inicio de sesión cancelada.';
      case 'auth/popup-blocked':
        return 'El navegador bloqueó la ventana emergente. Por favor permite ventanas emergentes e intenta de nuevo.';
      case 'auth/user-disabled':
        return 'Esta cuenta ha sido deshabilitada.';
      default:
        console.error(`Error detallado:`, error);
        return `Error al iniciar sesión con ${provider}. Por favor intenta otro método.`;
    }
  };

  // Manejador de inicio de sesión social
  const handleSocialLogin = async (provider, providerFunction) => {
    try {
      setError('');
      setLoading(true);

      await providerFunction();
      navigate('/dashboard');
    } catch (error) {
      console.error(`Error de inicio de sesión con ${provider}:`, error);

      if (error.code === 'auth/account-exists-with-different-credential') {
        const email = error.customData?.email;
        const pendingCredential = error.customData?.credential;

        if (email && pendingCredential) {
          try {
            // Obtener los métodos de inicio de sesión asociados al email
            const methods = await auth.fetchSignInMethodsForEmail(email);

            if (methods.length > 0) {
              const providerId = methods[0];
              const providerName = getProviderName(providerId);

              // Solicitar al usuario que inicie sesión con el proveedor existente
              toast.info(`El email ${email} ya está registrado. Por favor inicia sesión con ${providerName}.`);

              // Iniciar sesión con el proveedor existente
              let result;
              if (providerId === 'google.com') {
                result = await loginWithGoogle();
              } else if (providerId === 'github.com') {
                result = await loginWithGithub();
              }

              // Vincular las credenciales pendientes
              if (result?.user) {
                await result.user.linkWithCredential(pendingCredential);
                toast.success('Cuenta vinculada exitosamente.');
                navigate('/dashboard');
              }
            }
          } catch (linkError) {
            console.error('Error al vincular las credenciales:', linkError);
            toast.error('No se pudo vincular la cuenta. Intenta de nuevo.');
          }
        }
      } else {
        const errorMessage = generateAuthErrorMessage(error, provider);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejador de inicio de sesión con GitHub
  const handleGithubLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGithub();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error de inicio de sesión con GitHub:', error);
      if (error.code === 'auth/account-exists-with-different-credential') {
        const email = error.customData?.email;
        setError(`Esta cuenta de correo (${email}) ya está registrada con otro método de inicio de sesión. Por favor, usa ese método.`);
        toast.error(`Por favor, inicia sesión con el método que usaste originalmente para ${email}`);
      } else {
        setError('Error al iniciar sesión con GitHub. Por favor intenta otro método.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <Card.Body>
          <h2 className="auth-title">Iniciar Sesión</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="form-group">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Ingresa tu email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
            
            <Form.Group className="form-group">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Ingresa tu contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
            
            <Button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Iniciando sesión...
                </>
              ) : 'Iniciar Sesión'}
            </Button>
          </Form>
          
          <div className="divider">
            <span>O continúa con</span>
          </div>
          
          <div className="social-login">
            <button 
              className="social-btn google"
              disabled={loading}
              onClick={() => handleSocialLogin('Google', loginWithGoogle)}
            >
              <FaGoogle /> Google
            </button>
            
            <button 
              className="social-btn github"
              disabled={loading}
              onClick={handleGithubLogin}
            >
              <FaGithub /> GitHub
            </button>
          </div>
          
          <Link to="/signup" className="auth-link">
            ¿No tienes una cuenta? Regístrate aquí
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Login;