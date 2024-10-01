import React, { useState } from 'react';
import api from '../api';
import { Form, Button, Container, Alert, Image, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ClienteForm = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cliente = { nombre, email, telefono, direccion, password };
    try {
      const response = await api.post('/clientes', cliente);
      setMensaje(`Cliente creado con éxito: ID ${response.data.clienteId}`);
      setNombre('');
      setEmail('');
      setTelefono('');
      setDireccion('');
      setPassword('');
      navigate('/Principal');
    } catch (error) {
      setMensaje('Error al crear el cliente', error);
    }
  };

  return (
    <Container>
        <Image src="cafe.png" fluid/>
      <h2 className="my-4">Registrarse como nuevo cliente</h2>
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      <Row>
        <Col md={3}></Col>
        <Col md={6}>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="nombre">
          <Form.Label>Nombre y Apellido</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ingresa tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </Form.Group>
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
        <Form.Group controlId="telefono">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="phone"
            placeholder="Ingresa tu teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="direccion">
          <Form.Label>Dirección</Form.Label>
          <Form.Control
            type="text"
            placeholder="Ingresa tu dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Ingresa una contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Crear Cliente
        </Button>
      </Form>
      </Col>
      <Col md={3}></Col>
      </Row>
    </Container>
  );
};

export default ClienteForm;