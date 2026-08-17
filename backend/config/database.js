const path = require('node:path');

const DEFAULT_DATABASE_PORT = 3307;

const parsePort = (value, fallback = DEFAULT_DATABASE_PORT) => {
  const port = Number.parseInt(value, 10);
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : fallback;
};

const createDatabaseConfig = (environment = process.env, nodeEnv = 'development') => {
  if (nodeEnv === 'production') {
    const requiredVariables = ['DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missingVariables = requiredVariables.filter(
      (variableName) => !environment[variableName]
    );

    if (missingVariables.length > 0) {
      throw new Error(
        `Missing required production database settings: ${missingVariables.join(', ')}`
      );
    }
  }

  return {
    username: environment.DB_USER || 'root',
    password: environment.DB_PASSWORD || '',
    database:
      environment.DB_NAME ||
      (nodeEnv === 'test' ? 'lnhs_sis_test' : 'lnhs-sis'),
    host: environment.DB_HOST || '127.0.0.1',
    port: parsePort(environment.DB_PORT, DEFAULT_DATABASE_PORT),
    dialect: 'mysql',
    logging: false,
  };
};

const loadLocalEnvironment = (
  filePath = path.resolve(__dirname, '..', '.env')
) => {
  if (typeof process.loadEnvFile !== 'function') {
    return;
  }

  try {
    process.loadEnvFile(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

module.exports = {
  createDatabaseConfig,
  loadLocalEnvironment,
  parsePort,
};
