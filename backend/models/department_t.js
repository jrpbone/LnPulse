module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define(
    "DEPARTMENT_T",
    {
      department_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      department_name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      department_description: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: "DEPARTMENT_T",
    }
  );

  Department.associate = (models) => {
    Department.hasOne(models.ACADEMIC_INFO_T, {
      foreignKey: "department_id",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  };

  return Department;
};
