'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SUBJECT_T');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SUBJECT_T', {
      subject_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      subject_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      subject_description: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });
  }
}; 