const {
  buildDatabaseConfigurations,
  loadLocalEnvironment,
} = require('./database');

loadLocalEnvironment();

module.exports = buildDatabaseConfigurations(process.env);
