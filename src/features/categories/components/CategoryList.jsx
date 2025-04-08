import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, ListGroup } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import { categoryService } from '../services/categoryService';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

// Lista de categorías predefinidas comunes
const PREDEFINED_CATEGORIES = [
  { name: 'Frutas y Verduras', icon: '🥬' },
  { name: 'Carnes y Pescados', icon: '🥩' },
  { name: 'Lácteos y Huevos', icon: '🥛' },
  { name: 'Panadería', icon: '🥖' },
  { name: 'Bebidas', icon: '🥤' },
  { name: 'Snacks', icon: '🍿' },
  { name: 'Limpieza', icon: '🧹' },
  { name: 'Cuidado Personal', icon: '🧴' },
  { name: 'Despensa', icon: '🥫' },
  { name: 'Congelados', icon: '🧊' }
];

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadCategories();
  }, [user]);

  const loadCategories = async () => {
    if (user) {
      try {
        const userCategories = await categoryService.getCategories({ userId: user.uid });
        setCategories(userCategories);
      } catch (error) {
        console.error('Error al cargar las categorías:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    
    setLoading(true);
    try {
      if (currentCategory) {
        await categoryService.updateCategory(currentCategory.id, { 
          name: categoryName 
        });
      } else {
        await categoryService.createCategory({ 
          name: categoryName, 
          userId: user.uid 
        });
      }
      await loadCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar la categoría:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPredefined = async (predefinedCategory) => {
    setLoading(true);
    try {
      const existingCategory = categories.find(
        cat => cat.name.toLowerCase() === predefinedCategory.name.toLowerCase()
      );

      if (!existingCategory) {
        await categoryService.createCategory({
          name: predefinedCategory.name,
          userId: user.uid,
          icon: predefinedCategory.icon
        });
        await loadCategories();
      }
    } catch (error) {
      console.error('Error al crear la categoría predefinida:', error);
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setShowCustomInput(true);
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await categoryService.deleteCategory(categoryId);
        await loadCategories();
      } catch (error) {
        console.error('Error al eliminar la categoría:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCategory(null);
    setCategoryName('');
    setShowCustomInput(false);
  };

  const handleAddNew = () => {
    setShowCustomInput(true);
    setCategoryName('');
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Mis Categorías</h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <FaPlus /> Agregar Categoría
          </Button>
        </Col>
      </Row>

      <Row xs={1} md={2} lg={3} className="g-4">
        {categories.map((category) => (
          <Col key={category.id}>
            <Card>
              <Card.Body>
                <Card.Title>
                  {category.icon && <span className="me-2">{category.icon}</span>}
                  {category.name}
                </Card.Title>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <FaEdit /> Editar
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                  >
                    <FaTrash /> Eliminar
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentCategory ? 'Editar Categoría' : 'Agregar Categoría'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!currentCategory && !showCustomInput && (
            <>
              <h5 className="mb-3">Categorías Predefinidas</h5>
              <ListGroup className="mb-3">
                {PREDEFINED_CATEGORIES.map((category, index) => (
                  <ListGroup.Item
                    key={index}
                    action
                    onClick={() => handleSelectPredefined(category)}
                    className="d-flex align-items-center"
                    disabled={categories.some(
                      cat => cat.name.toLowerCase() === category.name.toLowerCase()
                    )}
                  >
                    <span className="me-2">{category.icon}</span>
                    {category.name}
                    {categories.some(
                      cat => cat.name.toLowerCase() === category.name.toLowerCase()
                    ) && (
                      <span className="ms-auto text-muted">(Ya existe)</span>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <div className="text-center mb-3">
                <Button variant="link" onClick={handleAddNew}>
                  ¿No encuentras lo que buscas? Crear categoría personalizada
                </Button>
              </div>
            </>
          )}

          {(showCustomInput || currentCategory) && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre de la Categoría</Form.Label>
                <Form.Control
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Ingresa el nombre de la categoría"
                  required
                />
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                {!currentCategory && (
                  <Button variant="link" onClick={() => setShowCustomInput(false)}>
                    Volver a categorías predefinidas
                  </Button>
                )}
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
} 