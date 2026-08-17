const assert = require('node:assert/strict');
const { test } = require('node:test');
const Sequelize = require('sequelize');

const migration = require('../migrations/20260817000000-initialize-lnhs-sis');
const {
  assertSafeTestDatabaseName,
  withTestDatabase,
} = require('./support/mysql-test-database');

const REQUIRED_TABLES = [
  'ACADEMIC_INFO_T',
  'ACADEMIC_PERFORMANCE_T',
  'ACADEMIC_SETTINGS_T',
  'ADDRESS_T',
  'CURRICULUM_T',
  'DEPARTMENT_T',
  'DEPARTMENT_USER_T',
  'GRADES_T',
  'PARENT_GUARDIAN_T',
  'REPORTS_T',
  'SECTION_T',
  'SECTION_USER_T',
  'STRAND_T',
  'STUDENT_T',
  'USERS_T',
];

test('the test database guard rejects production-like names', () => {
  assert.throws(() => assertSafeTestDatabaseName('lnhs-sis'), /unsafe/);
  assert.throws(() => assertSafeTestDatabaseName('lnhs_sis_test'), /unsafe/);
  assert.doesNotThrow(() =>
    assertSafeTestDatabaseName('lnhs_sis_test_schema_contract')
  );
});

test('the consolidated migration creates and removes the complete schema', async () => {
  await withTestDatabase('lnhs_sis_test_schema_contract', async ({ sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    await migration.up(queryInterface, Sequelize);

    const tables = (await queryInterface.showAllTables())
      .map((tableName) => tableName.toUpperCase())
      .sort();
    assert.deepEqual(tables, [...REQUIRED_TABLES].sort());

    const [uniqueIndexes] = await sequelize.query(`
      SELECT TABLE_NAME, INDEX_NAME,
             GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns_in_order
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND NON_UNIQUE = 0
      GROUP BY TABLE_NAME, INDEX_NAME
    `);
    const indexSignatures = uniqueIndexes.map(
      ({ TABLE_NAME, columns_in_order }) =>
        `${TABLE_NAME.toUpperCase()}:${columns_in_order}`
    );

    assert.ok(indexSignatures.includes('USERS_T:username'));
    assert.ok(
      indexSignatures.includes(
        'CURRICULUM_T:strand_id,grade_level,semester,subject_name'
      )
    );
    assert.ok(indexSignatures.includes('ACADEMIC_PERFORMANCE_T:acads_id'));
    assert.ok(indexSignatures.includes('GRADES_T:acads_id,curriculum_id'));

    const [foreignKeys] = await sequelize.query(`
      SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    const foreignKeySignatures = foreignKeys.map(
      ({ TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME }) =>
        `${TABLE_NAME.toUpperCase()}.${COLUMN_NAME}->${REFERENCED_TABLE_NAME.toUpperCase()}`
    );
    assert.ok(
      foreignKeySignatures.includes('STRAND_T.department_id->DEPARTMENT_T')
    );
    assert.ok(
      foreignKeySignatures.includes('ACADEMIC_INFO_T.student_id->STUDENT_T')
    );
    assert.ok(foreignKeySignatures.includes('REPORTS_T.created_by->USERS_T'));

    await migration.down(queryInterface);
    assert.deepEqual(await queryInterface.showAllTables(), []);
  });
});
