import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import { storeService } from '../services/storeService';
import { FaPlus, FaEdit, FaTrash, FaStoreAlt, FaMapMarkerAlt } from 'react-icons/fa';
import '../styles/StoreList.css';

export default function StoreList() {
  const [stores, setStores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadStores();
  }, [user]);

  const loadStores = async () => {
    if (user) {
      setIsLoading(true);
      try {
        const userStores = await storeService.getStores({ userId: user.uid });
        setStores(userStores);
      } catch (error) {
        console.error('Error al cargar las tiendas:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentStore) {
        await storeService.updateStore(currentStore.id, { 
          name: storeName, 
          address 
        });
      } else {
        await storeService.createStore({ 
          name: storeName, 
          address, 
          userId: user.uid 
        });
      }
      await loadStores();
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar la tienda:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (store) => {
    setCurrentStore(store);
    setStoreName(store.name);
    setAddress(store.address);
    setShowModal(true);
  };

  const handleDelete = async (storeId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tienda?')) {
      try {
        await storeService.deleteStore(storeId);
        await loadStores();
      } catch (error) {
        console.error('Error al eliminar la tienda:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentStore(null);
    setStoreName('');
    setAddress('');
  };

  return (
    <Container className="py-4 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">Mis Tiendas</h2>
        <Button 
          variant="primary" 
          size="lg" 
          className="add-button" 
          onClick={() => setShowModal(true)}
        >
          <FaPlus className="me-2" /> 
          <span>Agregar Tienda</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" role="status" style={{width: '3rem', height: '3rem'}} />
          <p className="mt-3">Cargando tiendas...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-5 empty-state">
          <FaStoreAlt size={50} color="#cbd5e1" />
          <h4 className="mt-3">No tienes tiendas todavía</h4>
          <p className="text-muted">Agrega tu primera tienda para comenzar a organizar tus compras</p>
          <Button 
            variant="primary" 
            onClick={() => setShowModal(true)}
            className="mt-3"
          >
            <FaPlus className="me-2" /> Agregar Tienda
          </Button>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {stores.map((store) => (
            <Col key={store.id}>
              <Card className="store-card h-100 animate-card">
                <Card.Body className="d-flex flex-column">
                  <div className="store-icon-wrapper mb-3">
                    <FaStoreAlt className="store-icon" />
                  </div>
                  <Card.Title className="store-name text-center">{store.name}</Card.Title>
                  <Card.Text className="store-address text-center mb-4">
                    <FaMapMarkerAlt className="me-1 text-secondary" />
                    {store.address}
                  </Card.Text>
                  <div className="mt-auto d-flex gap-2 justify-content-center">
                    <Button
                      variant="outline-primary"
                      className="w-100"
                      onClick={() => handleEdit(store)}
                    >
                      <FaEdit className="me-2" /> Editar
                    </Button>
                    <Button
                      variant="outline-danger"
                      className="w-100"
                      onClick={() => handleDelete(store.id)}
                    >
                      <FaTrash className="me-2" /> Eliminar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentStore ? (
              <>
                <FaEdit className="me-2" />
                Editar Tienda: {currentStore.name}
              </>
            ) : (
              <>
                <FaPlus className="me-2" />
                Agregar Nueva Tienda
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-4">
              <Form.Label>Nombre de la Tienda</Form.Label>
              <Form.Control
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ej. Supermercado El Éxito"
                required
                className="form-control-lg"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej. Calle 123, Ciudad"
                required
                className="form-control-lg"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Guardando...
                </>
              ) : (
                'Guardar Tienda'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
} 