module.exports = (sequelize, DataTypes) => {
  const AcademicInfo = sequelize.define(
    "ACADEMIC_INFO_T",
    {
      acads_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      student_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      strand_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      section_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gradeLevel: {
        type: DataTypes.ENUM("11", "12"),
        allowNull: false,
      },
      schoolYear: {
        type: DataTypes.STRING(9), // Format: "YYYY-YYYY"
        allowNull: false,
      },
      semester: {
        type: DataTypes.ENUM("1st Semester", "2nd Semester", "Summer Class"),
        allowNull: false,
      },
      entryStatus: {
        type: DataTypes.ENUM(
          "New Enrollee",
          "Regular",
          "Irregular",
          "Transferee",
          "Returning",
          "Remedial"
        ),
        allowNull: false,
      },
      exitStatus: {
        type: DataTypes.ENUM(
          "Pending",
          "Completed",
          "Promoted with Deficiencies",
          "Failed",
          "Dropped",
          "Transferred Out",
          "Shifted",
          "Graduated"
        ),
        defaultValue: "Pending",
        allowNull: false,
      },
    },
    {
      tableName: "ACADEMIC_INFO_T",
    }
  );


  AcademicInfo.associate = (models) => {
    AcademicInfo.belongsTo(models.STUDENT_T, {
      foreignKey: "student_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });


    AcademicInfo.belongsTo(models.DEPARTMENT_T, {
      foreignKey: "department_id",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });


    AcademicInfo.hasMany(models.ACADEMIC_PERFORMANCE_T, {
      foreignKey: "acads_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });


    AcademicInfo.belongsTo(models.STRAND_T, {
      foreignKey: "strand_id",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });


    AcademicInfo.belongsTo(models.SECTION_T, {
      foreignKey: "section_id",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });


  };


  return AcademicInfo;
};

