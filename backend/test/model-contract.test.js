const assert = require('node:assert/strict');
const { after, describe, it } = require('node:test');

const models = require('../models');

const uniqueIndexFields = (model) =>
  model.options.indexes
    .filter(({ unique }) => unique)
    .map(({ fields }) => fields.join(','));

after(async () => {
  await models.sequelize.close();
});

describe('Sequelize model contract', () => {
  it('supports all application user roles and academic periods', () => {
    assert.deepEqual(
      [...models.USERS_T.rawAttributes.type.values].sort(),
      ['admin', 'department_user', 'section_user'].sort()
    );
    assert.deepEqual(
      models.ACADEMIC_SETTINGS_T.rawAttributes.current_semester.values,
      ['1st Semester', '2nd Semester', 'Summer Class']
    );
  });

  it('uses required parent identifiers for strand, section, and curriculum', () => {
    assert.equal(models.STRAND_T.rawAttributes.department_id.allowNull, false);
    assert.equal(models.SECTION_T.rawAttributes.strand_id.allowNull, false);
    assert.equal(models.CURRICULUM_T.rawAttributes.strand_id.allowNull, false);
    assert.equal(models.ACADEMIC_INFO_T.rawAttributes.student_id.allowNull, false);
  });

  it('matches schema lengths used by organization and curriculum forms', () => {
    assert.equal(models.DEPARTMENT_T.rawAttributes.department_name.type.options.length, 100);
    assert.equal(
      models.DEPARTMENT_T.rawAttributes.department_description.type.options.length,
      255
    );
    assert.equal(models.STRAND_T.rawAttributes.strand_name.type.options.length, 100);
    assert.equal(models.CURRICULUM_T.rawAttributes.subject_name.type.options.length, 150);
  });

  it('prevents duplicate curriculum slots and grades', () => {
    assert.ok(
      uniqueIndexFields(models.CURRICULUM_T).includes(
        'strand_id,grade_level,semester,subject_name'
      )
    );
    assert.ok(
      uniqueIndexFields(models.GRADE_T).includes('acads_id,curriculum_id')
    );
    assert.equal(models.GRADE_T.rawAttributes.acads_id.allowNull, false);
  });

  it('uses user_id as the assignment primary key without timestamps', () => {
    for (const model of [models.DEPARTMENT_USER_T, models.SECTION_USER_T]) {
      assert.equal(model.options.timestamps, false);
      assert.equal(model.rawAttributes.user_id.primaryKey, true);
      assert.equal(model.rawAttributes.id, undefined);
    }
  });
});
