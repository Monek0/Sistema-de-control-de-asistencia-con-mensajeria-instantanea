// src/index.js
const app = require('./app'); // Importa app.js
const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});
