const express = require('express');
const db = require('./db');
const cors = require('cors'); 
const bcrypt = require('bcrypt'); //Encriptado del password
const jwt = require('jsonwebtoken'); //generador de token

const app = express();

app.use(cors());
app.use(express.json());

//Crear cliente
app.post('/clientes', async (req, res) => {
  const { nombre, email, telefono, direccion, password } = req.body;

  if (!nombre || !email || !telefono || !direccion || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const encriptPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO clientes (nombre, email, telefono, direccion, password) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [nombre, email, telefono, direccion, encriptPassword]);
    res.status(201).json({ message: 'Cliente creado', clienteId: result.insertId });
  } catch (err) {
    console.error('Error al crear cliente:', err);
    res.status(500).json({ message: 'Error al crear cliente' });
  }
});

// Crear un pedido
app.post('/confirmarPedidos', async (req, res) => {
  const { cliente_id, productos } = req.body;
  let total = 0;

  if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'Debe proporcionar una lista de productos' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Consultar stock de cada producto
    const idsProductos = productos.map(p => p.producto_id);
    const sqlConsultarStock = 'SELECT id, stock, precio FROM productos WHERE id IN (?)';
    const [results] = await connection.query(sqlConsultarStock, [idsProductos]);

    // Verificar disponibilidad de stock y calcular el total
    const stockInsuficiente = [];
    productos.forEach(item => {
      const producto = results.find(p => p.id === item.producto_id);
      if (!producto || producto.stock < item.cantidad) {
        stockInsuficiente.push(producto.id);
      } else {
        total += item.cantidad * producto.precio;
      }
    });

    // Si hay stock insuficiente, cancelar la transacción
    if (stockInsuficiente.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Stock insuficiente para algunos productos', stockInsuficiente });
    }

    // Descontar el stock
    for (const item of productos) {
      const producto = results.find(p => p.id === item.producto_id);
      const nuevoStock = producto.stock - item.cantidad;
      const sqlActualizarStock = 'UPDATE productos SET stock = ? WHERE id = ?';
      await connection.query(sqlActualizarStock, [nuevoStock, producto.id]);
    }

    // Crear el pedido
    const sqlCrearPedido = 'INSERT INTO pedidos (cliente_id, total) VALUES (?, ?)';
    const [result] = await connection.query(sqlCrearPedido, [cliente_id, total]);

    const pedidoId = result.insertId;

    // Crear detalles del pedido
    const sqlDetallesPedido = 'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES ?';
    const detalles = productos.map(p => [pedidoId, p.producto_id, p.cantidad, results.find(prod => prod.id === p.producto_id).precio]);
    await connection.query(sqlDetallesPedido, [detalles]);

    // Confirmar la transacción
    await connection.commit();
    res.status(201).json({ message: 'Pedido creado con éxito', pedidoId });

  } catch (err) {
    console.error('Error al crear el pedido:', err);
    if (connection) {
      await connection.rollback(); // Hacer rollback si hubo un error durante la transacción
    }
    res.status(500).json({ message: 'Error al crear el pedido' });
  } finally {
    if (connection) {
      connection.release(); 
    }
  }
});


// Valida usuario y password
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const [rows] = await db.query('SELECT * FROM clientes WHERE email = ?', [email]);
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Email o contraseña incorrectos' });
      }
      
      const cliente = rows[0];
      const isMatch = await bcrypt.compare(password, cliente.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email o contraseña incorrectos' });
      }
  
      // Generar un token o retornar el clienteId
      const token = jwt.sign({ id: cliente.id }, 'secreto', { expiresIn: '1h' });
      res.status(200).json({ message: 'Inicio de sesión exitoso', token, clienteId: cliente.id });
  
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      res.status(500).json({ message: 'Error al iniciar sesión' });
    }
  });

  //Listar productos
  app.get('/productos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos WHERE stock > 0');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});


const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
