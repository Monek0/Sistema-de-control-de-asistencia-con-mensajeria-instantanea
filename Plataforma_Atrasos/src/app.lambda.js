const awsLambdaFastify = require('@vendia/serverless-express');
const app = require('./app'); // Asegúrate de que este archivo exporte una instancia de express()

// Crear el handler a partir de tu app de Express
const handler = awsLambdaFastify({ app });

// Exportar para AWS Lambda
exports.handler = handler;

// Para desarrollo local (opcional)
if (require.main === module) {
  console.log('Starting AWS Lambda handler in standalone mode');

  const keepAlive = () => {
    setTimeout(keepAlive, 60000);
  };
  keepAlive();
}
