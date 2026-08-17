const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const bcrypt = require('bcrypt');

const {
  assertSafeTestDatabaseName,
  createAdminConnection,
  createTestDatabaseName,
} = require('./support/mysql-test-database');

const SQL_PATH = path.resolve(__dirname, '..', '..', 'database', 'lnhs-sis.sql');
const MIGRATION_NAME = '20260817000000-initialize-lnhs-sis.js';
const EMPTY_BASELINE_TABLES = [
  'ADDRESS_T',
  'PARENT_GUARDIAN_T',
  'DEPARTMENT_T',
  'STRAND_T',
  'SECTION_T',
  'CURRICULUM_T',
  'STUDENT_T',
  'ACADEMIC_INFO_T',
  'ACADEMIC_PERFORMANCE_T',
  'GRADES_T',
  'ACADEMIC_SETTINGS_T',
  'DEPARTMENT_USER_T',
  'SECTION_USER_T',
  'REPORTS_T',
];

test('the SQL bootstrap creates the complete baseline with only one admin', async () => {
  const testDatabase = createTestDatabaseName('sql_bootstrap');
  assertSafeTestDatabaseName(testDatabase);
  const bootstrapSql = fs.readFileSync(SQL_PATH, 'utf8');
  const isolatedSql = bootstrapSql.replaceAll('`lnhs-sis`', `\`${testDatabase}\``);
  const connection = await createAdminConnection();

  try {
    await connection.query(isolatedSql);

    const [tableRows] = await connection.query(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [testDatabase]);
    const tables = tableRows.map(({ TABLE_NAME }) => TABLE_NAME.toUpperCase());
    assert.equal(tables.length, 16);
    assert.ok(tables.includes('SEQUELIZEMETA'));
    assert.ok(tables.includes('USERS_T'));

    const [migrationRows] = await connection.query(
      `SELECT name FROM \`${testDatabase}\`.\`SequelizeMeta\``
    );
    assert.deepEqual(migrationRows, [{ name: MIGRATION_NAME }]);

    const [users] = await connection.query(
      `SELECT username, password, type, status FROM \`${testDatabase}\`.\`USERS_T\``
    );
    assert.equal(users.length, 1);
    assert.equal(users[0].username, 'admin');
    assert.equal(users[0].type, 'admin');
    assert.equal(users[0].status, 1);
    assert.equal(await bcrypt.compare('ChangeMe123!', users[0].password), true);

    for (const tableName of EMPTY_BASELINE_TABLES) {
      const [rows] = await connection.query(
        `SELECT COUNT(*) AS row_count FROM \`${testDatabase}\`.\`${tableName}\``
      );
      assert.equal(rows[0].row_count, 0, `${tableName} must start empty`);
    }

    const [foreignKeySetting] = await connection.query(
      'SELECT @@FOREIGN_KEY_CHECKS AS enabled'
    );
    assert.equal(foreignKeySetting[0].enabled, 1);
  } finally {
    await connection.query(`DROP DATABASE IF EXISTS \`${testDatabase}\``);
    await connection.end();
  }
});
