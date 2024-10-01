const mysql = require('mysql2');

// Crear un pool de conexiones
const pool = mysql.createPool({
  
});

module.exports = pool.promise();
