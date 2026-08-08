module.exports = (sequelize, DataTypes) => {
  const AcademicPerformance = sequelize.define(
    "ACADEMIC_PERFORMANCE_T",
    {
      performance_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      acads_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      gpa: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
      },
      honors: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      remarks: {
        type: DataTypes.TEXT,
        defaultValue: "Pending Grades",
      },
    },
    {
      tableName: "ACADEMIC_PERFORMANCE_T",
      timestamps: false,
    }
  );

  AcademicPerformance.associate = (models) => {
    AcademicPerformance.belongsTo(models.ACADEMIC_INFO_T, {
      foreignKey: "acads_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return AcademicPerformance;
};