const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

const {
  createDatabaseConfig,
  loadLocalEnvironment,
} = require('../../config/database');

const TEST_DATABASE_PATTERN = /^lnhs_sis_test_[a-z0-9_]+$/;

const assertSafeTestDatabaseName = (databaseName) => {
  if (!TEST_DATABASE_PATTERN.test(databaseName)) {
    throw new Error(
      `Refusing to manage unsafe test database name: ${databaseName}`
    );
  }
};

const createAdminConnection = async () => {
  loadLocalEnvironment();
  const config = createDatabaseConfig(process.env, 'test');

  return mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    multipleStatements: true,
  });
};

const withTestDatabase = async (databaseName, callback) => {
  assertSafeTestDatabaseName(databaseName);
  const adminConnection = await createAdminConnection();
  let sequelize;

  try {
    await adminConnection.query(`DROP DATABASE IF EXISTS \`${databaseName}\``);
    await adminConnection.query(
      `CREATE DATABASE \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );

    const config = createDatabaseConfig(
      { ...process.env, DB_NAME: databaseName },
      'test'
    );
    sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      config
    );
    await sequelize.authenticate();

    return await callback({ adminConnection, databaseName, sequelize });
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
    await adminConnection.query(`DROP DATABASE IF EXISTS \`${databaseName}\``);
    await adminConnection.end();
  }
};

module.exports = {
  assertSafeTestDatabaseName,
  createAdminConnection,
  withTestDatabase,
};
