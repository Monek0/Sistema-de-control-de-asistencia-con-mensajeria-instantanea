require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('express').json;
const http = require('http');
const { Server } = require('socket.io');

// Rutas
const authRoutes = require('./routes/authRoutes');
const atrasosRoutes = require('./routes/atrasosRoutes');
const justificativoRoutes = require('./routes/justificativoRoutes');

dotenv.config();

const app = express();

// Configuración de CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3001',
  process.env.FRONTEND_URL_PROD
].filter(Boolean);
console.log('CORS allowed origins:', allowedOrigins);
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
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

// Aquí se crea el servidor HTTP y se integra con Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // O usa '*' para pruebas
    methods: ['GET', 'POST']
  }
});

// Configura Socket.IO en tu controlador
const whatsappController = require('./controllers/whatsappController');
whatsappController.setSocket(io);

io.on('connection', (socket) => {
  console.log('Cliente conectado via Socket.IO, ID:', socket.id);
  // Puedes emitir un último QR o cualquier mensaje a nuevos clientes si lo deseas.
});

// Arranca el servidor en el puerto deseado
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Exporta app si lo necesitas para tests o middleware
module.exports = app;
