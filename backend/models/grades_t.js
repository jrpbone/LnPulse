module.exports = (sequelize, DataTypes) => {
  const Grade = sequelize.define(
    "GRADE_T",
    {
      grade_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      acads_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      curriculum_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      grade: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      grade_remarks: {
        type: DataTypes.STRING(50),
      },
    },
    {
      tableName: "GRADES_T",
    }
  );

  Grade.associate = (models) => {
    Grade.belongsTo(models.CURRICULUM_T, {
      foreignKey: "curriculum_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    Grade.belongsTo(models.ACADEMIC_INFO_T, {
      foreignKey: "acads_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Grade;
};
