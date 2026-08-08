const express = require("express");
const router = express.Router();
const { CURRICULUM_T, Sequelize } = require("../models");
const { Op } = require("sequelize");

// Get curriculum by strand ID (only regular subjects)
router.get("/byStrand/:strand_id", async (req, res) => {
  const { strand_id } = req.params;

  try {
    const curriculumEntries = await CURRICULUM_T.findAll({
      where: { 
        strand_id,
        isRegular: true
      }
    });

    // Transform the data into the required format
    const curriculum = {
      11: {
        '1st Semester': { core: [], specialized: [] },
        '2nd Semester': { core: [], specialized: [] }
      },
      12: {
        '1st Semester': { core: [], specialized: [] },
        '2nd Semester': { core: [], specialized: [] }
      }
    };

    curriculumEntries.forEach(entry => {
      curriculum[entry.grade_level][entry.semester][entry.type].push({
        curriculum_id: entry.curriculum_id,
        subject_name: entry.subject_name,
        subject_description: entry.subject_description
      });
    });

    res.json(curriculum);
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Assign subject to curriculum
router.post("/assign", async (req, res) => {
  const { strand_id, subject_name, subject_description, grade_level, semester, type, isRegular } = req.body;

  try {
    // Check if subject already exists (case insensitive)
    const existing = await CURRICULUM_T.findOne({
      where: {
        strand_id,
        grade_level,
        semester,
        subject_name: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('subject_name')),
          Sequelize.fn('LOWER', subject_name)
        )
      }
    });

    if (existing) {
      return res.status(400).json({ error: "Subject already exists in this slot" });
    }

    // Create new curriculum entry
    const newEntry = await CURRICULUM_T.create({
      strand_id,
      subject_name,
      subject_description,
      grade_level,
      semester,
      type,
      isRegular: isRegular !== undefined ? isRegular : true // Use provided value or default to true
    });

    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error assigning subject to curriculum:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove subject from curriculum
router.delete("/:curriculum_id", async (req, res) => {
  const { curriculum_id } = req.params;

  try {
    const result = await CURRICULUM_T.destroy({
      where: { curriculum_id }
    });

    if (result === 0) {
      return res.status(404).json({ error: "Curriculum entry not found" });
    }

    res.json({ message: "Successfully removed subject from curriculum" });
  } catch (error) {
    console.error("Error removing subject from curriculum:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all subjects for a specific strand, grade level, and semester (including irregular)
router.get("/subjects/:strand_id/:grade_level/:semester", async (req, res) => {
  const { strand_id, grade_level, semester } = req.params;

  try {
    const subjects = await CURRICULUM_T.findAll({
      where: {
        strand_id,
        grade_level,
        semester
      }
    });

    res.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router; 