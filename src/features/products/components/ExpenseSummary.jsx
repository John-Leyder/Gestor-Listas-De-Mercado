import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Badge } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { productService } from '../services/productService';
import '../styles/ExpenseSummary.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ExpenseSummary({ show, onHide, userId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (show) {
      loadSummary();
    }
  }, [show, selectedYear, selectedMonth]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener productos para el mes seleccionado
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);
      
      const filters = {
        userId: userId,
        startDate: startDate,
        endDate: endDate
      };
      
      const productsData = await productService.getProducts(filters);
      setProducts(productsData);
      
      const data = await productService.getMonthlyExpenseSummary(
        userId,
        selectedYear,
        selectedMonth
      );
      setSummary(data);
    } catch (err) {
      setError('Error al cargar el resumen de gastos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: summary ? Object.keys(summary.byCategory).map(id => summary.byCategory[id].name) : [],
    datasets: [
      {
        label: 'Gasto por Categoría',
        data: summary ? Object.values(summary.byCategory).map(cat => cat.total) : [],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(201, 203, 207, 0.6)'
        ],
        borderColor: [
          'rgb(54, 162, 235)',
          'rgb(255, 99, 132)',
          'rgb(75, 192, 192)',
          'rgb(255, 205, 86)',
          'rgb(153, 102, 255)',
          'rgb(255, 159, 64)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Gastos por Categoría',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Monto ($)',
          font: {
            weight: 'bold'
          }
        }
      }
    }
  };

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Determinar color de precio
  const getPriceColor = (price) => {
    price = parseFloat(price);
    if (price >= 100) return "danger";
    if (price >= 50) return "warning";
    return "success";
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" className="expense-summary-modal">
      <Modal.Header closeButton className="expense-header">
        <Modal.Title>Resumen de Gastos</Modal.Title>
      </Modal.Header>
      <Modal.Body className="expense-body">
        <div className="mb-4 filter-section">
          <Form className="row">
            <Form.Group className="col-md-6 mb-3">
              <Form.Label className="fw-bold">Año</Form.Label>
              <Form.Control
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                min="2000"
                max="2100"
                className="filter-control"
              />
            </Form.Group>
            <Form.Group className="col-md-6 mb-3">
              <Form.Label className="fw-bold">Mes</Form.Label>
              <Form.Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="filter-control"
              >
                {months.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </div>

        {loading ? (
          <div className="text-center py-4 loading-indicator">Cargando resumen...</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : summary ? (
          <>
            <div className="mb-4 summary-section">
              <h5 className="section-title">Resumen General</h5>
              <Table striped bordered hover className="summary-table">
                <tbody>
                  <tr>
                    <th className="table-header">Total de Productos</th>
                    <td className="text-center product-count">
                      <Badge bg="primary" className="count-badge">{summary.totalProducts}</Badge>
                    </td>
                  </tr>
                  <tr>
                    <th className="table-header">Gasto Total</th>
                    <td className="text-center total-amount">
                      <Badge bg="danger" className="amount-badge">${summary.totalAmount.toFixed(2)}</Badge>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>

            <div className="mb-4 chart-section">
              <h5 className="section-title">Gastos por Categoría</h5>
              <div className="chart-container">
                <Bar data={chartData} options={options} />
              </div>
            </div>

            <div className="mb-4 store-section">
              <h5 className="section-title">Detalle por Tienda</h5>
              <Table striped bordered hover className="store-table">
                <thead>
                  <tr className="table-primary">
                    <th className="text-center">Tienda</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-center">Total Gastado</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.byStore).map(([storeId, data]) => (
                    <tr key={storeId} className="store-row">
                      <td className="store-name">{data.name}</td>
                      <td className="text-center">
                        <Badge bg="info" className="count-badge">{data.count}</Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg="danger" className="amount-badge">${data.total.toFixed(2)}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="mb-4 products-section">
              <h5 className="section-title">Lista de Productos del Mes</h5>
              {products.length > 0 ? (
                <Table striped bordered hover responsive className="products-table">
                  <thead>
                    <tr className="table-primary">
                      <th className="text-center">Nombre</th>
                      <th className="text-center">Categoría</th>
                      <th className="text-center">Tienda</th>
                      <th className="text-center">Precio</th>
                      <th className="text-center">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="product-row">
                        <td className="product-name">{product.name}</td>
                        <td className="text-center">
                          <Badge bg="secondary" pill className="category-badge">
                            {product.categoryName || 'Sin categoría'}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg="info" pill className="store-badge">
                            {product.storeName || 'Sin tienda'}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Badge 
                            bg={getPriceColor(product.price)} 
                            className="price-badge"
                          >
                            ${parseFloat(product.price).toFixed(2)}
                          </Badge>
                        </td>
                        <td className="text-center date-cell">
                          {product.createdAt ? formatDate(product.createdAt.toDate ? product.createdAt.toDate() : product.createdAt) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4 no-data">No hay productos registrados para este periodo</div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4 no-data">No hay datos para mostrar</div>
        )}
      </Modal.Body>
      <Modal.Footer className="expense-footer">
        <Button variant="primary" onClick={onHide} className="close-button">
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
} 