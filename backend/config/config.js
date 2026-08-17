const {
  createDatabaseConfig,
  loadLocalEnvironment,
} = require('./database');

loadLocalEnvironment();

const activeEnvironment = process.env.NODE_ENV || 'development';

module.exports = {
  development: createDatabaseConfig(process.env, 'development'),
  test: createDatabaseConfig(process.env, 'test'),
  production: createDatabaseConfig(
    process.env,
    activeEnvironment === 'production' ? 'production' : 'development'
  ),
};
