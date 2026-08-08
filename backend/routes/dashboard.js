const express = require("express");
const router = express.Router();
const { STUDENT_T, USERS_T, DEPARTMENT_T } = require("../models");

router.get("/stats", async (req, res) => {
  try {
    const totalStudents = await STUDENT_T.count({
      where: {
        status: 'active'
      }
    });

    const activeStudents = await STUDENT_T.count({
      where: {
        status: 'active'
      }
    });

    const totalDepartments = await DEPARTMENT_T.count();

    const totalUsers = await USERS_T.count({
      where: {
        status: 1
      }
    });

    res.json({
      totalStudents: totalStudents || 0,
      activeStudents: activeStudents || 0,
      totalDepartments: totalDepartments || 0,
      totalUsers: totalUsers || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = router; 