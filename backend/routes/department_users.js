const express = require('express');
const router = express.Router();
const { USERS_T, DEPARTMENT_T } = require('../models');

// Get all department users
router.get('/', async (req, res) => {
  try {
    const departmentUsers = await DEPARTMENT_T.findAll({
      include: [{
        model: USERS_T,
        as: 'user'
      }]
    });
    res.json(departmentUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get department users by department_id
router.get('/department/:department_id', async (req, res) => {
  try {
    const departmentUsers = await DEPARTMENT_T.findAll({
      where: { department_id: req.params.department_id },
      include: [{
        model: USERS_T,
        as: 'user'
      }]
    });
    res.json(departmentUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update department assignment
router.put('/:user_id', async (req, res) => {
  try {
    const { department_id } = req.body;
    const departmentUser = await DEPARTMENT_T.findByPk(req.params.user_id);
    
    if (!departmentUser) {
      return res.status(404).json({ message: 'Department user not found' });
    }

    await departmentUser.update({ department_id });
    
    const updatedDepartmentUser = await DEPARTMENT_T.findByPk(req.params.user_id, {
      include: [{
        model: USERS_T,
        as: 'user'
      }]
    });

    res.json(updatedDepartmentUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 