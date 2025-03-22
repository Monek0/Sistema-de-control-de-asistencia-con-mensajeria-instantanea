// src/controllers/whatsappController.js
const { Client, MessageMedia } = require('whatsapp-web.js');
const QRCode = require('qrcode-terminal');
const fs = require('fs');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

let client;

const initializeClient = async () => {
    console.log('Inicializando cliente de WhatsApp en entorno Lambda...');

    const executablePath = await chromium.executablePath;

    client = new Client({
        puppeteer: {
            executablePath,
            headless: true,
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
        }
    });

    handleQRGeneration();
    handleAuthentication();
    handleDisconnection();

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
    sendPDF,
};
