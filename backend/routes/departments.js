const express = require('express')
const router = express.Router()
const { DEPARTMENT_T, STRAND_T, ACADEMIC_INFO_T, STUDENT_T, Sequelize } = require("../models");
const { Op } = require("sequelize");

router.get("/", async (req, res) => {
    try {
        const departments = await DEPARTMENT_T.findAll({
            attributes: [
                'department_id',
                'department_name',
                'department_description',
                [
                    Sequelize.literal(`(
                        SELECT COUNT(DISTINCT s.student_id)
                        FROM STUDENT_T s
                        JOIN ACADEMIC_INFO_T a ON s.student_id = a.student_id
                        WHERE a.department_id = DEPARTMENT_T.department_id
                        AND s.status = 'active'
                        AND a.schoolYear = '2023-2024'
                    )`),
                    'currentStudentCount'
                ]
            ]
        });
        res.json(departments);
    } catch (err) {
        console.error("Error fetching departments:", err);
        res.status(500).json({ error: "Failed to fetch departments" });
    }
});

router.get("/:department_id/strands", async (req, res) => {
    const { department_id } = req.params;
    try {
        const strands = await STRAND_T.findAll({
            where: { department_id },
        });
        res.json(strands);
    } catch (err) {
        console.error("Error fetching strands:", err);
        res.status(500).json({ error: "Failed to fetch strands" });
    }
});

router.post("/", async (req, res) => {
    const dept = req.body;
    console.log("Incoming dept data:", dept);
    try {
        const created = await DEPARTMENT_T.create(dept);
        res.json(created);
    } catch (err) {
        console.error("Error inserting dept:", err);
        res.status(500).json({ error: "Failed to insert dept" });
    }
});

// Update department
router.put("/:department_id", async (req, res) => {
    const { department_id } = req.params;
    const updates = req.body;
    try {
        const department = await DEPARTMENT_T.findByPk(department_id);
        if (!department) {
            return res.status(404).json({ error: "Department not found" });
        }
        await department.update(updates);
        res.json(department);
    } catch (err) {
        console.error("Error updating department:", err);
        res.status(500).json({ error: "Failed to update department" });
    }
});

// Delete department
router.delete("/:department_id", async (req, res) => {
    const { department_id } = req.params;
    try {
        const department = await DEPARTMENT_T.findByPk(department_id);
        if (!department) {
            return res.status(404).json({ error: "Department not found" });
        }
        await department.destroy();
        res.json({ message: "Department deleted successfully" });
    } catch (err) {
        console.error("Error deleting department:", err);
        res.status(500).json({ error: "Failed to delete department" });
    }
});

module.exports = router;