import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { unlink, linkWithPopup, GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function Profile() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const providers = {
    'google.com': {
      name: 'Google',
      icon: <FaGoogle className="me-2" />,
      color: 'danger',
      provider: new GoogleAuthProvider()
    },
    'github.com': {
      name: 'GitHub',
      icon: <FaGithub className="me-2" />,
      color: 'dark',
      provider: new GithubAuthProvider()
    }
  };

  const connectedProviders = user?.providerData.map(p => p.providerId) || [];

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch {
      setError('Error al cerrar sesión');
    }
  }

  const handleLinkProvider = async (providerId) => {
    if (!providers[providerId]) return;
    
    setLoading(true);
    try {
      await linkWithPopup(auth.currentUser, providers[providerId].provider);
      toast.success(`Cuenta de ${providers[providerId].name} vinculada exitosamente`);
    } catch (error) {
      console.error('Error al vincular:', error);
      
      let errorMessage = 'Error al vincular el proveedor';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = `Esta cuenta de ${providers[providerId].name} ya está vinculada a otro usuario. Por favor, primero desvincula la cuenta de ${providers[providerId].name} del otro usuario o usa una cuenta diferente.`;
      } else if (error.code === 'auth/credential-already-in-use') {
        errorMessage = `Esta cuenta de ${providers[providerId].name} ya está en uso por otro usuario.`;
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Se cerró la ventana de autenticación. Por favor, intenta nuevamente.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por seguridad, necesitas volver a iniciar sesión antes de vincular una nueva cuenta.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkProvider = async (providerId) => {
    if (!providers[providerId]) return;
    
    // No permitir desvincular si es el único proveedor
    const connectedProviders = user.providerData.length;
    if (connectedProviders <= 1) {
      toast.error('No puedes desvincular tu único método de inicio de sesión');
      return;
    }

    setLoading(true);
    try {
      await unlink(auth.currentUser, providerId);
      toast.success(`Cuenta de ${providers[providerId].name} desvinculada exitosamente`);
    } catch (error) {
      console.error('Error al desvincular:', error);
      toast.error('Error al desvincular la cuenta. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Perfil</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            <strong>Email:</strong> {user.email}
            
            <div className="mt-4">
              <h5>Proveedores de inicio de sesión</h5>
              {Object.entries(providers).map(([providerId, providerInfo]) => (
                <div key={providerId} className="d-flex justify-content-between align-items-center mt-2">
                  <span>
                    {providerInfo.icon}
                    {providerInfo.name}
                  </span>
                  {connectedProviders.includes(providerId) ? (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleUnlinkProvider(providerId)}
                      disabled={loading || connectedProviders.length <= 1}
                    >
                      Desvincular
                    </Button>
                  ) : (
                    <Button
                      variant={providerInfo.color}
                      size="sm"
                      onClick={() => handleLinkProvider(providerId)}
                      disabled={loading}
                    >
                      Vincular
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button className="w-100 mt-4" variant="primary" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
} 