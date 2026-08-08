const express = require("express");
const router = express.Router();
const { CURRICULUM_T, ACADEMIC_INFO_T, STRAND_T } = require("../models");
const { Op } = require("sequelize");

// Get all subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await CURRICULUM_T.findAll({
      attributes: ['subject_name', 'subject_description'],
      group: ['subject_name', 'subject_description']
    });
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// Get common subjects
router.get("/common", async (req, res) => {
  try {
    const subjects = await CURRICULUM_T.findAll({
      where: { type: 'core' },
      attributes: ['subject_name', 'subject_description'],
      group: ['subject_name', 'subject_description']
    });
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch common subjects" });
  }
});

// Get subjects by strand
router.get("/byStrand/:strand_id", async (req, res) => {
  const { strand_id } = req.params;
  try {
    const subjects = await CURRICULUM_T.findAll({
      where: { strand_id },
      attributes: ['curriculum_id', 'subject_name', 'subject_description', 'type']
    });
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch subjects for strand" });
  }
});

// Get subjects based on acads_id's strand
router.get("/byAcadsStrand/:acads_id", async (req, res) => {
  const acads_id = req.params.acads_id;

  try {
    // First get the academic info to find the strand_id
    const academicInfo = await ACADEMIC_INFO_T.findByPk(acads_id);

    if (!academicInfo) {
      return res.status(404).json({ error: "Academic info not found" });
    }

    const strand_id = academicInfo.strand_id;

    // Now get the subjects tied to that strand_id
    const subjects = await CURRICULUM_T.findAll({
      where: { strand_id },
    });

    res.json(subjects);
  } catch (err) {
    console.error("Error fetching subjects by strand:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/byStudent/:student_id", async (req, res) => {
  const { student_id } = req.params;

  try {
    // Find academic info using student_id
    const academicInfo = await ACADEMIC_INFO_T.findOne({
      where: { student_id },
    });

    if (!academicInfo || !academicInfo.strand) {
      return res.status(404).json({ error: "Strand not found for student" });
    }

    // Fetch subjects matching the student's strand
    const subjects = await CURRICULUM_T.findAll({
      where: { strand: academicInfo.strand },
      attributes: ["subject_name", "subject_description"],
    });

    res.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects by student:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get subjects by department
router.get("/byDepartment/:department_id", async (req, res) => {
  const { department_id } = req.params;

  try {
    const subjects = await CURRICULUM_T.findAll({
      include: [{
        model: STRAND_T,
        required: true,
        where: { department_id }
      }]
    });
    res.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects by department:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add new subject
router.post("/", async (req, res) => {
  const subject = req.body;
  try {
    const created = await CURRICULUM_T.create({
      subject_name: subject.subject_name,
      subject_description: subject.subject_description
    });
    res.json(created);
  } catch (err) {
    console.error("Error inserting subject:", err);
    res.status(500).json({ error: "Failed to insert subject" });
  }
});

// Update subject by ID
router.put("/:subject_id", async (req, res) => {
  const subject_id = req.params.subject_id;
  const { subject_name, subject_description } = req.body;

  try {
    const updated = await CURRICULUM_T.update(
      {
        subject_name,
        subject_description
      },
      {
        where: { subject_id }
      }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ error: "Subject not found or no changes made" });
    }

    res.json({ message: "Subject updated successfully" });
  } catch (err) {
    console.error("Error updating subject:", err);
    res.status(500).json({ error: "Failed to update subject" });
  }
});

// Delete subject by ID
router.delete("/:subject_id", async (req, res) => {
  const subject_id = req.params.subject_id;

  try {
    const deleted = await CURRICULUM_T.destroy({
      where: { subject_id }
    });

    if (!deleted) {
      return res.status(404).json({ error: "Subject not found" });
    }

    res.json({ message: "Subject deleted successfully" });
  } catch (err) {
    console.error("Error deleting subject:", err);
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

module.exports = router;
