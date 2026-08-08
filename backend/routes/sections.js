const express = require("express");
const router = express.Router();
const {
  SECTION_T,
  ACADEMIC_INFO_T,
  STRAND_T,
  Sequelize,
} = require("../models");

router.get("/", async (req, res) => {
    const listOfSections = await SECTION_T.findAll();
    res.json(listOfSections);
})

// Get a single section by ID
router.get("/:id", async (req, res) => {
  try {
    const section = await SECTION_T.findByPk(req.params.id, {
      include: [
        {
          model: STRAND_T,
          attributes: ['strand_name']
        }
      ]
    });
    
    if (!section) {
      return res.status(404).json({ error: "Section not found" });
    }
    
    res.json(section);
  } catch (error) {
    console.error("Error fetching section:", error);
    res.status(500).json({ error: "Failed to fetch section" });
  }
});

// GET sections by strand_id with number of students and strand name
router.get("/byStrand/:strand_id", async (req, res) => {
  const { strand_id } = req.params;

  try {
    const sections = await SECTION_T.findAll({
      attributes: [
        "section_id",
        "grade_level",
        "section_name",
        [Sequelize.col("STRAND_T.strand_name"), "strand_name"],
        [
          Sequelize.fn("COUNT", Sequelize.col("ACADEMIC_INFO_Ts.section_id")),
          "number_students",
        ],
      ],
      include: [
        {
          model: ACADEMIC_INFO_T,
          attributes: [],
          required: false, // Left join to count even when 0 students
        },
        {
          model: STRAND_T,
          attributes: [],
          required: true, // Needed for strand name
        },
      ],
      where: { strand_id },
      group: [
        "SECTION_T.section_id",
        "SECTION_T.grade_level",
        "SECTION_T.section_name",
        "STRAND_T.strand_name",
      ],
      raw: true,
    });

    res.json(sections);
  } catch (err) {
    console.error("Error fetching sections by strand:", err);
    res.status(500).json({ error: "Failed to fetch sections" });
  }
});

//get all sections per department
router.get("/byDepartment/:department_id", async (req, res) => {
  const { department_id } = req.params;

  try {
    const sections = await SECTION_T.findAll({
      attributes: [
        "section_id",
        "grade_level",
        "section_name",
        [Sequelize.col("STRAND_T.strand_name"), "strand_name"],
        [
          Sequelize.literal(`COUNT(DISTINCT(
            CASE 
              WHEN ACADEMIC_INFO_Ts.exitStatus = 'Pending' 
              THEN ACADEMIC_INFO_Ts.student_id 
              ELSE NULL 
            END
          ))`),
          "number_students"
        ],
      ],
      include: [
        {
          model: ACADEMIC_INFO_T,
          attributes: [],
          required: false, // Left join to count even when 0 students
        },
        {
          model: STRAND_T,
          where: { department_id },
          attributes: [],
          required: true, // Needed for strand name
        },
      ],
      group: [
        "SECTION_T.section_id",
        "SECTION_T.grade_level",
        "SECTION_T.section_name",
        "STRAND_T.strand_name"
      ],
      raw: true,
    });

    res.json(sections);
  } catch (error) {
    console.error("Error fetching sections by department:", error);
    res.status(500).json({ error: "Failed to fetch sections" });
  }
});

// Add a section
router.post("/", async (req, res) => {
  const section = req.body;
  console.log("Incoming section data:", section);
  try {
    const created = await SECTION_T.create(section);
    res.json(created);
  } catch (err) {
    console.error("Error inserting section:", err);
    res.status(500).json({ error: "Failed to insert section" });
  }
});

// Update a section
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { section_name, grade_level, strand_id } = req.body;
  try {
    const updated = await SECTION_T.update(
      { section_name, grade_level, strand_id },
      { where: { section_id: id } }
    );
    console.log("Update result:", updated); // Useful to verify
    res.json(updated);
  } catch (err) {
    console.error(err); // log actual error
    res.status(500).json({ error: "Failed to update section" });
  }
});

// Delete a section
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await SECTION_T.destroy({ where: { section_id: id } });

    if (deleted === 0) {
      return res.status(404).json({ error: "Section not found" });
    }

    res.json({ message: "Section deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete section" });
  }
});

module.exports = router;
