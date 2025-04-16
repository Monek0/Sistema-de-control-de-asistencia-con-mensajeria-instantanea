const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

let client;
let ioSocket = null; // WebSocket (socket.io) para emitir QR

// Conectar socket.io
const setSocket = (io) => {
  ioSocket = io;
};

// Inicializar cliente WhatsApp
const initializeClient = async () => {
  console.log('Inicializando cliente de WhatsApp con LocalAuth...');

  // Cliente WhatsApp con autenticación local
  client = new Client({
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    authStrategy: new LocalAuth({
      clientId: 'plataforma-atrasos-whatsapp',
      dataPath: path.join('/tmp', '.wwebjs_auth') // Ruta para almacenar los datos de sesión
    })
  });

  handleQRGeneration();
  handleAuthentication();
  handleDisconnection();

  client.initialize();
};

// QR generado → enviar por WebSocket (base64)
const handleQRGeneration = () => {
  if (!client) return;

  client.on('qr', async (qr) => {
    console.log('QR generado. Emitiendo al frontend...');
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

// Autenticación
const handleAuthentication = () => {
  if (!client) return;

  client.on('authenticated', () => {
    console.log('Cliente autenticado');
    if (ioSocket) ioSocket.emit('authenticated');
  });

  client.on('auth_failure', () => {
    console.log('Fallo de autenticación. Reiniciando...');
    if (ioSocket) ioSocket.emit('auth_failure');
    client.initialize();
  });
};

// Desconexión
const handleDisconnection = () => {
  if (!client) return;

  client.on('disconnected', (reason) => {
    console.log('Desconectado:', reason);
    if (ioSocket) ioSocket.emit('disconnected', reason);
    client.destroy();
    client.initialize();
  });
};

// Enviar PDF por WhatsApp
const sendPDF = async (number, filePath) => {
  try {
    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
    console.log(`Enviando PDF a ${formattedNumber}: ${filePath}`);

    if (filePath && fs.existsSync(filePath)) {
      const media = await MessageMedia.fromFilePath(filePath);
      await client.sendMessage(formattedNumber, media)
      console.log('PDF enviado exitosamente');
    } else {
      console.error('El archivo no existe o la ruta es incorrecta');
    }
  } catch (error) {
    console.error('Error al enviar el PDF:', error);
  }
};

// Exportaciones
module.exports = {
  initializeClient,
  handleQRGeneration,
  handleAuthentication,
  handleDisconnection,
  sendPDF,
  setSocket
};