'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, get all academic info IDs that don't have performance records
    const academicInfos = await queryInterface.sequelize.query(
      `SELECT a.acads_id 
       FROM ACADEMIC_INFO_T a 
       LEFT JOIN ACADEMIC_PERFORMANCE_T p ON a.acads_id = p.acads_id 
       WHERE p.acads_id IS NULL`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Create academic performance records for each academic info
    const academicPerformances = academicInfos.map(academicInfo => ({
      acads_id: academicInfo.acads_id,
      gpa: null,
      honors: null,
      remarks: 'Pending Grades'
    }));

    if (academicPerformances.length > 0) {
      await queryInterface.bulkInsert('ACADEMIC_PERFORMANCE_T', academicPerformances, {
        fields: ['acads_id', 'gpa', 'honors', 'remarks']
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ACADEMIC_PERFORMANCE_T', null, {});
  }
}; 