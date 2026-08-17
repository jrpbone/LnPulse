const { randomBytes } = require('node:crypto');
const mysql = require('mysql2/promise');
const { escapeId } = require('mysql2');
const { Sequelize } = require('sequelize');

const {
  createDatabaseConfig,
  loadLocalEnvironment,
} = require('../../config/database');

const TEST_DATABASE_PATTERN =
  /^lnhs_sis_test_[a-z0-9_]+_[0-9]+_[a-f0-9]{16}$/;

const createTestDatabaseName = (label) => {
  const safeLabel = String(label)
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20);

  if (!safeLabel) {
    throw new Error('A test database label is required');
  }

  return `lnhs_sis_test_${safeLabel}_${process.pid}_${randomBytes(8).toString('hex')}`;
};

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

const withTestDatabase = async (label, callback) => {
  const databaseName = createTestDatabaseName(label);
  assertSafeTestDatabaseName(databaseName);
  const adminConnection = await createAdminConnection();
  const escapedDatabaseName = escapeId(databaseName);
  let databaseCreated = false;
  let sequelize;

  try {
    await adminConnection.query(
      `CREATE DATABASE ${escapedDatabaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    databaseCreated = true;

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
    if (databaseCreated) {
      await adminConnection.query(`DROP DATABASE ${escapedDatabaseName}`);
    }
    await adminConnection.end();
  }
};

module.exports = {
  assertSafeTestDatabaseName,
  createAdminConnection,
  createTestDatabaseName,
  withTestDatabase,
};
