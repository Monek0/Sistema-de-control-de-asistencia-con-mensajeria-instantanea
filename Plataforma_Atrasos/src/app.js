const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('express').json;
const serverless = require('@vendia/serverless-express'); // Librería para AWS Lambda

// Rutas
const authRoutes = require('./routes/authRoutes');
const atrasosRoutes = require('./routes/atrasosRoutes');
const justificativoRoutes = require('./routes/justificativoRoutes');

dotenv.config();

const app = express();

// Configuración de middlewares
app.use(cors());
app.use(bodyParser());
app.use(express.json());

// Archivos estáticos
app.use('/SalidaPDF', express.static(path.join(__dirname, 'SalidaPDF')));

// Rutas
app.use('/auth', authRoutes);
app.use('/api', atrasosRoutes);
app.use('/api', justificativoRoutes);
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// Exportar la aplicación para AWS Lambda
module.exports.handler = serverless({ app });
