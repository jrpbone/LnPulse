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
          type: DataTypes.STRING,
          allowNull: false,
        },
        subject_description: {
          type: DataTypes.STRING,
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
          allowNull: true,
        }
      },
      {
        tableName: "CURRICULUM_T",
        indexes: [
          {
            // Create a unique composite index for subject validation
            unique: true,
            fields: ['strand_id', 'grade_level', 'semester', 'subject_name'],
            name: 'unique_subject_per_strand_grade_semester',
            // Add a where clause to make it case insensitive
            validate: {
              async isDuplicate() {
                const existing = await Curriculum.findOne({
                  where: {
                    strand_id: this.strand_id,
                    grade_level: this.grade_level,
                    semester: this.semester,
                    subject_name: sequelize.where(
                      sequelize.fn('LOWER', sequelize.col('subject_name')),
                      sequelize.fn('LOWER', this.subject_name)
                    )
                  }
                });
                if (existing && existing.curriculum_id !== this.curriculum_id) {
                  throw new Error('Subject already exists in this strand, grade level and semester');
                }
              }
            }
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
  