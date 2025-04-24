const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

let client;
let ioSocket = null;

// Asignar el socket.io desde el servidor
const setSocket = (io) => {
  ioSocket = io;

  // Escuchar eventos desde el frontend
  io.on('connection', (socket) => {
    console.log('🟢 Cliente conectado al WebSocket');

    socket.on('logout', async () => {
      console.log('🔴 Logout solicitado desde el frontend');
      if (client) {
        try {
          await client.logout();
          await client.destroy();

          // Borrar datos de sesión (auth y cache)
          const sessionPath = path.join('/tmp', '.wwebjs_auth', 'plataforma-atrasos-whatsapp');
          const cachePath = path.join(__dirname, 'Plataforma_Atrasos', '.wwebjs_cache');

          fs.rmSync(sessionPath, { recursive: true, force: true });
          fs.rmSync(cachePath, { recursive: true, force: true });

          console.log('✅ Sesión cerrada y datos eliminados');

          socket.emit('disconnected', 'Sesión cerrada manualmente');

          // Reiniciar cliente para generar nuevo QR
          initializeClient();
        } catch (err) {
          console.error('❌ Error al cerrar sesión:', err);
        }
      }
    });
    socket.on('get_status', () => {
      if (client && client.info && client.info.wid) {
        console.log('🔍 Estado solicitado → Cliente autenticado');
        socket.emit('authenticated');
      } else {
        console.log('🔍 Estado solicitado → Cliente no autenticado');
      }
    });
    
  });
};

// Inicializar cliente WhatsApp
const initializeClient = async () => {
  console.log('Inicializando cliente de WhatsApp con LocalAuth...');

  client = new Client({
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    authStrategy: new LocalAuth({
      clientId: 'plataforma-atrasos-whatsapp',
      dataPath: path.join('/tmp', '.wwebjs_auth')
    })
  });

  handleQRGeneration();
  handleAuthentication();
  handleDisconnection();

  client.initialize();
};

// Emitir QR al frontend
const handleQRGeneration = () => {
  client.on('qr', async (qr) => {
    if (ioSocket) {
      const QRCode = require('qrcode');
      try {
        const qrImage = await QRCode.toDataURL(qr);
        ioSocket.emit('qr', qrImage);
      } catch (err) {
        console.error('Error generando QR base64:', err);
      }
    }
  });
};

// Emitir eventos de autenticación
const handleAuthentication = () => {
  client.on('authenticated', () => {
    console.log('✅ Cliente autenticado');
    if (ioSocket) ioSocket.emit('authenticated');
  });

  client.on('auth_failure', () => {
    console.log('❌ Fallo de autenticación');
    if (ioSocket) ioSocket.emit('auth_failure');
  });

  client.on('ready', () => {
    console.log('📱 WhatsApp listo para usar');
    if (ioSocket) ioSocket.emit('ready');
  });
};

// Reintentar en caso de desconexión
const handleDisconnection = () => {
  client.on('disconnected', (reason) => {
    console.log('⚠️ Desconectado:', reason);
    if (ioSocket) ioSocket.emit('disconnected', reason);

    client.destroy().then(() => {
      console.log('🔄 Reiniciando cliente...');
      initializeClient();
    });
  });
};

// Enviar PDF
const sendPDF = async (number, filePath) => {
  try {
    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
    console.log(`📤 Enviando PDF a ${formattedNumber}`);

    if (filePath && fs.existsSync(filePath)) {
      const media = await MessageMedia.fromFilePath(filePath);
      await client.sendMessage(formattedNumber, media);
      console.log('✅ PDF enviado');
    } else {
      console.error('❌ El archivo no existe o la ruta es incorrecta');
    }
  } catch (error) {
    console.error('❌ Error al enviar PDF:', error);
  }
};

module.exports = {
  initializeClient,
  setSocket,
  sendPDF
};