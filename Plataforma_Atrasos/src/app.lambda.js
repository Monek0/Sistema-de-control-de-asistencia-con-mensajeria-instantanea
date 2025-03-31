const { handler } = require('./app');
const awsLambdaFastify = require('@vendia/serverless-express');

// Export the handler function
exports.handler = awsLambdaFastify({ handler });

// For local development and direct invocation
if (require.main === module) {
  // This will be used when the script is run directly
  console.log('Starting AWS Lambda handler in standalone mode');
  
  // Configure a simple event loop to keep the container alive
  // This is useful for local development and troubleshooting
  const keepAlive = () => {
    setTimeout(keepAlive, 60000);
  };
  keepAlive();
} 