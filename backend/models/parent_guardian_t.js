module.exports = (sequelize, DataTypes) => {
  const ParentGuardian = sequelize.define(
    "PARENT_GUARDIAN_T",
    {
      parent_guardian_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      pgFirstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      pgMiddleName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      pgLastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      pgContactNum: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: "PARENT_GUARDIAN_T",
    }
  );

  return ParentGuardian;
};
