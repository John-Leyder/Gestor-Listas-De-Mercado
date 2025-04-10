import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../../contexts/AuthContext';
import Profile from '../Profile';
import { toast } from 'react-toastify';

// Mock de las dependencias
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockUser = {
  email: 'test@example.com',
  displayName: 'Test User',
  providerData: [
    { providerId: 'password' }
  ]
};

const mockLinkAccount = vi.fn();
const mockLogout = vi.fn();

vi.mock('../../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
    linkAccount: mockLinkAccount
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

describe('Profile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza la información del usuario correctamente', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Profile />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByText(/proveedores de inicio de sesión/i)).toBeInTheDocument();
  });

  // Pruebas de vinculación de cuentas
  describe('Vinculación de cuentas', () => {
    test('maneja correctamente la vinculación con Google', async () => {
      mockLinkAccount.mockResolvedValueOnce();
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <Profile />
          </AuthProvider>
        </BrowserRouter>
      );

      const googleButton = screen.getByRole('button', { name: /google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockLinkAccount).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalled();
      });
    });

    test('maneja errores en la vinculación', async () => {
      mockLinkAccount.mockRejectedValueOnce(new Error('Error de vinculación'));
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <Profile />
          </AuthProvider>
        </BrowserRouter>
      );

      const googleButton = screen.getByRole('button', { name: /google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  // Pruebas de cierre de sesión
  describe('Cierre de sesión', () => {
    test('maneja correctamente el cierre de sesión', async () => {
      mockLogout.mockResolvedValueOnce();
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <Profile />
          </AuthProvider>
        </BrowserRouter>
      );

      const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    test('maneja errores en el cierre de sesión', async () => {
      mockLogout.mockRejectedValueOnce(new Error('Error de logout'));
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <Profile />
          </AuthProvider>
        </BrowserRouter>
      );

      const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  // Pruebas de usabilidad
  describe('Usabilidad y accesibilidad', () => {
    test('muestra estados de carga durante las operaciones', async () => {
      mockLinkAccount.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <Profile />
          </AuthProvider>
        </BrowserRouter>
      );

      const googleButton = screen.getByRole('button', { name: /google/i });
      fireEvent.click(googleButton);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(googleButton).toBeDisabled();
    });

    test('los botones tienen estados deshabilitados apropiados', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Profile />
          </AuthProvider>
        </BrowserRouter>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });

    test('muestra mensajes de retroalimentación accesibles', async () => {
      mockLinkAccount.mockRejectedValueOnce(new Error('Error de prueba'));
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <Profile />
          </AuthProvider>
        </BrowserRouter>
      );

      const googleButton = screen.getByRole('button', { name: /google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeVisible();
      });
    });
  });

  // Pruebas de seguridad
  describe('Seguridad', () => {
    test('no muestra información sensible del usuario', () => {
      const userWithSensitiveInfo = {
        ...mockUser,
        uid: 'sensitive-uid',
        stsTokenManager: { accessToken: 'sensitive-token' }
      };

      vi.mock('../../../../contexts/AuthContext', () => ({
        useAuth: () => ({
          user: userWithSensitiveInfo,
          logout: mockLogout,
          linkAccount: mockLinkAccount
        }),
        AuthProvider: ({ children }) => <div>{children}</div>
      }));

      render(
        <BrowserRouter>
          <AuthProvider>
            <Profile />
          </AuthProvider>
        </BrowserRouter>
      );

      const content = screen.getByRole('main').textContent;
      expect(content).not.toContain('sensitive-uid');
      expect(content).not.toContain('sensitive-token');
    });

    test('confirma antes de cerrar sesión', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm');
      confirmSpy.mockImplementation(() => true);

      render(
        <BrowserRouter>
          <AuthProvider>
            <Profile />
          </AuthProvider>
        </BrowserRouter>
      );

      const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
      fireEvent.click(logoutButton);

      expect(confirmSpy).toHaveBeenCalled();
    });
  });
});
