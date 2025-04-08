import React, { useState } from 'react';
import { Container, Row, Col, Nav, Navbar, Button } from 'react-bootstrap';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUserCircle, FaStore, FaList, FaBox, FaQuestionCircle, FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import StoreList from '../../stores/components/StoreList';
import CategoryList from '../../categories/components/CategoryList';
import ProductList from '../../products/components/ProductList';
import { useAuth } from '../../../contexts/AuthContext';
import HelpCenter from '../../support/components/HelpCenter';
import Profile from '../../auth/components/Profile';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleSidebar = () => {
    if (!showSidebar) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    setShowSidebar(!showSidebar);
  };

  // Cerrar el sidebar cuando se navega a una nueva ruta en dispositivos móviles
  const handleNavigation = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(false);
      document.body.classList.remove('sidebar-open');
    }
  };

  return (
    <div className="dashboard">
      <Navbar expand="lg" className="dashboard-navbar mb-4">
        <Container fluid>
          <Button 
            variant="link" 
            className="d-md-none mobile-sidebar-toggle me-2 p-0" 
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
          >
            {showSidebar ? <FaTimes className="text-danger menu-icon-close" /> : <FaBars className="text-primary menu-icon-open" />}
          </Button>
          <Navbar.Brand className="fw-bold brand-title">
            <FaShoppingCart className="brand-icon me-2" />
            <span className="brand-text">GESTOR-LISTA-MERCADO</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <div className="ms-auto d-flex align-items-center gap-3">
              <span className="text-secondary d-none d-sm-block">{user.email}</span>
              <Button 
                variant="outline-primary" 
                size="sm"
                as={Link}
                to="profile"
                className="d-flex align-items-center gap-2 nav-button"
              >
                <FaUserCircle />
                <span className="d-none d-sm-block">Mi Perfil</span>
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={handleLogout}
                className="d-flex align-items-center gap-2 nav-button"
              >
                <FaSignOutAlt />
                <span className="d-none d-sm-block">Cerrar Sesión</span>
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid>
        <Row>
          <div className={`mobile-sidebar-overlay ${showSidebar ? 'show' : ''}`} onClick={toggleSidebar}></div>
          <Col md={3} lg={2} className={`sidebar ${showSidebar ? 'show' : ''}`}>
            <Nav className="flex-column gap-1">
              <Nav.Item>
                <Nav.Link 
                  as={Link} 
                  to="stores" 
                  className={location.pathname.includes('/stores') ? 'active menu-item-animation' : 'menu-item-animation'}
                  onClick={handleNavigation}
                >
                  <FaStore className="me-2" />
                  Tiendas
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  as={Link} 
                  to="categories" 
                  className={location.pathname.includes('/categories') ? 'active menu-item-animation' : 'menu-item-animation'}
                  onClick={handleNavigation}
                >
                  <FaList className="me-2" />
                  Categorías
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  as={Link} 
                  to="products" 
                  className={location.pathname.includes('/products') ? 'active menu-item-animation' : 'menu-item-animation'}
                  onClick={handleNavigation}
                >
                  <FaBox className="me-2" />
                  Productos
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  as={Link} 
                  to="help" 
                  className={location.pathname.includes('/help') ? 'active menu-item-animation' : 'menu-item-animation'}
                  onClick={handleNavigation}
                >
                  <FaQuestionCircle className="me-2" />
                  Centro de Ayuda
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col md={9} lg={10} className="main-content bg-light min-vh-100 py-4">
            <Routes>
              <Route path="profile" element={<Profile />} />
              <Route path="stores" element={<StoreList />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="products" element={<ProductList />} />
              <Route path="help" element={<HelpCenter />} />
              <Route path="/" element={<Navigate to="products" replace />} />
            </Routes>
          </Col>
        </Row>
      </Container>
    </div>
  );
} 