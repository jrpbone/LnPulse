module.exports = (sequelize, DataTypes) => {
  const Strand = sequelize.define(
    "STRAND_T",
    {
      strand_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      strand_name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      strand_description: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      tableName: "STRAND_T",
    }
  );

  Strand.associate = (models) => {
    Strand.belongsTo(models.DEPARTMENT_T, {
      foreignKey: "department_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    Strand.hasMany(models.ACADEMIC_INFO_T, {
      foreignKey: "strand_id",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    Strand.hasMany(models.SECTION_T, {
      foreignKey: "strand_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    Strand.hasMany(models.CURRICULUM_T, {
      foreignKey: "strand_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return Strand;
};
