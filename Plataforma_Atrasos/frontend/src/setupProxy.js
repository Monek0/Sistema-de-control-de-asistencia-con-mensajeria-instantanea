const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

// Get the API URL from environment variables with fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

console.log('Proxy setup - Using API URL:', API_URL);

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: API_URL,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove /api prefix when forwarding to backend
      },
      headers: {
        Connection: 'keep-alive'
      },
      onProxyRes: function(proxyRes, req, res) {
        // Log proxy responses for debugging
        console.log('Proxy Response Status:', proxyRes.statusCode);
      },
      onError: function(err, req, res) {
        console.error('Proxy Error:', err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
        });
        res.end('Proxy error: ' + err.message);
      }
    })
  );
  
  app.use(
    '/auth',
    createProxyMiddleware({
      target: API_URL,
      changeOrigin: true,
      pathRewrite: {
        '^/auth': '/auth', // Keep auth path
      },
      headers: {
        Connection: 'keep-alive'
      }
    })
  );
}; 