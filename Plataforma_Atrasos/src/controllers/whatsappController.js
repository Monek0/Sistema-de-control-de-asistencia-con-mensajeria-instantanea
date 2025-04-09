const { Client, MessageMedia, RemoteAuth } = require('whatsapp-web.js');
const fs = require('fs');
const puppeteer = require('puppeteer'); // puppeteer completo
const path = require('path');
const { AwsS3Store } = require('wwebjs-aws-s3');
const {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require('@aws-sdk/client-s3');

let client;
let ioSocket = null; // WebSocket (socket.io) para emitir QR

// Conectar socket.io
const setSocket = (io) => {
  ioSocket = io;
};

// Inicializar cliente WhatsApp
const initializeClient = async () => {
  console.log('Inicializando cliente de WhatsApp con AWS S3 RemoteAuth...');

  // Cliente S3
  const s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  // Store remoto
  const store = new AwsS3Store({
    bucketName: 'plataforma-atrasos-backen-serverlessdeploymentbuck-nqhxx1vlzmed',
    remoteDataPath: 'credentials/',
    s3Client: s3,
    putObjectCommand: PutObjectCommand,
    headObjectCommand: HeadObjectCommand,
    getObjectCommand: GetObjectCommand,
    deleteObjectCommand: DeleteObjectCommand
  });

  // Cliente WhatsApp
  client = new Client({
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    authStrategy: new RemoteAuth({
      clientId: 'plataforma-atrasos-whatsapp',
      store: store,
      dataPath: path.join('/tmp', '.wwebjs_auth'), // ✅ evita ENOENT en Lambda
      backupSyncIntervalMs: 300000
    })
  });

  handleQRGeneration();
  handleAuthentication();
  handleDisconnection();
  handleRemoteSessionSaved();

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

// Sesión remota guardada
const handleRemoteSessionSaved = () => {
  if (!client) return;
  client.on('remote_session_saved', () => {
    console.log('Sesión remota guardada en S3');
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
  handleRemoteSessionSaved,
  sendPDF,
  setSocket
};
