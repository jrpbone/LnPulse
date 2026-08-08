module.exports = (sequelize, DataTypes) => {
  const AcademicSettings = sequelize.define(
    "ACADEMIC_SETTINGS_T",
    {
      settings_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      current_school_year: {
        type: DataTypes.STRING(9), // Format: "YYYY-YYYY"
        allowNull: false,
      },
      current_semester: {
        type: DataTypes.ENUM("1st Semester", "2nd Semester", "Summer Class"),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      }
    },
    {
      tableName: "ACADEMIC_SETTINGS_T",
    }
  );

  return AcademicSettings;
}; 