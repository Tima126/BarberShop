const mysql = require('mysql2');

// Создание пула соединений
const pool = mysql.createPool({
    host: 'localhost', 
    user: 'root',      
    password: 'Tima2006.',
    database: 'dbbarbershop',                     
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();