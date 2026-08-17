const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const {
  buildDatabaseConfigurations,
  createDatabaseConfig,
  parsePort,
} = require('../config/database');

describe('database configuration', () => {
  it('uses a valid TCP port and rejects invalid port values', () => {
    assert.equal(parsePort('3308', 3307), 3308);
    assert.equal(parsePort('not-a-port', 3307), 3307);
    assert.equal(parsePort('0', 3307), 3307);
    assert.equal(parsePort('65536', 3307), 3307);
    assert.equal(parsePort('3307junk', 3307), 3307);
    assert.equal(parsePort('3307.5', 3307), 3307);
    assert.equal(parsePort('1e3', 3307), 3307);
    assert.equal(parsePort(' 3306 ', 3307), 3306);
  });

  it('builds the development connection from environment values', () => {
    const config = createDatabaseConfig(
      {
        DB_HOST: 'mysql.internal',
        DB_PORT: '3310',
        DB_NAME: 'lnhs_custom',
        DB_USER: 'lnhs_app',
        DB_PASSWORD: 'local-secret',
      },
      'development'
    );

    assert.deepEqual(config, {
      username: 'lnhs_app',
      password: 'local-secret',
      database: 'lnhs_custom',
      host: 'mysql.internal',
      port: 3310,
      dialect: 'mysql',
      logging: false,
    });
  });

  it('keeps development defaults free of committed secrets', () => {
    assert.deepEqual(createDatabaseConfig({}, 'development'), {
      username: 'root',
      password: '',
      database: 'lnhs-sis',
      host: '127.0.0.1',
      port: 3307,
      dialect: 'mysql',
      logging: false,
    });
  });

  it('uses an isolated default database for tests', () => {
    assert.equal(createDatabaseConfig({}, 'test').database, 'lnhs_sis_test');
  });

  it('rejects production configuration with missing credentials', () => {
    assert.throws(
      () => createDatabaseConfig({ DB_NAME: 'lnhs-sis' }, 'production'),
      /DB_USER, DB_PASSWORD/
    );
  });

  it('validates production when the exported production entry is selected', () => {
    const configurations = buildDatabaseConfigurations({});

    assert.equal(configurations.development.database, 'lnhs-sis');
    assert.throws(
      () => configurations.production,
      /DB_NAME, DB_USER, DB_PASSWORD/
    );

    const production = buildDatabaseConfigurations({
      DB_NAME: 'lnhs_production',
      DB_USER: 'lnhs_service',
      DB_PASSWORD: 'production-secret',
    }).production;
    assert.equal(production.database, 'lnhs_production');
    assert.equal(production.username, 'lnhs_service');
  });
});
