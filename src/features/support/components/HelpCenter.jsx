import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../../contexts/AuthContext';
import emailjs from '@emailjs/browser';
import { FaEnvelope, FaQuestionCircle, FaBook } from 'react-icons/fa';

// Constantes de EmailJS
const EMAILJS_SERVICE_ID = 'service_uamzzub';
const EMAILJS_TEMPLATE_ID = 'template_isyunsi';
const EMAILJS_PUBLIC_KEY = 'fzeRVY9NUPiHFVuDq';

export default function HelpCenter() {
  const { user } = useAuth();
  const form = useRef();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    title: '',
    message: ''
  });

  useEffect(() => {
    // Inicializar EmailJS
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      console.log('EmailJS inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar EmailJS:', error);
      setMessage({
        type: 'danger',
        text: 'Error al inicializar el servicio de correo. Por favor, recarga la página.'
      });
    }
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar mensaje de error cuando el usuario empieza a escribir
    if (message.type === 'danger') {
      setMessage({ type: '', text: '' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: user?.displayName || '',
      email: user?.email || '',
      title: '',
      message: ''
    });
  };

  // Preguntas frecuentes
  const faqs = [
    {
      question: '¿Cómo agrego un nuevo producto?',
      answer: 'Ve a la sección "Productos", haz clic en el botón "Agregar Producto" y completa el formulario con los detalles del producto.'
    },
    {
      question: '¿Cómo veo el historial de precios?',
      answer: 'En la lista de productos, encuentra el producto deseado y haz clic en el botón de "Ver Historial".'
    },
    {
      question: '¿Cómo cambio mi contraseña?',
      answer: 'Ve a tu perfil haciendo clic en tu correo electrónico en la barra de navegación y selecciona "Cambiar Contraseña".'
    },
    {
      question: '¿Cómo creo categorías personalizadas?',
      answer: 'En la sección "Categorías", puedes elegir entre categorías predefinidas o crear una nueva haciendo clic en "Crear categoría personalizada".'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.name.trim()) {
      setMessage({
        type: 'danger',
        text: 'Por favor ingresa tu nombre'
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      setMessage({
        type: 'danger',
        text: 'Por favor ingresa un email válido'
      });
      return;
    }

    if (!formData.title.trim()) {
      setMessage({
        type: 'danger',
        text: 'Por favor ingresa un asunto'
      });
      return;
    }

    if (!formData.message.trim()) {
      setMessage({
        type: 'danger',
        text: 'Por favor ingresa un mensaje'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('Iniciando envío de correo...');
      
      const templateParams = {
        from_name: formData.name,
        to_name: formData.name,
        reply_to: formData.email,
        to_email: formData.email,
        subject: formData.title,
        message: formData.message
      };

      console.log('Parámetros del template:', templateParams);

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('Respuesta de EmailJS:', response);

      if (response.status === 200) {
        setMessage({
          type: 'success',
          text: '¡Mensaje enviado con éxito! Revisa tu correo electrónico.'
        });
        resetForm();
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error detallado al enviar el mensaje:', error);
      
      let errorMessage = 'Hubo un error al enviar el mensaje. ';
      
      if (error.text) {
        errorMessage += error.text;
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      setMessage({
        type: 'danger',
        text: errorMessage + ' Por favor, intenta nuevamente o contacta al soporte.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Centro de Ayuda</h2>
      
      <Row className="g-4">
        {/* Formulario de Contacto */}
        <Col md={6}>
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <FaEnvelope className="me-2" />
              Contáctanos
            </Card.Header>
            <Card.Body>
              {message.text && (
                <Alert variant={message.type} className="mb-3">
                  {message.text}
                </Alert>
              )}
              
              <Form ref={form} onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Tu Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Tu nombre"
                    isInvalid={message.type === 'danger' && !formData.name.trim()}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tu Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="tu@email.com"
                    isInvalid={message.type === 'danger' && !validateEmail(formData.email)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Asunto</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="¿En qué podemos ayudarte?"
                    isInvalid={message.type === 'danger' && !formData.title.trim()}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mensaje</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    placeholder="Describe tu problema o pregunta..."
                    isInvalid={message.type === 'danger' && !formData.message.trim()}
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? 'Enviando mensaje...' : 'Enviar Mensaje'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* FAQs */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="bg-primary text-white">
              <FaQuestionCircle className="me-2" />
              Preguntas Frecuentes
            </Card.Header>
            <Card.Body>
              <div className="faqs-accordion">
                {faqs.map((faq, index) => (
                  <div key={index} className="mb-3">
                    <h5 className="text-primary">{faq.question}</h5>
                    <p className="text-muted">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Guía de Usuario */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <FaBook className="me-2" />
              Guía de Usuario
            </Card.Header>
            <Card.Body>
              <Row xs={1} md={2} lg={3} className="g-4">
                <Col>
                  <h5>Gestión de Productos</h5>
                  <ul>
                    <li>Agregar nuevos productos</li>
                    <li>Editar productos existentes</li>
                    <li>Ver historial de precios</li>
                    <li>Filtrar y buscar productos</li>
                  </ul>
                </Col>
                <Col>
                  <h5>Categorías y Tiendas</h5>
                  <ul>
                    <li>Crear categorías personalizadas</li>
                    <li>Administrar tiendas</li>
                    <li>Organizar productos</li>
                    <li>Comparar precios</li>
                  </ul>
                </Col>
                <Col>
                  <h5>Reportes y Análisis</h5>
                  <ul>
                    <li>Ver resumen de gastos</li>
                    <li>Análisis por categoría</li>
                    <li>Comparativa de tiendas</li>
                    <li>Exportar datos</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
} 