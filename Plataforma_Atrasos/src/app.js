const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('express').json;

// Rutas
const authRoutes = require('./routes/authRoutes');
const atrasosRoutes = require('./routes/atrasosRoutes');
const justificativoRoutes = require('./routes/justificativoRoutes');

dotenv.config();

const app = express();

// Configuración de CORS mejorada
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.FRONTEND_URL_PROD
].filter(Boolean); // Elimina valores falsos (undefined/null)

console.log('CORS allowed origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (apps móviles, herramientas CLI)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser());
app.use(express.json());

// Archivos estáticos
app.use('/SalidaPDF', express.static(path.join(__dirname, 'SalidaPDF')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// Rutas
app.use('/auth', authRoutes);
app.use('/api', atrasosRoutes);
app.use('/api', justificativoRoutes);

// ✅ Exporta solo la app
module.exports = app;
