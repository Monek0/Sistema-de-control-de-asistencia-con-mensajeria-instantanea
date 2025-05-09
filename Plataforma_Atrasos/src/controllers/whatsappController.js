const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

let client = null;
let ioSocket = null;
let isInitializing = false;
let isReady = false;

const setSocket = (io) => {
  ioSocket = io;

  io.on('connection', (socket) => {
    console.log('🟢 Cliente conectado al WebSocket');

    socket.on('logout', async () => {
      console.log('🔴 Logout solicitado desde el frontend');
      if (client) {
        try {
          await client.logout();
          await client.destroy();
          client = null;
          isInitializing = false;
          isReady = false;

          const sessionPath = path.join('/tmp', '.wwebjs_auth', 'plataforma-atrasos-whatsapp');
          const cachePath = path.join(__dirname, 'Plataforma_Atrasos', '.wwebjs_cache');
          fs.rmSync(sessionPath, { recursive: true, force: true });
          fs.rmSync(cachePath, { recursive: true, force: true });

          console.log('✅ Sesión cerrada y datos eliminados');
          socket.emit('disconnected', 'Sesión cerrada manualmente');

          await initializeClient(); // Reinicia limpio
        } catch (err) {
          console.error('❌ Error al cerrar sesión:', err);
        }
      }
    });

    socket.on('get_status', () => {
      if (isReady && client?.info?.wid) {
        console.log('🔍 Estado solicitado → Cliente autenticado');
        socket.emit('authenticated');
      } else {
        console.log('🔍 Estado solicitado → Cliente no autenticado');
        socket.emit('not_authenticated');
      }
    });
  });
};

const initializeClient = async () => {
  if (isInitializing || isReady) {
    console.log('⏳ Cliente ya está inicializándose o listo, se omite');
    return;
  }

  isInitializing = true;
  console.log('⚙️ Inicializando cliente de WhatsApp con LocalAuth...');

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

  registerEvents(client);
  client.initialize();
};

const registerEvents = (clientInstance) => {
  clientInstance.on('qr', async (qr) => {
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

  clientInstance.on('authenticated', () => {
    console.log('✅ Cliente autenticado');
    isReady = true;
    isInitializing = false;
    if (ioSocket) ioSocket.emit('authenticated');
  });

  clientInstance.on('auth_failure', () => {
    console.log('❌ Fallo de autenticación');
    isReady = false;
    isInitializing = false;
    if (ioSocket) ioSocket.emit('auth_failure');
  });

  clientInstance.on('ready', () => {
    console.log('📱 WhatsApp listo para usar');
    isReady = true;
    isInitializing = false;
    if (ioSocket) ioSocket.emit('ready');
  });

  clientInstance.on('disconnected', async (reason) => {
    console.log('⚠️ Desconectado:', reason);
    isReady = false;
  
    if (isInitializing) {
      console.log('⏳ Ya se está reinicializando tras desconexión');
      return;
    }
  
    isInitializing = true;
    if (ioSocket) ioSocket.emit('disconnected', reason);
  
    try {
      await clientInstance.destroy();
      client = null;
      await initializeClient();
    } catch (err) {
      console.error('❌ Error reiniciando cliente:', err);
      isInitializing = false;
    }
  });
  
};

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
