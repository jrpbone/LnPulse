const express = require("express");
const router = express.Router();
const { GRADE_T, CURRICULUM_T } = require("../models");

router.get("/", async (req, res) => {
  const listOfGrades = await GRADE_T.findAll();
  res.json(listOfGrades);
});

// Get grades by acads_id
router.get("/byAcads/:acads_id", async (req, res) => {
  const { acads_id } = req.params;
  try {
    const grades = await GRADE_T.findAll({
      where: { acads_id },
      include: [{
        model: CURRICULUM_T,
        required: true
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(grades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch grades" });
  }
});

// Add a new grade
router.post("/", async (req, res) => {
  const { acads_id, curriculum_id, grade, grade_remarks } = req.body;
  try {
    const newGrade = await GRADE_T.create({
      acads_id,
      curriculum_id,
      grade,
      grade_remarks
    });
    res.status(201).json(newGrade);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add grade" });
  }
});

// Update a grade
router.put("/:grade_id", async (req, res) => {
  const { grade_id } = req.params;
  const { grade, grade_remarks } = req.body;
  try {
    const updatedGrade = await GRADE_T.update(
      { grade, grade_remarks },
      { where: { grade_id } }
    );
    res.json(updatedGrade);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update grade" });
  }
});

// Delete a grade
router.delete("/:grade_id", async (req, res) => {
  const { grade_id } = req.params;
  try {
    await GRADE_T.destroy({ where: { grade_id } });
    res.json({ message: "Grade deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete grade" });
  }
});

module.exports = router;
