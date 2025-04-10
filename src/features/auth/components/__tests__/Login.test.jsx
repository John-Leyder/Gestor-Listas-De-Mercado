import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../../contexts/AuthContext';
import Login from '../Login';
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

const mockLoginWithGoogle = vi.fn();
const mockLoginWithGithub = vi.fn();

vi.mock('../../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    loginWithGoogle: mockLoginWithGoogle,
    loginWithGithub: mockLoginWithGithub
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza correctamente el formulario de login', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  test('muestra error cuando los campos están vacíos', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor completa todos los campos')).toBeInTheDocument();
    });
  });

  test('valida formato de email', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'emailinvalido' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor ingresa un email válido')).toBeInTheDocument();
    });
  });

  test('maneja errores de autenticación', async () => {
    const { useAuth } = vi.importActual('../../../../contexts/AuthContext');
    const mockLogin = vi.fn().mockRejectedValue({ code: 'auth/wrong-password' });

    vi.mock('../../../../contexts/AuthContext', () => ({
      useAuth: () => ({
        ...useAuth(),
        login: mockLogin
      }),
      AuthProvider: ({ children }) => <div>{children}</div>
    }));

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/credenciales incorrectas/i)).toBeInTheDocument();
    });
  });

  test('redirige al dashboard después de un login exitoso', async () => {
    const { useAuth } = vi.importActual('../../../../contexts/AuthContext');
    const mockLogin = vi.fn().mockResolvedValue();

    vi.mock('../../../../contexts/AuthContext', () => ({
      useAuth: () => ({
        ...useAuth(),
        login: mockLogin
      }),
      AuthProvider: ({ children }) => <div>{children}</div>
    }));

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  // Pruebas de autenticación social
  describe('Autenticación con proveedores sociales', () => {
    test('maneja correctamente el login con Google', async () => {
      mockLoginWithGoogle.mockResolvedValueOnce();
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      const googleButton = screen.getByRole('button', { name: /google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockLoginWithGoogle).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('maneja errores en login con Google', async () => {
      mockLoginWithGoogle.mockRejectedValueOnce(new Error('Error de Google'));
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      const googleButton = screen.getByRole('button', { name: /google/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText(/ocurrió un error/i)).toBeInTheDocument();
      });
    });

    test('maneja correctamente el login con GitHub', async () => {
      mockLoginWithGithub.mockResolvedValueOnce();
      
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      const githubButton = screen.getByRole('button', { name: /github/i });
      fireEvent.click(githubButton);

      await waitFor(() => {
        expect(mockLoginWithGithub).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  // Pruebas de usabilidad
  describe('Usabilidad y accesibilidad', () => {
    test('muestra spinner durante el proceso de login', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('deshabilita el formulario durante el proceso de login', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    test('muestra mensajes de error de manera accesible', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/completa todos los campos/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    test('los campos de entrada tienen labels asociados correctamente', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);

      expect(emailInput).toHaveAttribute('id');
      expect(passwordInput).toHaveAttribute('id');
      expect(emailInput.getAttribute('id')).toBe(emailInput.labels[0].htmlFor);
      expect(passwordInput.getAttribute('id')).toBe(passwordInput.labels[0].htmlFor);
    });

    test('los botones sociales tienen iconos y texto descriptivo', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      const googleButton = screen.getByRole('button', { name: /google/i });
      const githubButton = screen.getByRole('button', { name: /github/i });

      expect(googleButton).toHaveAccessibleName();
      expect(githubButton).toHaveAccessibleName();
    });
  });

  // Pruebas de seguridad
  describe('Seguridad', () => {
    test('el campo de contraseña está enmascarado', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      const passwordInput = screen.getByLabelText(/contraseña/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('limpia los campos después de un error de login', async () => {
      const { useAuth } = vi.importActual('../../../../contexts/AuthContext');
      const mockLogin = vi.fn().mockRejectedValue({ code: 'auth/wrong-password' });

      vi.mock('../../../../contexts/AuthContext', () => ({
        useAuth: () => ({
          ...useAuth(),
          login: mockLogin
        }),
        AuthProvider: ({ children }) => <div>{children}</div>
      }));

      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(passwordInput).toHaveValue('');
      });
    });
  });
});
