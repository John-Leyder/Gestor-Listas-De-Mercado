import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import '../styles/Auth.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, loginWithGoogle, loginWithGithub } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateEmail(email)) {
      return setError('Por favor ingresa un email válido');
    }

    if (password !== passwordConfirm) {
      return setError('Las contraseñas no coinciden');
    }

    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(provider, providerFunction) {
    try {
      setError('');
      setLoading(true);
      await providerFunction();
      navigate('/dashboard');
    } catch (error) {
      console.error(`Error de inicio de sesión con ${provider}:`, error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  }

  function getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Ya existe una cuenta con este correo electrónico.';
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido.';
      case 'auth/operation-not-allowed':
        return 'Esta operación no está permitida.';
      case 'auth/weak-password':
        return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
      case 'auth/popup-closed-by-user':
        return 'Se cerró la ventana de registro. Intenta nuevamente.';
      case 'auth/cancelled-popup-request':
        return 'Se canceló la operación. Intenta nuevamente.';
      case 'auth/account-exists-with-different-credential':
        return 'Ya existe una cuenta con este email usando otro método de inicio de sesión.';
      case 'auth/popup-blocked':
        return 'El navegador bloqueó la ventana emergente. Permite ventanas emergentes e intenta nuevamente.';
      default:
        return 'Error al crear la cuenta. Por favor, intenta nuevamente.';
    }
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <Card.Body>
          <h2 className="auth-title">Crear Cuenta</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="form-group">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Confirma tu contraseña"
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
                  Creando cuenta...
                </>
              ) : 'Registrarse'}
            </Button>
          </Form>

          <div className="divider">
            <span>O regístrate con</span>
          </div>

          <div className="social-login">
            <button
              className="social-btn google"
              onClick={() => handleSocialLogin('Google', loginWithGoogle)}
              disabled={loading}
            >
              <FaGoogle /> Google
            </button>

            <button
              className="social-btn github"
              onClick={() => handleSocialLogin('GitHub', loginWithGithub)}
              disabled={loading}
            >
              <FaGithub /> GitHub
            </button>
          </div>

          <Link to="/login" className="auth-link">
            ¿Ya tienes una cuenta? Inicia Sesión
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
} 