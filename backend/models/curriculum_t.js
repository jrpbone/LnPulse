module.exports = (sequelize, DataTypes) => {
    const Curriculum = sequelize.define(
      "CURRICULUM_T",
      {
        curriculum_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          autoIncrement: true,
        },
        subject_name: {
          type: DataTypes.STRING(150),
          allowNull: false,
        },
        subject_description: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        grade_level: {
          type: DataTypes.ENUM("11", "12"),
          allowNull: false,
        },
        semester: {
          type: DataTypes.ENUM("1st Semester", "2nd Semester"),
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM("core", "specialized"),
          allowNull: false,
        },
        isRegular: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        strand_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        }
      },
      {
        tableName: "CURRICULUM_T",
        indexes: [
          {
            // Create a unique composite index for subject validation
            unique: true,
            fields: ['strand_id', 'grade_level', 'semester', 'subject_name'],
            name: 'curriculum_strand_grade_semester_subject_unique',
          }
        ]
      }
    );
  
    Curriculum.associate = (models) => {
      Curriculum.belongsTo(models.STRAND_T, {
        foreignKey: "strand_id",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    };
  
    return Curriculum;
  };
