import React, { useState } from 'react';
import { Card, Button, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { unlink, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function Profile() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, logout, linkAccount } = useAuth();
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
    setError('');
    
    try {
      await linkAccount(providers[providerId].provider);
      toast.success(`Cuenta de ${providers[providerId].name} vinculada exitosamente`);
    } catch (error) {
      console.error('Error al vincular:', error);
      
      let errorMessage = 'Error al vincular el proveedor';
      
      if (error.code === 'auth/credential-already-in-use') {
        errorMessage = `Esta cuenta de ${providers[providerId].name} ya está vinculada a otro usuario.`;
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = `El email de esta cuenta de ${providers[providerId].name} ya está en uso por otro usuario.`;
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por seguridad, necesitas volver a iniciar sesión antes de vincular una nueva cuenta.';
        await logout();
        navigate('/login');
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkProvider = async (providerId) => {
    if (!providers[providerId]) return;
    
    // No permitir desvincular si es el único proveedor
    if (connectedProviders.length <= 1) {
      const errorMsg = 'No puedes desvincular tu único método de inicio de sesión';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await unlink(auth.currentUser, providerId);
      toast.success(`Cuenta de ${providers[providerId].name} desvinculada exitosamente`);
    } catch (error) {
      console.error('Error al desvincular:', error);
      const errorMsg = 'Error al desvincular la cuenta. Por favor, intenta nuevamente.';
      setError(errorMsg);
      toast.error(errorMsg);
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
            <strong>Email:</strong> {user.email}
            
            <h3 className="mt-4 mb-3">Proveedores de inicio de sesión</h3>
            
            {Object.entries(providers).map(([providerId, providerInfo]) => (
              <div key={providerId} className="d-grid gap-2 mt-2">
                <Button
                  variant={providerInfo.color}
                  onClick={() => 
                    connectedProviders.includes(providerId) 
                      ? handleUnlinkProvider(providerId)
                      : handleLinkProvider(providerId)
                  }
                  disabled={loading}
                >
                  {providerInfo.icon}
                  {connectedProviders.includes(providerId) 
                    ? `Desvincular ${providerInfo.name}`
                    : `Vincular ${providerInfo.name}`
                  }
                </Button>
              </div>
            ))}

            <div className="d-grid gap-2 mt-4">
              <Button variant="primary" onClick={handleLogout} disabled={loading}>
                Cerrar Sesión
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}