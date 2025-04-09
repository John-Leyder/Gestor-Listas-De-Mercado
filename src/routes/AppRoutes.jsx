import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from 'react-bootstrap';

// Componentes lazy loaded
const Login = lazy(() => import('../features/auth/components/Login'));
const Signup = lazy(() => import('../features/auth/components/Signup'));
const Dashboard = lazy(() => import('../features/dashboard/components/Dashboard'));

// Componente de carga
const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center min-vh-100">
    <Spinner animation="border" variant="primary" />
  </div>
);

// Componente para rutas protegidas
function PrivateRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
}

// Componente para rutas públicas (login/signup)
function PublicRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    return <Navigate to={location.state?.from?.pathname || "/"} replace />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
} 