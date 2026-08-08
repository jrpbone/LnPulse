module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    "USERS_T",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      firstname: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      middlename: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      lastname: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('admin', 'section_user', 'department_user'),
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      }
    },
    {
      tableName: "USERS_T",
      timestamps: true
    }
  );

  Users.associate = (models) => {
    Users.hasOne(models.DEPARTMENT_USER_T, {
      foreignKey: 'user_id',
      as: 'departmentUser',
      onDelete: 'CASCADE'
    });

    Users.hasOne(models.SECTION_USER_T, {
      foreignKey: 'user_id',
      as: 'sectionUser',
      onDelete: 'CASCADE'
    });
  };

  return Users;
};
