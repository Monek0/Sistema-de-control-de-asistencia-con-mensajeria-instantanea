const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool.query('SELECT 1')
    .then(() => console.log(`Conexión verificada a PostgreSQL (${isProduction ? 'Producción' : 'Local'})`))
    .catch(err => console.error('Error conectando a la base de datos:', err));


module.exports = pool;
