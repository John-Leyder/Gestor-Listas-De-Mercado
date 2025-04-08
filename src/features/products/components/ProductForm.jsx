import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { productService } from '../services/productService';
import { categoryService } from '../../categories/services/categoryService';
import { storeService } from '../../stores/services/storeService';
import { useAuth } from '../../../contexts/AuthContext';

export default function ProductForm({ show, onHide, product, onSave }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    unit: '',
    categoryId: '',
    storeId: ''
  });

  useEffect(() => {
    if (show) {
      loadFormData();
      if (product) {
        setFormData({
          name: product.name || '',
          brand: product.brand || '',
          price: product.price || '',
          unit: product.unit || '',
          categoryId: product.categoryId || '',
          storeId: product.storeId || ''
        });
      } else {
        setFormData({
          name: '',
          brand: '',
          price: '',
          unit: '',
          categoryId: '',
          storeId: ''
        });
      }
    }
  }, [show, product]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const [categoriesData, storesData] = await Promise.all([
        categoryService.getCategories({ userId: user.uid }),
        storeService.getStores({ userId: user.uid })
      ]);
      setCategories(categoriesData);
      setStores(storesData);
    } catch (err) {
      setError('Error al cargar los datos del formulario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        userId: user.uid,
        categoryName: categories.find(c => c.id === formData.categoryId)?.name || '',
        storeName: stores.find(s => s.id === formData.storeId)?.name || ''
      };

      if (product) {
        await productService.updateProduct(product.id, productData);
      } else {
        await productService.createProduct(productData);
      }

      onSave();
    } catch (err) {
      setError('Error al guardar el producto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nombre del producto"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Marca</Form.Label>
            <Form.Control
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Marca del producto"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="Precio del producto"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Unidad</Form.Label>
            <Form.Control
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="Unidad de medida (ej: kg, litros, unidades)"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tienda</Form.Label>
            <Form.Select
              name="storeId"
              value={formData.storeId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar tienda</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
} 