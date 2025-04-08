import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
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
      const errorMessage = generateAuthErrorMessage(error, provider);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="auth-container">
      <Row className="justify-content-center align-items-center h-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="auth-card">
            <Card.Body className="p-4 p-md-5">
              <h2 className="auth-title text-center mb-4">Iniciar Sesión</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="Ingresa tu email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
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
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-4" 
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
              
              <div className="divider d-flex align-items-center my-4">
                <p className="text-center mx-3 mb-0">O continúa con</p>
              </div>
              
              <div className="social-login d-flex justify-content-center gap-3 mb-4">
                <Button 
                  variant="outline-secondary" 
                  className="social-btn"
                  disabled={loading}
                  onClick={() => handleSocialLogin('Google', loginWithGoogle)}
                >
                  <FaGoogle className="me-2" />
                  Google
                </Button>
                
                <Button 
                  variant="outline-secondary"
                  className="social-btn"
                  disabled={loading}
                  onClick={() => handleSocialLogin('GitHub', loginWithGithub)}
                >
                  <FaGithub className="me-2" />
                  GitHub
                </Button>
              </div>
              
              <div className="text-center">
                <p>
                  ¿No tienes una cuenta?{' '}
                  <Link to="/signup" className="auth-link">Regístrate aquí</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login; 