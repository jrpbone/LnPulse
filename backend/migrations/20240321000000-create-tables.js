'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create ADDRESS_T
    await queryInterface.createTable('ADDRESS_T', {
      address_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      houseNo: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      street_barangay: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      city_municipality: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: "Ligao City"
      },
      province: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: "Albay"
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create PARENT_GUARDIAN_T
    await queryInterface.createTable('PARENT_GUARDIAN_T', {
      parent_guardian_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      pgFirstName: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      pgMiddleName: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      pgLastName: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      pgContactNum: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create DEPARTMENT_T
    await queryInterface.createTable('DEPARTMENT_T', {
      department_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      department_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      department_description: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create STRAND_T
    await queryInterface.createTable('STRAND_T', {
      strand_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'DEPARTMENT_T',
          key: 'department_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      strand_name: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      strand_description: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create SECTION_T
    await queryInterface.createTable('SECTION_T', {
      section_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      strand_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'STRAND_T',
          key: 'strand_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      grade_level: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      section_name: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create CURRICULUM_T
    await queryInterface.createTable('CURRICULUM_T', {
      curriculum_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      strand_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'STRAND_T',
          key: 'strand_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      subject_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      subject_description: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      grade_level: {
        type: Sequelize.ENUM('11', '12'),
        allowNull: false
      },
      semester: {
        type: Sequelize.ENUM('1st Semester', '2nd Semester'),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('core', 'specialized'),
        allowNull: false
      },
      isRegular: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create USERS_T
    await queryInterface.createTable('USERS_T', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      firstname: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      lastname: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('department_user', 'section_user'),
        allowNull: false
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create STUDENT_T
    await queryInterface.createTable('STUDENT_T', {
      student_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false
      },
      guardian_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'PARENT_GUARDIAN_T',
          key: 'parent_guardian_id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      currentAddress: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ADDRESS_T',
          key: 'address_id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      permanentAddress: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ADDRESS_T',
          key: 'address_id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      middle_name: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      suffix: {
        type: Sequelize.ENUM('Jr.', 'Sr.', 'II', 'III', 'IV'),
        allowNull: true
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      place_of_birth: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      age: {
        type: Sequelize.INTEGER(2),
        allowNull: false
      },
      sex: {
        type: Sequelize.ENUM('Male', 'Female'),
        allowNull: false
      },
      contact_num: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      religion: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      height: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      weight: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      bmi: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      nationality: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'Filipino'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create ACADEMIC_INFO_T
    await queryInterface.createTable('ACADEMIC_INFO_T', {
      acads_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      student_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'STUDENT_T',
          key: 'student_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'DEPARTMENT_T',
          key: 'department_id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      strand_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'STRAND_T',
          key: 'strand_id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      section_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'SECTION_T',
          key: 'section_id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      gradeLevel: {
        type: Sequelize.ENUM('11', '12'),
        allowNull: false
      },
      schoolYear: {
        type: Sequelize.STRING(9),
        allowNull: false
      },
      semester: {
        type: Sequelize.ENUM('1st Semester', '2nd Semester'),
        allowNull: false
      },
      entryStatus: {
        type: Sequelize.ENUM('New Enrollee', 'Continuing', 'Transferee', 'Returning', 'Shifted'),
        allowNull: false
      },
      exitStatus: {
        type: Sequelize.ENUM('Pending', 'Completed', 'Failed', 'Dropped', 'Transferred Out', 'Graduated'),
        defaultValue: 'Pending',
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create SECTION_USER_T
    await queryInterface.createTable('SECTION_USER_T', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'USERS_T',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      section_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'SECTION_T',
          key: 'section_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'DEPARTMENT_T',
          key: 'department_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create DEPARTMENT_USER_T
    await queryInterface.createTable('DEPARTMENT_USER_T', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'USERS_T',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      department_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'DEPARTMENT_T',
          key: 'department_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order to handle foreign key constraints
    await queryInterface.dropTable('DEPARTMENT_USER_T');
    await queryInterface.dropTable('SECTION_USER_T');
    await queryInterface.dropTable('ACADEMIC_INFO_T');
    await queryInterface.dropTable('STUDENT_T');
    await queryInterface.dropTable('CURRICULUM_T');
    await queryInterface.dropTable('SECTION_T');
    await queryInterface.dropTable('STRAND_T');
    await queryInterface.dropTable('USERS_T');
    await queryInterface.dropTable('DEPARTMENT_T');
    await queryInterface.dropTable('PARENT_GUARDIAN_T');
    await queryInterface.dropTable('ADDRESS_T');
  }
}; 