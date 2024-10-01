import React, { useState } from 'react';
import { Form, Button, Container, Alert, Image, Row, Col } from 'react-bootstrap';
import api from '../api';
import { useNavigate } from 'react-router-dom';


const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { email, password });
      // Guardar el token y Id de cliente y redirigir
      localStorage.setItem('token', response.data.clienteId);
      localStorage.setItem('cliente_id', response.data.clienteId); 
      navigate('/Principal'); // Redirigir al dashboard después del login
    } catch (error) {
      setMensaje('Email o contraseña incorrectos');
    }
  };

  const handleRegistrarse = () => {
    navigate('/cliente');
  };

  return (
   
    <Container>
      <Image src="cafe.png" fluid/>
      <h2 className="my-4">Iniciar Sesión</h2>
      {mensaje && <Alert variant="danger">{mensaje}</Alert>}
      <Row>
        <Col xs={3} md={3} className="mx-auto"></Col>
        <Col xs={6} md={6} className="mx-auto">
      <Form onSubmit={handleSubmit} >
        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Ingresa tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Iniciar Sesión
        </Button>
        <Button variant="secondary" onClick={handleRegistrarse} className="mt-3 ms-2">
        Registrarse
      </Button>
      </Form>
      </Col>
      <Col xs={3} md={3} className="mx-auto"></Col>
      </Row>
    </Container>
  );
};

export default LoginForm;
