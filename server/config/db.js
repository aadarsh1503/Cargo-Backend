// config/db.js
const mysql = require('mysql2/promise');

console.log('🔄 Initializing MySQL connection pool...');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    // Default settings that you already have, which are good
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    // --- NEW & IMPORTANT SETTINGS FOR PRODUCTION STABILITY ---
    
    // Enable keep-alive packets to prevent idle timeout disconnections.
    // This is the most critical setting for fixing ECONNRESET.
    enableKeepAlive: true,

    // How long (in milliseconds) to wait before sending the first keep-alive packet.
    keepAliveInitialDelay: 10000,

    // (Optional but recommended) How long (in milliseconds) an idle connection 
    // can be in the pool before it's automatically closed.
    idleTimeout: 60000 
});

// Test MySQL connection on startup
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL connection pool is active and ready.');
        connection.release();
    } catch (error) {
        // Log the detailed error
        console.error('❌ FATAL: Failed to connect to MySQL database on startup.', error);
        // Exit the process with an error code, which is good practice
        process.exit(1);
    }
})();

module.exports = pool;