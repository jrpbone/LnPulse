module.exports = (sequelize, DataTypes) => {
  const REPORTS_T = sequelize.define("REPORTS_T", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'DEPARTMENT_T',
        key: 'department_id'
      }
    },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'SECTION_T',
        key: 'section_id'
      }
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'USERS_T',
        key: 'id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    timestamps: false,
    tableName: 'REPORTS_T'
  });

  REPORTS_T.associate = (models) => {
    REPORTS_T.belongsTo(models.USERS_T, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    REPORTS_T.belongsTo(models.DEPARTMENT_T, {
      foreignKey: 'department_id',
      as: 'department'
    });

    REPORTS_T.belongsTo(models.SECTION_T, {
      foreignKey: 'section_id',
      as: 'section'
    });
  };

  return REPORTS_T;
}; 