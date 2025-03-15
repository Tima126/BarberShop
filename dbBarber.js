// db.js
const mysql = require('mysql2');

// Создаем подключение к базе данных
const pool = mysql.createPool({
    host: 'localhost', 
    user: 'root',      
    password: 'Tima2006.',
    database: 'dbbarbershop', // Имя базы данных
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise(); // Экспортируем Promise-based интерфейс