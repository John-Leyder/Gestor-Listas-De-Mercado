import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import '../styles/Auth.css';
import '../../../styles/global.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, loginWithGoogle, loginWithGithub } = useAuth();

  // Función para validar el email
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
      navigate('/');
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(provider) {
    try {
      setError('');
      setLoading(true);
      switch (provider) {
        case 'google':
          await loginWithGoogle();
          break;
        case 'github':
          await loginWithGithub();
          break;
        default:
          throw new Error('Proveedor no soportado');
      }
      navigate('/');
    } catch (error) {
      console.error(error);
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
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <Card className="shadow-lg border-0">
          <Card.Body className="p-4">
            <h2 className="text-center mb-4 fw-bold">Crear Cuenta</h2>
            {error && <Alert variant="danger" className="text-center">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="email" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error && validateEmail(e.target.value)) {
                      setError('');
                    }
                  }}
                  isInvalid={error && error.includes('email')}
                  required
                  className="form-control-lg"
                  placeholder="ejemplo@correo.com"
                />
                <Form.Control.Feedback type="invalid">
                  {error && error.includes('email') ? error : ''}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group id="password" className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-control-lg"
                  placeholder="Ingresa tu contraseña"
                />
              </Form.Group>
              <Form.Group id="password-confirm" className="mb-4">
                <Form.Label>Confirmar Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  className="form-control-lg"
                  placeholder="Confirma tu contraseña"
                />
              </Form.Group>
              <Button 
                disabled={loading} 
                className="w-100 mb-4 btn-lg" 
                type="submit"
                variant="primary"
              >
                {loading ? 'Creando cuenta...' : 'Registrarse'}
              </Button>
            </Form>
            <div className="text-center mb-3">
              <span className="text-muted">O regístrate con</span>
            </div>
            <div className="social-login">
              <Button
                variant="outline-danger"
                className="w-100 mb-3 btn-lg d-flex align-items-center justify-content-center"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
              >
                <FaGoogle className="me-2" />
                <span>Google</span>
              </Button>
              <Button
                variant="outline-dark"
                className="w-100 mb-3 btn-lg d-flex align-items-center justify-content-center"
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
              >
                <FaGithub className="me-2" />
                <span>GitHub</span>
              </Button>
            </div>
          </Card.Body>
        </Card>
        <div className="w-100 text-center mt-3">
          <span className="text-muted">¿Ya tienes una cuenta?</span>{' '}
          <Link to="/login" className="text-decoration-none fw-bold">Inicia Sesión</Link>
        </div>
      </div>
    </Container>
  );
} 