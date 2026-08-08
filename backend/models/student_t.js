module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define(
    "STUDENT_T",
    {
      student_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
      },
      guardian_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      currentAddress: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      permanentAddress: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      middle_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      suffix: {
        type: DataTypes.ENUM("Jr.", "Sr.", "II", "III", "IV"),
        allowNull: true,
      },
      birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      place_of_birth: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      age: {
        type: DataTypes.INTEGER(2),
        allowNull: false,
      },
      sex: {
        type: DataTypes.ENUM("Male", "Female"),
        allowNull: false,
      },
      contact_num: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      religion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      height: {
        type: DataTypes.DECIMAL(5, 2), // Allows values like 123.45 cm
        allowNull: true,
      },
      weight: {
        type: DataTypes.DECIMAL(5, 2), // Allows values like 123.45 kg
        allowNull: true,
      },
      bmi: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      nationality: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "Filipino",
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      }
    },
    {
      tableName: "STUDENT_T",
    }
  );


  Student.associate = (models) => {
    Student.belongsTo(models.PARENT_GUARDIAN_T, {
      foreignKey: "guardian_id",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
    Student.belongsTo(models.ADDRESS_T, {
      as: "currentAddressData",
      foreignKey: "currentAddress",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
    Student.belongsTo(models.ADDRESS_T, {
      as: "permanentAddressData",
      foreignKey: "permanentAddress",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
    Student.hasMany(models.ACADEMIC_INFO_T, {
      foreignKey: "student_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };


  return Student;
};