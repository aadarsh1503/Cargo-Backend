const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test MySQL connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL is connected');
        connection.release();
    } catch (error) {
        console.error('❌ Failed to connect to MySQL:', error);
        process.exit(1); // Exit if DB connection fails
    }
})();

module.exports = pool;