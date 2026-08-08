const express = require("express");
const router = express.Router();
const { ACADEMIC_SETTINGS_T } = require("../models");
const { Op } = require("sequelize");

// Get current academic settings
router.get("/current", async (req, res) => {
  try {
    const settings = await ACADEMIC_SETTINGS_T.findOne({
      where: { is_active: true }
    });
    res.json(settings);
  } catch (error) {
    console.error("Error fetching academic settings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update academic settings
router.put("/update", async (req, res) => {
  try {
    const { current_school_year, current_semester } = req.body;

    // Validate school year format (YYYY-YYYY)
    const yearRegex = /^\d{4}-\d{4}$/;
    if (!yearRegex.test(current_school_year)) {
      return res.status(400).json({ message: "Invalid school year format. Use YYYY-YYYY" });
    }

    // Validate years are consecutive
    const [startYear, endYear] = current_school_year.split("-").map(Number);
    if (endYear !== startYear + 1) {
      return res.status(400).json({ message: "School year must be consecutive years" });
    }

    // Validate current year
    const currentYear = new Date().getFullYear();
    if (startYear > currentYear || endYear < currentYear) {
      return res.status(400).json({ message: "School year must include current year" });
    }

    // Validate semester
    if (!["1st Semester", "2nd Semester", "Summer Class"].includes(current_semester)) {
      return res.status(400).json({ message: "Invalid semester" });
    }

    // Deactivate all current settings
    await ACADEMIC_SETTINGS_T.update(
      { is_active: false },
      { where: { is_active: true } }
    );

    // Create new settings
    const newSettings = await ACADEMIC_SETTINGS_T.create({
      current_school_year,
      current_semester,
      is_active: true
    });

    res.json(newSettings);
  } catch (error) {
    console.error("Error updating academic settings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router; 