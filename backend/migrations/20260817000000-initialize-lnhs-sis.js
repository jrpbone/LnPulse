'use strict';

const tableOptions = {
  engine: 'InnoDB',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
};

const timestamps = (Sequelize) => ({
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'ADDRESS_T',
      {
        address_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        houseNo: { type: Sequelize.STRING(20), allowNull: true },
        street_barangay: { type: Sequelize.STRING(100), allowNull: false },
        city_municipality: {
          type: Sequelize.STRING(100),
          allowNull: false,
          defaultValue: 'Ligao City',
        },
        province: {
          type: Sequelize.STRING(100),
          allowNull: false,
          defaultValue: 'Albay',
        },
        ...timestamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.createTable(
      'PARENT_GUARDIAN_T',
      {
        parent_guardian_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        pgFirstName: { type: Sequelize.STRING(50), allowNull: false },
        pgMiddleName: { type: Sequelize.STRING(50), allowNull: true },
        pgLastName: { type: Sequelize.STRING(50), allowNull: false },
        pgContactNum: { type: Sequelize.STRING(20), allowNull: true },
        ...timestamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.createTable(
      'DEPARTMENT_T',
      {
        department_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        department_name: { type: Sequelize.STRING(100), allowNull: false },
        department_description: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        ...timestamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.createTable(
      'STRAND_T',
      {
        strand_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        department_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'DEPARTMENT_T', key: 'department_id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        strand_name: { type: Sequelize.STRING(100), allowNull: false },
        strand_description: { type: Sequelize.STRING(255), allowNull: false },
        ...timestamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.createTable(
      'SECTION_T',
      {
        section_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        strand_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'STRAND_T', key: 'strand_id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        grade_level: { type: Sequelize.INTEGER, allowNull: false },
        section_name: { type: Sequelize.STRING(100), allowNull: false },
        ...timestamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.createTable(
      'CURRICULUM_T',
      {
        curriculum_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        strand_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'STRAND_T', key: 'strand_id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        subject_name: { type: Sequelize.STRING(150), allowNull: false },
        subject_description: { type: Sequelize.STRING(255), allowNull: false },
        grade_level: {
          type: Sequelize.ENUM('11', '12'),
          allowNull: false,
        },
        semester: {
          type: Sequelize.ENUM('1st Semester', '2nd Semester'),
          allowNull: false,
        },
        type: {
          type: Sequelize.ENUM('core', 'specialized'),
          allowNull: false,
        },
        isRegular: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        ...timestamps(Sequelize),
      },
      tableOptions
    );
    await queryInterface.addIndex(
      'CURRICULUM_T',
      ['strand_id', 'grade_level', 'semester', 'subject_name'],
      {
        unique: true,
        name: 'curriculum_strand_grade_semester_subject_unique',
      }
    );

    await queryInterface.createTable(
      'USERS_T',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        firstname: { type: Sequelize.STRING(100), allowNull: false },
        middlename: { type: Sequelize.STRING(100), allowNull: true },
        lastname: { type: Sequelize.STRING(100), allowNull: false },
        username: { type: Sequelize.STRING(100), allowNull: false, unique: true },
        password: { type: Sequelize.STRING(255), allowNull: false },
        type: {
          type: Sequelize.ENUM('admin', 'department_user', 'section_user'),
          allowNull: false,
        },
        status: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 1,
        },
        ...timestamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.createTable(
      'STUDENT_T',
      {
        student_id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          allowNull: false,
        },
        guardian_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'PARENT_GUARDIAN_T',
            key: 'parent_guardian_id',
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        currentAddress: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'ADDRESS_T', key: 'address_id' },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        permanentAddress: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'ADDRESS_T', key: 'address_id' },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        first_name: { type: Sequelize.STRING(50), allowNull: false },
        middle_name: { type: Sequelize.STRING(50), allowNull: true },
        last_name: { type: Sequelize.STRING(50), allowNull: false },
        suffix: {
          type: Sequelize.ENUM('Jr.', 'Sr.', 'II', 'III', 'IV'),
          allowNull: true,
        },
        birth_date: { type: Sequelize.DATEONLY, allowNull: false },
        place_of_birth: { type: Sequelize.STRING(100), allowNull: false },
        age: { type: Sequelize.INTEGER, allowNull: false },
        sex: {
          type: Sequelize.ENUM('Male', 'Female'),
          allowNull: false,
        },
        contact_num: { type: Sequelize.STRING(20), allowNull: true },
        email: { type: Sequelize.STRING(100), allowNull: true },
        religion: { type: Sequelize.STRING(50), allowNull: false },
        height: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
        weight: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
        bmi: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
        nationality: {
          type: Sequelize.STRING(50),
          allowNull: true,
          defaultValue: 'Filipino',
        },
        status: {
          type: Sequelize.ENUM('active', 'inactive'),
          allowNull: false,
          defaultValue: 'active',
        },
        ...timestamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.createTable(
      'ACADEMIC_INFO_T',
      {
        acads_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        student_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: { model: 'STUDENT_T', key: 'student_id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        department_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'DEPARTMENT_T', key: 'department_id' },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        strand_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'STRAND_T', key: 'strand_id' },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        section_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'SECTION_T', key: 'section_id' },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        gradeLevel: {
          type: Sequelize.ENUM('11', '12'),
          allowNull: false,
        },
        schoolYear: { type: Sequelize.STRING(9), allowNull: false },
        semester: {
          type: Sequelize.ENUM(
            '1st Semester',
            '2nd Semester',
            'Summer Class'
          ),
          allowNull: false,
        },
        entryStatus: {
          type: Sequelize.ENUM(
            'New Enrollee',
            'Regular',
            'Irregular',
            'Transferee',
            'Returning',
            'Remedial'
          ),
          allowNull: false,
        },
        exitStatus: {
          type: Sequelize.ENUM(
            'Pending',
            'Completed',
            'Promoted with Deficiencies',
            'Failed',
            'Dropped',
            'Transferred Out',
            'Shifted',
            'Graduated'
          ),
          allowNull: false,
          defaultValue: 'Pending',
        },
        ...timestamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.createTable(
      'ACADEMIC_PERFORMANCE_T',
      {
        performance_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        acads_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: { model: 'ACADEMIC_INFO_T', key: 'acads_id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        gpa: { type: Sequelize.DECIMAL(4, 2), allowNull: true },
        honors: { type: Sequelize.STRING(50), allowNull: true },
        remarks: {
          type: Sequelize.TEXT,
          allowNull: true,
          defaultValue: 'Pending Grades',
        },
      },
      tableOptions
    );

    await queryInterface.createTable(
      'GRADES_T',
      {
        grade_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        acads_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'ACADEMIC_INFO_T', key: 'acads_id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        curriculum_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'CURRICULUM_T', key: 'curriculum_id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        grade: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
        grade_remarks: { type: Sequelize.STRING(50), allowNull: true },
        ...timestamps(Sequelize),
      },
      tableOptions
    );
    await queryInterface.addIndex('GRADES_T', ['acads_id', 'curriculum_id'], {
      unique: true,
      name: 'grades_academic_record_curriculum_unique',
    });

    await queryInterface.createTable(
      'ACADEMIC_SETTINGS_T',
      {
        settings_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        current_school_year: { type: Sequelize.STRING(9), allowNull: false },
        current_semester: {
          type: Sequelize.ENUM(
            '1st Semester',
            '2nd Semester',
            'Summer Class'
          ),
          allowNull: false,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        ...timestamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.createTable(
      'DEPARTMENT_USER_T',
      {
        user_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: { model: 'USERS_T', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        department_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'DEPARTMENT_T', key: 'department_id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
      tableOptions
    );

    await queryInterface.createTable(
      'SECTION_USER_T',
      {
        user_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false,
          references: { model: 'USERS_T', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        section_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'SECTION_T', key: 'section_id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        department_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'DEPARTMENT_T', key: 'department_id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      },
      tableOptions
    );

    await queryInterface.createTable(
      'REPORTS_T',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        title: { type: Sequelize.STRING(255), allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: true },
        content: { type: Sequelize.TEXT, allowNull: false },
        department_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'DEPARTMENT_T', key: 'department_id' },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        section_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'SECTION_T', key: 'section_id' },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'USERS_T', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      tableOptions
    );
  },

  async down(queryInterface) {
    const tables = [
      'REPORTS_T',
      'SECTION_USER_T',
      'DEPARTMENT_USER_T',
      'ACADEMIC_SETTINGS_T',
      'GRADES_T',
      'ACADEMIC_PERFORMANCE_T',
      'ACADEMIC_INFO_T',
      'STUDENT_T',
      'USERS_T',
      'CURRICULUM_T',
      'SECTION_T',
      'STRAND_T',
      'DEPARTMENT_T',
      'PARENT_GUARDIAN_T',
      'ADDRESS_T',
    ];

    for (const tableName of tables) {
      await queryInterface.dropTable(tableName);
    }
  },
};
