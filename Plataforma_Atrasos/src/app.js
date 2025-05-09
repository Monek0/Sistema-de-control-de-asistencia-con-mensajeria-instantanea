require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Rutas
const authRoutes = require('./routes/authRoutes');
const atrasosRoutes = require('./routes/atrasosRoutes');
const justificativoRoutes = require('./routes/justificativoRoutes');
const metricsRoutes = require('./routes/metricsRoutes');

const app = express();

// Configuración de CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.FRONTEND_URL_PROD
].filter(Boolean);
console.log('CORS allowed origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
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
app.use(express.json()); // ✅ suficiente, no uses bodyParser también

// Archivos estáticos
app.use('/SalidaPDF', express.static(path.join(__dirname, 'SalidaPDF')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// Rutas
app.use('/auth', authRoutes);
app.use('/api', atrasosRoutes);
app.use('/api', justificativoRoutes);
app.use('/api/metrics', metricsRoutes);

// Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

const whatsappController = require('./controllers/whatsappController');
whatsappController.setSocket(io);

io.on('connection', (socket) => {
  console.log('Cliente conectado via Socket.IO, ID:', socket.id);
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
