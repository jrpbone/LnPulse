const express = require("express");
const router = express.Router();
const { REPORTS_T, USERS_T, DEPARTMENT_T, SECTION_T } = require("../models");

// Get all reports with filtering based on department and section
router.get("/", async (req, res) => {
  try {
    const { departmentId, sectionId } = req.query;
    let whereClause = {};
    
    // Add filters based on provided parameters
    if (departmentId) {
      whereClause.department_id = departmentId;
    }
    if (sectionId) {
      whereClause.section_id = sectionId;
    }

    const reports = await REPORTS_T.findAll({
      where: whereClause,
      include: [
        {
          model: USERS_T,
          as: 'creator',
          attributes: ['id', 'firstname', 'lastname', 'username']
        },
        {
          model: DEPARTMENT_T,
          as: 'department',
          attributes: ['department_id', 'department_name']
        },
        {
          model: SECTION_T,
          as: 'section',
          attributes: ['section_id', 'section_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single report by ID
router.get("/:id", async (req, res) => {
  try {
    const report = await REPORTS_T.findByPk(req.params.id, {
      include: [
        {
          model: USERS_T,
          as: 'creator',
          attributes: ['id', 'firstname', 'lastname', 'username']
        },
        {
          model: DEPARTMENT_T,
          as: 'department',
          attributes: ['department_id', 'department_name']
        },
        {
          model: SECTION_T,
          as: 'section',
          attributes: ['section_id', 'section_name']
        }
      ]
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new report
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      department_id,
      section_id,
      created_by
    } = req.body;

    const report = await REPORTS_T.create({
      title,
      description,
      content,
      department_id,
      section_id,
      created_by,
      created_at: new Date(),
      updated_at: new Date()
    });

    const newReport = await REPORTS_T.findByPk(report.id, {
      include: [
        {
          model: USERS_T,
          as: 'creator',
          attributes: ['id', 'firstname', 'lastname', 'username']
        },
        {
          model: DEPARTMENT_T,
          as: 'department',
          attributes: ['department_id', 'department_name']
        },
        {
          model: SECTION_T,
          as: 'section',
          attributes: ['section_id', 'section_name']
        }
      ]
    });

    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a report
router.put("/:id", async (req, res) => {
  try {
    const report = await REPORTS_T.findByPk(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const {
      title,
      description,
      content,
      department_id,
      section_id
    } = req.body;

    await report.update({
      title,
      description,
      content,
      department_id,
      section_id,
      updated_at: new Date()
    });

    const updatedReport = await REPORTS_T.findByPk(report.id, {
      include: [
        {
          model: USERS_T,
          as: 'creator',
          attributes: ['id', 'firstname', 'lastname', 'username']
        },
        {
          model: DEPARTMENT_T,
          as: 'department',
          attributes: ['department_id', 'department_name']
        },
        {
          model: SECTION_T,
          as: 'section',
          attributes: ['section_id', 'section_name']
        }
      ]
    });

    res.json(updatedReport);
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a report
router.delete("/:id", async (req, res) => {
  try {
    const report = await REPORTS_T.findByPk(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await report.destroy();
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 