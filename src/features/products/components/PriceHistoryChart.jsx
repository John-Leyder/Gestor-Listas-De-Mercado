import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { productService } from '../services/productService';
import '../styles/PriceHistoryChart.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PriceHistoryChart({ show, onHide, product }) {
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product && show) {
      loadPriceHistory();
    }
  }, [product, show]);

  const loadPriceHistory = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Cargando historial de precios para el producto:', product.id);
      const history = await productService.getPriceHistory(product.id);
      console.log('Historial de precios cargado:', history);
      setPriceHistory(history);
    } catch (err) {
      setError('Error al cargar el historial de precios');
      console.error('Error al cargar el historial de precios:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: priceHistory.map(item => 
      new Date(item.date.seconds * 1000).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Precio',
        data: priceHistory.map(item => item.price),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: `Historial de Precios - ${product?.name}`,
        font: {
          size: 18
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Precio ($)',
          font: {
            size: 14
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Fecha',
          font: {
            size: 14
          }
        }
      }
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title>Historial de Precios</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light">
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <div>Cargando historial...</div>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : priceHistory.length === 0 ? (
          <div className="text-center py-4">No hay historial de precios disponible</div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </Modal.Body>
      <Modal.Footer className="bg-dark">
        <Button variant="secondary" onClick={onHide} className="w-100">
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
} 