const { startServer } = require('./src/server');

startServer().catch((error) => {
  console.error('Unable to start server:', error);
  process.exitCode = 1;
});
