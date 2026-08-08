'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, remove any duplicate records keeping only the most recent one
    await queryInterface.sequelize.query(`
      DELETE FROM "ACADEMIC_PERFORMANCE_T" a
      WHERE a.performance_id NOT IN (
        SELECT MAX(performance_id)
        FROM "ACADEMIC_PERFORMANCE_T"
        GROUP BY acads_id
      )
    `);

    // Then add the unique constraint
    await queryInterface.addConstraint('ACADEMIC_PERFORMANCE_T', {
      fields: ['acads_id'],
      type: 'unique',
      name: 'academic_performance_acads_id_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'ACADEMIC_PERFORMANCE_T',
      'academic_performance_acads_id_unique'
    );
  }
}; 