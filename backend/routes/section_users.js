const express = require('express');
const router = express.Router();
const { SectionUser, User, Section, Department } = require('../models');

// Get all section users with their related data
router.get('/', async (req, res) => {
  try {
    const sectionUsers = await SectionUser.findAll({
      include: [
        {
          model: User,
          as: 'user'
        },
        {
          model: Section,
          as: 'section'
        },
        {
          model: Department,
          as: 'department'
        }
      ]
    });
    res.json(sectionUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new section user
router.post('/', async (req, res) => {
  try {
    const { user_id, section_id, department_id } = req.body;
    const sectionUser = await SectionUser.create({
      user_id,
      section_id,
      department_id
    });
    res.status(201).json(sectionUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a specific section user
router.get('/:id', async (req, res) => {
  try {
    const sectionUser = await SectionUser.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user'
        },
        {
          model: Section,
          as: 'section'
        },
        {
          model: Department,
          as: 'department'
        }
      ]
    });
    if (sectionUser) {
      res.json(sectionUser);
    } else {
      res.status(404).json({ message: 'Section user not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a section user
router.put('/:id', async (req, res) => {
  try {
    const { section_id, department_id } = req.body;
    const sectionUser = await SectionUser.findByPk(req.params.id);
    if (sectionUser) {
      await sectionUser.update({
        section_id,
        department_id
      });
      res.json(sectionUser);
    } else {
      res.status(404).json({ message: 'Section user not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a section user
router.delete('/:id', async (req, res) => {
  try {
    const sectionUser = await SectionUser.findByPk(req.params.id);
    if (sectionUser) {
      await sectionUser.destroy();
      res.json({ message: 'Section user deleted' });
    } else {
      res.status(404).json({ message: 'Section user not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;