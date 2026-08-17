const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const mysql = require('mysql2');
const Sequelize = require('sequelize');

const migration = require('../migrations/20260817000000-initialize-lnhs-sis');
const {
  assertSafeTestDatabaseName,
  createAdminConnection,
  createTestDatabaseName,
  withTestDatabase,
} = require('./support/mysql-test-database');

const SQL_PATH = path.resolve(__dirname, '..', '..', 'database', 'lnhs-sis.sql');

const normalizeDefault = (value) => {
  if (value === null) return null;
  return String(value).toLowerCase().replaceAll('()', '');
};

const getSchemaSnapshot = async (connection, databaseName) => {
  const [columns] = await connection.query(
    `SELECT TABLE_NAME, COLUMN_NAME, ORDINAL_POSITION, COLUMN_TYPE,
            IS_NULLABLE, COLUMN_DEFAULT, EXTRA
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME <> 'SequelizeMeta'
     ORDER BY TABLE_NAME, ORDINAL_POSITION`,
    [databaseName]
  );

  const [indexes] = await connection.query(
    `SELECT TABLE_NAME, NON_UNIQUE,
            GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns_in_order
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME <> 'SequelizeMeta'
     GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE
     ORDER BY TABLE_NAME, NON_UNIQUE, columns_in_order`,
    [databaseName]
  );

  const [foreignKeys] = await connection.query(
    `SELECT k.TABLE_NAME, k.COLUMN_NAME, k.REFERENCED_TABLE_NAME,
            k.REFERENCED_COLUMN_NAME, r.UPDATE_RULE, r.DELETE_RULE
     FROM information_schema.KEY_COLUMN_USAGE k
     JOIN information_schema.REFERENTIAL_CONSTRAINTS r
       ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
      AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
     WHERE k.TABLE_SCHEMA = ? AND k.REFERENCED_TABLE_NAME IS NOT NULL
     ORDER BY k.TABLE_NAME, k.COLUMN_NAME`,
    [databaseName]
  );

  return {
    columns: columns.map((column) => ({
      table: column.TABLE_NAME.toUpperCase(),
      column: column.COLUMN_NAME,
      position: column.ORDINAL_POSITION,
      type: column.COLUMN_TYPE.toLowerCase(),
      nullable: column.IS_NULLABLE,
      default: normalizeDefault(column.COLUMN_DEFAULT),
      extra: column.EXTRA.toLowerCase(),
    })),
    indexes: indexes.map((index) => ({
      table: index.TABLE_NAME.toUpperCase(),
      nonUnique: index.NON_UNIQUE,
      columns: index.columns_in_order,
    })),
    foreignKeys: foreignKeys.map((foreignKey) => ({
      table: foreignKey.TABLE_NAME.toUpperCase(),
      column: foreignKey.COLUMN_NAME,
      referencedTable: foreignKey.REFERENCED_TABLE_NAME.toUpperCase(),
      referencedColumn: foreignKey.REFERENCED_COLUMN_NAME,
      updateRule: foreignKey.UPDATE_RULE,
      deleteRule: foreignKey.DELETE_RULE,
    })),
  };
};

test('the SQL bootstrap schema matches the consolidated migration', async () => {
  const sqlDatabase = createTestDatabaseName('parity_sql');
  assertSafeTestDatabaseName(sqlDatabase);

  await withTestDatabase('parity_migration', async ({ databaseName, sequelize }) => {
    await migration.up(sequelize.getQueryInterface(), Sequelize);
    const adminConnection = await createAdminConnection();

    try {
      const escapedSqlDatabase = mysql.escapeId(sqlDatabase);
      const bootstrapSql = fs
        .readFileSync(SQL_PATH, 'utf8')
        .replaceAll('`lnhs-sis`', `\`${sqlDatabase}\``);
      await adminConnection.query(bootstrapSql);

      const migrationSnapshot = await getSchemaSnapshot(
        adminConnection,
        databaseName
      );
      const sqlSnapshot = await getSchemaSnapshot(adminConnection, sqlDatabase);
      assert.deepEqual(sqlSnapshot, migrationSnapshot);
    } finally {
      await adminConnection.query(
        `DROP DATABASE IF EXISTS ${mysql.escapeId(sqlDatabase)}`
      );
      await adminConnection.end();
    }
  });
});
