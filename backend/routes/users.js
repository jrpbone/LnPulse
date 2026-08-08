const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const { USERS_T, DEPARTMENT_USER_T, SECTION_USER_T, DEPARTMENT_T, SECTION_T } = require("../models");
const { sequelize } = require("../models");

// Get all users with their respective department or section info
router.get("/", async (req, res) => {
  try {
    const users = await USERS_T.findAll({
      include: [
        {
          model: DEPARTMENT_USER_T,
          as: 'departmentUser',
          include: [{
            model: DEPARTMENT_T,
            as: 'department'
          }]
        },
        {
          model: SECTION_USER_T,
          as: 'sectionUser',
          include: [
            {
              model: SECTION_T,
              as: 'section'
            },
            {
              model: DEPARTMENT_T,
              as: 'department'
            }
          ]
        }
      ]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single user with their department or section info
router.get("/:id", async (req, res) => {
  try {
    const user = await USERS_T.findByPk(req.params.id, {
      include: [
        {
          model: DEPARTMENT_USER_T,
          as: 'departmentUser',
          include: [{
            model: DEPARTMENT_T,
            as: 'department'
          }]
        },
        {
          model: SECTION_USER_T,
          as: 'sectionUser',
          include: [
            {
              model: SECTION_T,
              as: 'section'
            },
            {
              model: DEPARTMENT_T,
              as: 'department'
            }
          ]
        }
      ]
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new user with department or section assignment
router.post("/", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { firstname, middlename, lastname, username, password, type, department_id, section_id } = req.body;
    
    // Log the received data
    console.log('Received data:', { ...req.body, password: '[REDACTED]' });

    // Validate required fields
    if (!firstname || !middlename || !lastname || !username || !password || !type) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate type-specific fields
    if (type === 'department_user' && !department_id) {
      return res.status(400).json({ message: 'Department is required for department users' });
    }

    if (type === 'section_user' && (!section_id || !department_id)) {
      return res.status(400).json({ message: 'Both section and department are required for section users' });
    }

    // Check if username already exists
    const existingUser = await USERS_T.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user with hashed password
    const user = await USERS_T.create({
      firstname: firstname.trim(),
      middlename: middlename.trim(),
      lastname: lastname.trim(),
      username: username.trim(),
      password: hashedPassword,
      type,
      status: 1
    }, { transaction });

    // Create the appropriate user type record
    if (type === 'department_user') {
      // First check if a record already exists
      const existingDeptUser = await DEPARTMENT_USER_T.findOne({
        where: { user_id: user.id },
        transaction
      });

      if (existingDeptUser) {
        // Update existing record
        await existingDeptUser.update({
          department_id: parseInt(department_id)
        }, { transaction });
      } else {
        // Create new record
        await DEPARTMENT_USER_T.create({
          user_id: user.id,
          department_id: parseInt(department_id)
        }, { transaction });
      }
    } else if (type === 'section_user') {
      // First check if a record already exists
      const existingSectionUser = await SECTION_USER_T.findOne({
        where: { user_id: user.id },
        transaction
      });

      if (existingSectionUser) {
        // Update existing record
        await existingSectionUser.update({
          section_id: parseInt(section_id),
          department_id: parseInt(department_id)
        }, { transaction });
      } else {
        // Create new record
        await SECTION_USER_T.create({
          user_id: user.id,
          section_id: parseInt(section_id),
          department_id: parseInt(department_id)
        }, { transaction });
      }
    }

    // Fetch the complete user data with associations
    const completeUser = await USERS_T.findByPk(user.id, {
      include: [
        {
          model: DEPARTMENT_USER_T,
          as: 'departmentUser',
          include: [{
            model: DEPARTMENT_T,
            as: 'department'
          }]
        },
        {
          model: SECTION_USER_T,
          as: 'sectionUser',
          include: [
            {
              model: SECTION_T,
              as: 'section'
            },
            {
              model: DEPARTMENT_T,
              as: 'department'
            }
          ]
        }
      ],
      transaction
    });

    await transaction.commit();
    res.status(201).json(completeUser);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating user:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a user and their department/section assignment
router.put("/:id", async (req, res) => {
  try {
    const { firstname, middlename, lastname, username, password, type, department_id, section_id } = req.body;
    const user = await USERS_T.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare update data
    const updateData = {
      firstname,
      middlename,
      lastname,
      username,
      type
    };

    // Only hash and update password if it's provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user basic info
    await user.update(updateData);

    // Handle department/section assignment
    if (type === 'department_user' && department_id) {
      // Remove section user if exists
      await SECTION_USER_T.destroy({ where: { user_id: user.id } });
      
      // Update or create department user
      const [departmentUser] = await DEPARTMENT_USER_T.findOrCreate({
        where: { user_id: user.id }
      });
      await departmentUser.update({ department_id });
    } else if (type === 'section_user' && section_id && department_id) {
      // Remove department user if exists
      await DEPARTMENT_USER_T.destroy({ where: { user_id: user.id } });
      
      // Update or create section user
      const [sectionUser] = await SECTION_USER_T.findOrCreate({
        where: { user_id: user.id }
      });
      await sectionUser.update({ 
        section_id,
        department_id 
      });
    }

    // Fetch the complete updated user data
    const updatedUser = await USERS_T.findByPk(user.id, {
      include: [
        {
          model: DEPARTMENT_USER_T,
          as: 'departmentUser',
          include: [{
            model: DEPARTMENT_T,
            as: 'department'
          }]
        },
        {
          model: SECTION_USER_T,
          as: 'sectionUser',
          include: [
            {
              model: SECTION_T,
              as: 'section'
            },
            {
              model: DEPARTMENT_T,
              as: 'department'
            }
          ]
        }
      ]
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a user (will cascade delete department/section user records)
router.delete("/:id", async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user = await USERS_T.findByPk(req.params.id);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete associated records first
    await DEPARTMENT_USER_T.destroy({
      where: { user_id: user.id },
      transaction
    });

    await SECTION_USER_T.destroy({
      where: { user_id: user.id },
      transaction
    });

    // Then delete the user
    await user.destroy({ transaction });

    await transaction.commit();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting user:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const user = await USERS_T.findOne({
      where: { username },
      include: [
        {
          model: DEPARTMENT_USER_T,
          as: 'departmentUser',
          include: [{
            model: DEPARTMENT_T,
            as: 'department'
          }]
        },
        {
          model: SECTION_USER_T,
          as: 'sectionUser',
          include: [
            {
              model: SECTION_T,
              as: 'section'
            },
            {
              model: DEPARTMENT_T,
              as: 'department'
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if user is active
    if (user.status !== 1) {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    // Define user privileges based on type
    let privileges = {
      canManageUsers: false,
      canManageDepartments: false,
      canManageSections: false,
      canViewAllStudents: false,
      canManageStudents: false,
      canViewAllGrades: false,
      canManageGrades: false,
      canViewReports: false,
      canManageReports: false,
      canViewAllSections: false,
      canManageAllSections: false,
      canViewCurriculum: false,
      sectionId: null,
      departmentId: null
    };

    // Set privileges based on user type
    if (user.type === 'admin') {
      privileges = {
        ...privileges,
        canManageUsers: true,
        canManageDepartments: true,
        canViewDepartments: true,
        canAddDepartmentUsers: true,
        canManageSections: true,
        canViewAllStudents: true,
        canManageStudents: true,
        canViewAllGrades: true,
        canManageGrades: true,
        canViewReports: true,
        canManageReports: true,
        canViewAllSections: true,
        canManageAllSections: true,
        canViewSubjects: true,
        canViewCurriculum: true
      };
    } else if (user.type === 'department_user') {
      privileges = {
        ...privileges,
        canManageUsers: true,
        canManageDepartments: true,
        canViewAllStudents: true,
        canManageStudents: true,
        canViewAllGrades: true,
        canManageGrades: true,
        canViewReports: true,
        canManageReports: true,
        canViewAllSections: true,
        canAddDepartmentUsers: true,
        canViewSubjects: true,
        canViewCurriculum: true,
        departmentId: user.departmentUser?.department?.department_id || null
      };
    } else if (user.type === 'section_user') {
      const sectionId = user.sectionUser?.section?.section_id;
      const departmentId = user.sectionUser?.department?.department_id;
      
      console.log('Setting up section user privileges:', {
        sectionId,
        departmentId,
        userType: user.type
      });

      privileges = {
        ...privileges,
        type: 'section_user',
        
        // Student Management
        canViewAllStudents: false,
        canManageStudents: true,
        canViewStudentDetails: true,
        canEditStudents: false,
        
        // Grade Management
        canViewAllGrades: false,
        canManageGrades: true,
        
        // Other permissions
        canViewReports: false,
        canViewSubjects: true,
        canCreateStudents: false,
        
        // Section specific
        sectionId,
        departmentId,
        
        // Navigation
        navigationItems: [
          { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
          { path: '/section-students', label: 'My Students', icon: 'students' },
          { path: '/Grades', label: 'Grades', icon: 'grades' }
        ]
      };

      console.log('Final section user privileges:', privileges);
    }

    // Return user data without password
    const userData = {
      id: user.id,
      firstname: user.firstname,
      middlename: user.middlename,
      lastname: user.lastname,
      username: user.username,
      type: user.type,
      departmentUser: user.departmentUser,
      sectionUser: user.sectionUser,
      privileges
    };

    res.json(userData);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
