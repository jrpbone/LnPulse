const express = require("express");
const router = express.Router();
const { ACADEMIC_PERFORMANCE_T, ACADEMIC_INFO_T } = require("../models");

// Get academic performance by acads_id
router.get("/:acads_id", async (req, res) => {
  const { acads_id } = req.params;
  try {
    console.log('Fetching academic performance for acads_id:', acads_id);
    
    // First verify that the academic info exists
    const academicInfo = await ACADEMIC_INFO_T.findByPk(acads_id);
    if (!academicInfo) {
      console.log('Academic info not found for acads_id:', acads_id);
      return res.status(404).json({ error: "Academic info not found" });
    }

    const performance = await ACADEMIC_PERFORMANCE_T.findOne({
      where: { acads_id }
    });

    if (!performance) {
      console.log('No performance record found, creating new one');
      // Create a new performance record if none exists
      const newPerformance = await ACADEMIC_PERFORMANCE_T.create({
        acads_id,
        gpa: null,
        honors: null,
        remarks: "Pending Grades"
      });
      return res.json(newPerformance);
    }

    console.log('Found academic performance:', performance.toJSON());
    res.json(performance);
  } catch (err) {
    console.error("Error in GET /academicPerformance/:acads_id:", err);
    res.status(500).json({ 
      error: "Failed to fetch academic performance",
      details: err.message 
    });
  }
});

// Update academic performance by acads_id
router.put("/:acads_id", async (req, res) => {
  const { acads_id } = req.params;
  const { gpa, honors, remarks } = req.body;

  try {
    console.log('Updating academic performance for acads_id:', acads_id);
    console.log('Update data:', { gpa, honors, remarks });

    // First verify that the academic info exists
    const academicInfo = await ACADEMIC_INFO_T.findByPk(acads_id);
    if (!academicInfo) {
      console.log('Academic info not found for acads_id:', acads_id);
      return res.status(404).json({ error: "Academic info not found" });
    }

    // Find or create the performance record
    let [performance, created] = await ACADEMIC_PERFORMANCE_T.findOrCreate({
      where: { acads_id },
      defaults: {
        gpa: null,
        honors: null,
        remarks: "Pending Grades"
      }
    });

    // Update the record
    await performance.update({
      gpa,
      honors,
      remarks
    });

    console.log('Successfully updated performance record:', performance.toJSON());
    res.json(performance);
  } catch (err) {
    console.error("Error in PUT /academicPerformance/:acads_id:", err);
    res.status(500).json({ 
      error: "Failed to update academic performance",
      details: err.message 
    });
  }
});

// Create or update academic performance
router.post("/", async (req, res) => {
  const { acads_id, gpa, honors, remarks } = req.body;

  console.log('Received academic performance data:', {
    acads_id,
    gpa,
    honors,
    remarks
  });

  if (!acads_id) {
    console.error('Missing acads_id in request');
    return res.status(400).json({ error: "acads_id is required" });
  }

  try {
    // First verify that the academic info exists
    const academicInfo = await ACADEMIC_INFO_T.findByPk(acads_id);
    if (!academicInfo) {
      console.log('Academic info not found for acads_id:', acads_id);
      return res.status(404).json({ error: "Academic info not found" });
    }

    // Find or create the performance record
    let [performance, created] = await ACADEMIC_PERFORMANCE_T.findOrCreate({
      where: { acads_id },
      defaults: {
        gpa: null,
        honors: null,
        remarks: "Pending Grades"
      }
    });

    // Update the record if it already existed
    if (!created) {
      await performance.update({
        gpa,
        honors,
        remarks
      });
    }

    console.log('Successfully saved performance record:', performance.toJSON());
    res.json(performance);
  } catch (err) {
    console.error("Error in POST /academicPerformance:", err);
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: "Validation error", 
        details: err.errors.map(e => e.message) 
      });
    }
    res.status(500).json({ 
      error: "Failed to save academic performance",
      details: err.message 
    });
  }
});

module.exports = router;

