// src/controllers/whatsappController.js
const { Client, MessageMedia, RemoteAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode-terminal');
const fs = require('fs');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const { AwsS3Store } = require('wwebjs-aws-s3');
const {
    S3Client,
    PutObjectCommand,
    HeadObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
} = require('@aws-sdk/client-s3');

let client;

const initializeClient = async () => {
    console.log('Inicializando cliente de WhatsApp con AWS S3 RemoteAuth...');

    const executablePath = await chromium.executablePath;

    // Configure S3 client
    const s3 = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });

    // Create AWS S3 store for auth
    const store = new AwsS3Store({
        bucketName: 'plataforma-atrasos-backen-serverlessdeploymentbuck-nqhxx1vlzmed',
        remoteDataPath: 'credentials/',
        s3Client: s3,
        putObjectCommand: PutObjectCommand,
        headObjectCommand: HeadObjectCommand,
        getObjectCommand: GetObjectCommand,
        deleteObjectCommand: DeleteObjectCommand
    });

    client = new Client({
        puppeteer: {
            executablePath,
            headless: true,
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: chromium.defaultViewport,
        },
        authStrategy: new RemoteAuth({
            clientId: 'plataforma-atrasos-whatsapp',
            store: store,
            backupSyncIntervalMs: 300000 // Backup sync every 5 minutes
        })
    });

    handleQRGeneration();
    handleAuthentication();
    handleDisconnection();
    handleRemoteSessionSaved();

    client.initialize();
};

const handleQRGeneration = () => {
    if (!client) return;
    client.on('qr', (qr) => {
        console.log('Escanea el código QR para conectar con WhatsApp');
        QRCode.generate(qr, { small: true });
    });
};

const handleAuthentication = () => {
    if (!client) return;
    client.on('authenticated', () => {
        console.log('Cliente de WhatsApp autenticado exitosamente');
    });

    client.on('auth_failure', () => {
        console.log('Fallo en la autenticación, reiniciando...');
        client.initialize();
    });
};

const handleDisconnection = () => {
    if (!client) return;
    client.on('disconnected', (reason) => {
        console.log('Cliente de WhatsApp desconectado:', reason);
        client.destroy();
        client.initialize();
    });
};

// Handler for when remote session is saved
const handleRemoteSessionSaved = () => {
    if (!client) return;
    client.on('remote_session_saved', () => {
        console.log('Sesión remota guardada exitosamente en AWS S3');
    });
};

const sendPDF = async (number, filePath) => {
    try {
        const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
        console.log(`Enviando archivo a: ${formattedNumber} con el archivo: ${filePath}`);

        if (filePath && fs.existsSync(filePath)) {
            const media = await MessageMedia.fromFilePath(filePath);
            await client.sendMessage(formattedNumber, media);
            console.log('PDF enviado con éxito');
        } else {
            console.error('Error: La ruta del archivo es incorrecta o el archivo no existe');
        }
    } catch (error) {
        console.error('Error al enviar el PDF por WhatsApp:', error);
    }
};

module.exports = {
    initializeClient,
    handleQRGeneration,
    handleAuthentication,
    handleDisconnection,
    handleRemoteSessionSaved,
    sendPDF,
};
