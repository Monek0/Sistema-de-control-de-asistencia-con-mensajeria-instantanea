const { Client, RemoteAuth } = require('whatsapp-web.js');
const { S3 } = require('@aws-sdk/client-s3');
const store = require('wwebjs-aws-s3');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

// Initialize the S3 client
const s3Client = new S3({
  region: 'us-east-2'
});

// Initialize the S3 store
const s3Store = new store.S3Store({
  s3Client,
  bucket: process.env.S3_BUCKET_NAME || 'whatsapp-sessions-bucket'
});

// Function to initialize a WhatsApp client
const initializeWhatsAppClient = async (sessionId = 'default-session') => {
  try {
    console.log(`Initializing WhatsApp client with session ID: ${sessionId}`);
    
    // Set up the browser instance
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    // Create a new client
    const client = new Client({
      authStrategy: new RemoteAuth({
        store: s3Store,
        clientId: sessionId,
        backupSyncIntervalMs: 300000, // Sync with S3 every 5 minutes
      }),
      puppeteer: {
        browser, // Use the browser instance
      }
    });

    // Event handlers
    client.on('qr', (qr) => {
      console.log('QR code received:', qr);
      // You can implement a way to send this QR code to a client application
      // or save it to a file or database
    });

    client.on('ready', () => {
      console.log('WhatsApp client is ready!');
    });

    client.on('remote_session_saved', () => {
      console.log('Session saved to S3!');
    });

    client.on('disconnected', (reason) => {
      console.log('Client was disconnected', reason);
    });

    client.on('authenticated', () => {
      console.log('Client authenticated');
    });

    // Initialize the client
    await client.initialize();
    
    return client;
  } catch (error) {
    console.error('Error initializing WhatsApp client:', error);
    throw error;
  }
};

module.exports = {
  initializeWhatsAppClient
}; 