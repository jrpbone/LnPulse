module.exports = (sequelize, DataTypes) => {
  const Section = sequelize.define(
    "SECTION_T",
    {
      section_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      strand_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      grade_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      section_name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      tableName: "SECTION_T",
    }
  );

  Section.associate = (models) => {
    Section.belongsTo(models.STRAND_T, {
      foreignKey: "strand_id",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    Section.hasMany(models.ACADEMIC_INFO_T, {
      foreignKey: "section_id",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
    
  };

  return Section;
};
