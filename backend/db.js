const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASS || process.env.MYSQLPASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'railway',
  port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

if (process.env.DB_SSL === 'true' || process.env.MYSQLSSL === 'true') {
  config.ssl = { rejectUnauthorized: true };
}

console.log('DB config:', { host: config.host, user: config.user, database: config.database, port: config.port });

const pool = mysql.createPool(config);

module.exports = pool;
