// src/components/PedidosForm.js
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Table, Alert } from 'react-bootstrap';
import api from '../api';
import '../App.css';
import { navigate, useNavigate } from 'react-router-dom';

const PedidosForm = () => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [productosPedido, setProductosPedido] = useState([]);
  const [montoTotal, setMontoTotal] = useState(0);
  const [ticket, setTicket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const response = await api.get('/productos');
        setProductos(response.data);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };

    obtenerProductos();
  }, []);

  // Obtener productos del carrito si están en localStorage
  useEffect(() => {
    const carritoLocal = JSON.parse(localStorage.getItem('carrito')) || [];
    setCarrito(carritoLocal);
    setProductosPedido(carritoLocal);
  }, []);

  // Calcular el monto total del pedido
  useEffect(() => {
    const total = productosPedido.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
    setMontoTotal(total);
  }, [productosPedido]);

  // Agregar productos manualmente al pedido
  const agregarProductoManual = (id) => {
    const producto = productos.find((p) => p.id === parseInt(id));
    if (producto) {
      setProductosPedido([...productosPedido, { ...producto, cantidad: 1 }]);
    }
  };

  const vaciarCarrito = () => {
    setProductosPedido([]);
    localStorage.removeItem('carrito');
  };

  const volverPrincipal = () =>{
    navigate('/Principal')
  }; 

  // Generar y mostrar ticket
  const generarTicket = async () => {
    try {
      // Preparar los productos para enviarlos al backend
      const productosPedidoFormateados = productosPedido.map((p) => ({
        producto_id: p.id,   
        cantidad: p.cantidad, 
        precio_unitario: p.precio, 
      }));
      const cliente_id = localStorage.getItem('cliente_id');
      console.log("El id de usuario es: ", cliente_id);
      // Crear el cuerpo de la solicitud que será enviado al backend
      const dataPedido = {
        cliente_id: cliente_id, 
        productos: productosPedidoFormateados, 
      };
  
      // Hacer la solicitud POST al backend para registrar el pedido
      const response = await api.post('/confirmarPedidos', dataPedido);
  
      
      if (response.status === 201) {
        const ticketHtml = `
          <h2>Ticket de Pedido</h2>
          <ul>
            ${productosPedido.map(p => `<li>${p.nombre} (x${p.cantidad}) - $${p.precio * p.cantidad}</li>`).join('')}
          </ul>
          <p>Total: $${montoTotal}</p>
        `;
        setTicket(ticketHtml);
  
        // Enviar el ticket a la impresora
        setTimeout(() => {
          window.print();
        }, 500);
  
        // Redirigir al usuario a la página principal
        setTimeout(() => {
          navigate("/Principal");
        }, 500);
  
        // Limpiar el carrito después de confirmar el pedido
        setCarrito([]);
        localStorage.removeItem('carrito');
      }
    } catch (error) {
      console.error('Error al registrar el pedido:', error);
      alert('Hubo un problema al confirmar el pedido. Por favor, intenta nuevamente.');
    }
  };

  return (
    <Container className="my-4">
      <h2>Formulario de Pedido</h2>

      <Form.Group controlId="productoSelect">
        <Form.Label>Agregar Producto</Form.Label>
        <Form.Select as="select" onChange={(e) => agregarProductoManual(e.target.value)}>
          <option>Seleccione un producto...</option>
          {productos.map((producto) => (
            <option key={producto.id} value={producto.id}>
              {producto.nombre} - ${producto.precio}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {productosPedido.map((producto, index) => (
            <tr key={index}>
              <td>{producto.nombre}</td>
              <td>{producto.cantidad}</td>
              <td>${producto.precio}</td>
              <td>${(producto.precio * producto.cantidad)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h4>Total del Pedido: ${montoTotal}</h4>

      <Button variant="success" onClick={generarTicket}>
        Confirmar Pedido y Emitir Ticket
      </Button>
      <Container className="mt-2">
      <Button variant="warning" onClick={vaciarCarrito}>
        Vaciar carrito
      </Button>
      <Button className="ms-3" variant="warning" onClick={volverPrincipal}>
        Cancelar
      </Button>
      </Container>

      {ticket && (
        <div className="ticket mt-4" dangerouslySetInnerHTML={{ __html: ticket }}></div>
      )}
    </Container>
  );
};

export default PedidosForm;
