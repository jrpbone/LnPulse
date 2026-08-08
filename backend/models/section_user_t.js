module.exports = (sequelize, DataTypes) => {
  const SectionUser = sequelize.define(
    "SECTION_USER_T",
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
      section_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'SECTION_T',
          key: 'section_id'
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
      tableName: "SECTION_USER_T",
      timestamps: false,
      hooks: {
        beforeCreate: async (instance, options) => {
          const user = await sequelize.models.USERS_T.findByPk(instance.user_id, {
            transaction: options.transaction
          });
          
          if (!user) {
            throw new Error('User does not exist');
          }
          
          if (user.type !== 'section_user') {
            throw new Error('User type must be section_user');
          }
          
          // Check if user already exists in department_user_t
          const departmentUser = await sequelize.models.DEPARTMENT_USER_T.findByPk(instance.user_id, {
            transaction: options.transaction
          });
          
          if (departmentUser) {
            throw new Error('User already exists in department_user_t');
          }

          // Check if department exists
          const department = await sequelize.models.DEPARTMENT_T.findByPk(instance.department_id, {
            transaction: options.transaction
          });
          
          if (!department) {
            throw new Error('Department does not exist');
          }
        }
      }
    }
  );

  SectionUser.associate = (models) => {
    SectionUser.belongsTo(models.USERS_T, {
      foreignKey: 'user_id',
      as: 'user'
    });

    SectionUser.belongsTo(models.SECTION_T, {
      foreignKey: 'section_id',
      as: 'section'
    });

    SectionUser.belongsTo(models.DEPARTMENT_T, {
      foreignKey: 'department_id',
      as: 'department'
    });
  };

  return SectionUser;
};
