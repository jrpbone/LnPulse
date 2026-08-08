const express = require("express");
const router = express.Router();
const { ACADEMIC_INFO_T, STRAND_T, SECTION_T, DEPARTMENT_T, ACADEMIC_PERFORMANCE_T } = require("../models");


router.get("/", async (req, res) => {
  const listOfAcads = await ACADEMIC_INFO_T.findAll();
  res.json(listOfAcads);
});


// Get acads details
router.get("/:acads_id", async (req, res) => {
  const acads_id = req.params.acads_id;
  const acads = await ACADEMIC_INFO_T.findOne({
    where: { acads_id },
  });
  res.json(acads);
});


// get acads info by id + strand_name + section_name
router.get("/byStudent/:student_id", async (req, res) => {
  const student_id = req.params.student_id;
  try {
    console.log("Fetching academic info for student:", student_id);
   
    const academicInfo = await ACADEMIC_INFO_T.findAll({
      where: { student_id },
      attributes: [
        'acads_id',
        'student_id',
        'section_id',
        'strand_id',
        'department_id',
        'gradeLevel',
        'schoolYear',
        'semester',
        'entryStatus',
        'exitStatus',
        'createdAt',
        'updatedAt'
      ],
      include: [
        {
          model: STRAND_T,
          attributes: ["strand_name", "strand_id"],
        },
        {
          model: SECTION_T,
          attributes: ["section_name", "section_id"],
        },
        {
          model: DEPARTMENT_T,
          attributes: ["department_name", "department_id"],
        },
        {
          model: ACADEMIC_PERFORMANCE_T,
          attributes: ["remarks"],
          required: false // This makes it a LEFT JOIN
        }
      ],
    });

    console.log("Found academic records:", academicInfo.length);
    console.log("Academic info details:", JSON.stringify(academicInfo, null, 2));

    res.json(academicInfo);
  } catch (error) {
    console.error("Error fetching academic info:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/", async (req, res) => {
  const acads = req.body;
  console.log("Incoming acads data:", acads);
  try {
    // Create academic info record
    const created = await ACADEMIC_INFO_T.create(acads);
    
    // Create academic performance record
    await ACADEMIC_PERFORMANCE_T.create({
      acads_id: created.acads_id,
      gpa: null,
      honors: null,
      remarks: "Pending Grades"
    });

    res.json(created);
  } catch (err) {
    console.error("Error inserting acads:", err);
    res.status(500).json({ error: "Failed to insert acads" });
  }
});


router.delete("/:acads_id", async (req, res) => {
  const acads_id = req.params.acads_id;
  await ACADEMIC_INFO_T.destroy({
    where: {
      acads_id,
    },
  });
  res.json("Deleted Succesfully!");
});


router.put("/:acads_id", async (req, res) => {
  try {
    const [updated] = await ACADEMIC_INFO_T.update(req.body, {
      where: { acads_id: req.params.acads_id },
    });


    if (!updated) {
      return res.status(404).json({ error: "Record not found" });
    }


    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});


module.exports = router;