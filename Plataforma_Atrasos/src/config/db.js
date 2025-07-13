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

const getClient = async () => {
    const client = await pool.connect();
    await client.query(`SET search_path TO ${process.env.DB_SCHEMA || 'public'}`);
    return client;
};

module.exports = { getClient };
