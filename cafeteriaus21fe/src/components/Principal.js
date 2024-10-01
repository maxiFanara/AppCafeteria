import React, {useState, useEffect} from 'react';
import api from '../api';
import { Button, Container, Image, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handlePedido = () => {
    navigate('/pedidos');
  };

  const handleAdministrar = () => {
    navigate('/administrar');
  };

  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);

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
    
  useEffect(() => {
    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
    setCarrito(carritoGuardado);
  }, []);

  // Función para agregar productos al carrito
  const agregarAlCarrito = (producto) => {
    const productoExistente = carrito.find((item) => item.id === producto.id);

    let nuevoCarrito;
    if (productoExistente) {
      nuevoCarrito = carrito.map((item) =>
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      );
    } else {
      nuevoCarrito = [...carrito, { ...producto, cantidad: 1 }];
    }

    // Actualizar el estado del carrito y localStorage
    setCarrito(nuevoCarrito);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
  };
  
  const totalProductosEnCarrito = carrito.reduce((total, producto) => total + producto.cantidad, 0);



  return (
    <Container>
        <Image src="cafe.png" fluid/>
      <h2 className="my-4">Mira nuestras opciones!!</h2>
      <Row>
      <Col md={{ span: 6, offset: 3 }}>
      <Button variant="primary" onClick={handlePedido} className="m-2">
        Hacer Pedido
      </Button>
      </Col>
      <Col md={{ span: 3, offset: 0 }}>
      <p>Productos en el carrito: {totalProductosEnCarrito} </p>
      </Col>
      
     {/* <Button variant="secondary" onClick={handleAdministrar} className="m-2">
        Administra tus datos
      </Button>*/}
      </Row>
      <Row>
        {productos.map((producto) => (
          <Col key={producto.id} sm={12} md={6} lg={4} className="mb-4">
            <Card className="producto-card">
              <div className="image-container">
              <Card.Img className="producto-img" variant="top" src={`/menu/${producto.id}.png`} alt={producto.nombre} />
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title>{producto.nombre}</Card.Title>
                <Card.Text className="flex-grow.1">
                  Precio: ${producto.precio}
                  <br />
                  Stock disponible: {producto.stock}
                </Card.Text>
                <Button variant="primary" className="mt-auto" onClick={() => agregarAlCarrito(producto)}>Agregar al Carrito</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
    
  );
};

export default Dashboard;
