module.exports = (sequelize, DataTypes) => {
  const DepartmentUser = sequelize.define(
    "DEPARTMENT_USER_T",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'USERS_T',
          key: 'id'
        }
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'DEPARTMENT_T',
          key: 'department_id'
        }
      }
    },
    {
      tableName: "DEPARTMENT_USER_T",
      timestamps: false,
      hooks: {
        beforeCreate: async (instance, options) => {
          const user = await sequelize.models.USERS_T.findByPk(instance.user_id, {
            transaction: options.transaction
          });
          
          if (!user) {
            throw new Error('User does not exist');
          }
          
          if (user.type !== 'department_user') {
            throw new Error('User type must be department_user');
          }
          
          // Check if user already exists in section_user_t
          const sectionUser = await sequelize.models.SECTION_USER_T.findByPk(instance.user_id, {
            transaction: options.transaction
          });
          
          if (sectionUser) {
            throw new Error('User already exists in section_user_t');
          }
        }
      }
    }
  );

  DepartmentUser.associate = (models) => {
    DepartmentUser.belongsTo(models.USERS_T, {
      foreignKey: 'user_id',
      as: 'user'
    });

    DepartmentUser.belongsTo(models.DEPARTMENT_T, {
      foreignKey: 'department_id',
      as: 'department'
    });
  };

  return DepartmentUser;
};
