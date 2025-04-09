import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Table, Badge, Dropdown, Spinner } from 'react-bootstrap';
import { FaFilter, FaSearch, FaToggleOn, FaToggleOff, FaEdit, FaTrash, FaChartLine, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { productService } from '../services/productService';
import { useAuth } from '../../../contexts/AuthContext';
import ProductForm from './ProductForm';
import PriceHistoryChart from './PriceHistoryChart';
import ExpenseSummary from './ExpenseSummary';
import InfiniteScroll from 'react-infinite-scroll-component';
import './ProductList.css';

export default function ProductList() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [showExpenseSummary, setShowExpenseSummary] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Estados para filtros
  const [filters, setFilters] = useState({
    name: '',
    brand: '',
    categoryId: '',
    storeId: '',
    minPrice: '',
    maxPrice: '',
    isActive: ''
  });

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      name: '',
      brand: '',
      categoryId: '',
      storeId: '',
      minPrice: '',
      maxPrice: '',
      isActive: ''
    });
    setLastDoc(null);
    setHasMore(true);
    productService.clearProductCache();
  };

  // Cargar productos
  const loadProducts = useCallback(async (reset = false) => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');
      console.log('Cargando productos con filtros:', { ...filters, userId: user.uid });

      const result = await productService.getProducts(
        user.uid,
        filters,
        reset ? null : lastDoc
      );

      // Asegurarnos de que todos los productos tengan precios válidos
      const productsWithValidPrices = result.products.map(product => ({
        ...product,
        price: typeof product.price === 'number' ? product.price : parseFloat(product.price || 0)
      }));
      
      console.log('Productos procesados:', productsWithValidPrices);
      setProducts(prev => reset ? productsWithValidPrices : [...prev, ...productsWithValidPrices]);
      setLastDoc(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error('Error en loadProducts:', err);
    } finally {
      setLoading(false);
    }
  }, [user, filters, lastDoc]);

  useEffect(() => {
    if (user) {
      loadProducts(true);
    }
  }, [loadProducts, user]);

  // Manejadores de eventos
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setLastDoc(null);
    setHasMore(true);
    productService.clearProductCache();
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedProducts = () => {
    if (!sortConfig.key) return products;

    return [...products].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      await productService.toggleProductStatus(productId, !currentStatus);
      loadProducts();
    } catch (err) {
      setError('Error al cambiar el estado del producto');
    }
  };

  const handleShowPriceHistory = (product) => {
    setSelectedProduct(product);
    setShowPriceHistory(true);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ms-1" />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />;
  };

  // Función auxiliar para formatear precios
  const formatPrice = (price) => {
    const numPrice = typeof price === 'number' ? price : parseFloat(price || 0);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('¿Está seguro que desea eliminar este producto?')) {
      try {
        await productService.deleteProduct(productId);
        loadProducts();
      } catch (err) {
        setError('Error al eliminar el producto');
      }
    }
  };

  return (
    <Container fluid className="product-list-container">
      {/* Filtros */}
      <Card className="filter-card mb-4">
        <Card.Header className="filter-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaFilter className="me-2" />
              Filtros
            </h5>
            <div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleClearFilters}
                className="filter-btn me-2"
              >
                Limpiar Filtros
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowExpenseSummary(true)}
                className="filter-btn"
              >
                <FaChartLine className="me-2" />
                Ver Resumen de Gastos
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="filter-row">
            <Col md={3} className="filter-item">
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    placeholder="Buscar por nombre..."
                    className="filter-control"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3} className="filter-item">
              <Form.Group className="mb-3">
                <Form.Label>Marca</Form.Label>
                <Form.Control
                  type="text"
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                  placeholder="Filtrar por marca..."
                  className="filter-control"
                />
              </Form.Group>
            </Col>
            <Col md={3} className="filter-item">
              <Form.Group className="mb-3">
                <Form.Label>Rango de Precio</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Mín"
                    className="filter-control"
                  />
                  <Form.Control
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Máx"
                    className="filter-control"
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={3} className="filter-item">
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="isActive"
                  value={filters.isActive}
                  onChange={handleFilterChange}
                  className="filter-control"
                >
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                  <option value="">Todos</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de Productos */}
      <Card className="product-card">
        <Card.Header className="product-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Productos</h5>
            <Button variant="primary" onClick={() => setShowForm(true)} className="add-product-btn">
              Agregar Producto
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : error ? (
            <div className="alert-container">
              <div className="alert alert-danger">{error}</div>
            </div>
          ) : (
            <div className="table-responsive">
              <InfiniteScroll
                dataLength={products.length}
                next={loadProducts}
                hasMore={hasMore}
                loader={
                  <div className="text-center my-3">
                    <Spinner animation="border" variant="primary" />
                  </div>
                }
                endMessage={
                  <p className="text-center my-3">
                    No hay más productos para mostrar
                  </p>
                }
              >
                <Table className="table-products">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                        Nombre {getSortIcon('name')}
                      </th>
                      <th onClick={() => handleSort('brand')} style={{ cursor: 'pointer' }}>
                        Marca {getSortIcon('brand')}
                      </th>
                      <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                        Precio {getSortIcon('price')}
                      </th>
                      <th onClick={() => handleSort('categoryName')} style={{ cursor: 'pointer' }}>
                        Categoría {getSortIcon('categoryName')}
                      </th>
                      <th onClick={() => handleSort('storeName')} style={{ cursor: 'pointer' }}>
                        Tienda {getSortIcon('storeName')}
                      </th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedProducts().map(product => (
                      <tr key={product.id}>
                        <td className="product-name">{product.name || 'Sin nombre'}</td>
                        <td className="product-category">{product.brand || '-'}</td>
                        <td className="product-price">${formatPrice(product.price)}</td>
                        <td className="product-category">{product.categoryName || 'Sin categoría'}</td>
                        <td className="product-store">{product.storeName || 'Sin tienda'}</td>
                        <td className="product-status">
                          {product.isActive ? (
                            <span className="status-active">Activo</span>
                          ) : (
                            <span className="status-inactive">Inactivo</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleShowPriceHistory(product)}
                              title="Ver historial de precios"
                              className="action-btn"
                            >
                              <FaChartLine />
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowForm(true);
                              }}
                              title="Editar producto"
                              className="action-btn"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              title="Eliminar producto"
                              className="action-btn"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </InfiniteScroll>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Formulario */}
      <ProductForm
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={() => {
          loadProducts();
          setShowForm(false);
          setSelectedProduct(null);
        }}
      />

      {/* Modal de Historial de Precios */}
      <PriceHistoryChart
        show={showPriceHistory}
        onHide={() => {
          setShowPriceHistory(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />

      {/* Modal de Resumen de Gastos */}
      <ExpenseSummary
        show={showExpenseSummary}
        onHide={() => setShowExpenseSummary(false)}
        userId={user.uid}
      />
    </Container>
  );
} 