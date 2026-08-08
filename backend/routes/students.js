const express = require("express");
const router = express.Router();
const {
  STUDENT_T,
  ADDRESS_T,
  PARENT_GUARDIAN_T,
  ACADEMIC_INFO_T,
  SECTION_T,
  STRAND_T,
  sequelize,
} = require("../models");

router.get("/", async (req, res) => {
  const listOfStudents = await STUDENT_T.findAll();
  res.json(listOfStudents);
});

router.get("/byId/:student_id", async (req, res) => {
  const student_id = req.params.student_id;

  try {
    const student = await STUDENT_T.findByPk(student_id, {
      include: [
        {
          model: PARENT_GUARDIAN_T,
        },
        {
          model: ADDRESS_T,
          as: "currentAddressData",
        },
        {
          model: ADDRESS_T,
          as: "permanentAddressData",
        },
      ],
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(student);
  } catch (err) {
    console.error("Error fetching student data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const {
    studentID,
    firstName,
    middleName,
    lastName,
    suffix,
    birthDate,
    placeOfBirth,
    age,
    sex,
    contactNumber,
    email,
    religion,
    nationality,
    height,
    weight,
    bmi,
    currentAddress,
    permanentAddress,
    pgFirstName,
    pgMiddleName,
    pgLastName,
    pgContactNum,
  } = req.body;

  const transaction = await sequelize.transaction();
  try {
    // Check if student ID already exists
    const existingStudent = await STUDENT_T.findOne({
      where: { student_id: studentID },
      transaction
    });

    if (existingStudent) {
      await transaction.rollback();
      return res.status(400).json({ message: "Student ID already exists" });
    }

    // Utility function to find or create address
    const findOrCreateAddress = async (addr) => {
      const existing = await ADDRESS_T.findOne({
        where: {
          houseNo: addr.houseNumber,
          street_barangay: addr.streetBarangay,
          city_municipality: addr.cityMunicipality,
          province: addr.province,
        },
        transaction,
      });

      if (existing) return existing;
      return await ADDRESS_T.create(
        {
          houseNo: addr.houseNumber,
          street_barangay: addr.streetBarangay,
          city_municipality: addr.cityMunicipality,
          province: addr.province,
        },
        { transaction }
      );
    };

    // Utility function to find or create guardian
    const findOrCreateGuardian = async () => {
      const existing = await PARENT_GUARDIAN_T.findOne({
        where: {
          pgFirstName: pgFirstName,
          pgMiddleName: pgMiddleName,
          pgLastName: pgLastName,
          pgContactNum: pgContactNum,
        },
        transaction,
      });

      if (existing) return existing;
      return await PARENT_GUARDIAN_T.create(
        {
          pgFirstName: pgFirstName,
          pgMiddleName: pgMiddleName,
          pgLastName: pgLastName,
          pgContactNum: pgContactNum,
        },
        { transaction }
      );
    };

    const current = await findOrCreateAddress(currentAddress);
    const permanent = await findOrCreateAddress(permanentAddress);
    const guardian = await findOrCreateGuardian();

    const student = await STUDENT_T.create(
      {
        student_id: studentID,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        suffix: suffix || "NONE",
        birth_date: birthDate,
        place_of_birth: placeOfBirth,
        age,
        sex,
        contact_num: contactNumber,
        email,
        religion,
        nationality: nationality || "Filipino",
        height,
        weight,
        bmi,
        currentAddress: current.address_id,
        permanentAddress: permanent.address_id,
        guardian_id: guardian.parent_guardian_id,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json({
      message: "Student and related records saved successfully.",
      student,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("❌ Failed to insert student and related data:", err);
    res.status(500).json({ 
      message: "Failed to create student. Please check your input and try again.",
      error: err.message 
    });
  }
});

router.put("/:student_id", async (req, res) => {
  const student_id = req.params.student_id;
  const {
    studentID,
    firstName,
    middleName,
    lastName,
    suffix,
    birthDate,
    placeOfBirth,
    age,
    sex,
    contactNumber,
    email,
    religion,
    nationality,
    height,
    weight,
    bmi,
    currentAddress,
    permanentAddress,
    pgFirstName,
    pgMiddleName,
    pgLastName,
    pgContactNum,
  } = req.body;

  const transaction = await sequelize.transaction();
  try {
    const student = await STUDENT_T.findByPk(student_id, { transaction });

    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ error: "Student not found" });
    }

    // Utility function to find or create address
    const findOrCreateAddress = async (addr) => {
      const existing = await ADDRESS_T.findOne({
        where: {
          houseNo: addr.houseNumber,
          street_barangay: addr.streetBarangay,
          city_municipality: addr.cityMunicipality,
          province: addr.province,
        },
        transaction,
      });

      if (existing) return existing;
      return await ADDRESS_T.create(
        {
          houseNo: addr.houseNumber,
          street_barangay: addr.streetBarangay,
          city_municipality: addr.cityMunicipality,
          province: addr.province,
        },
        { transaction }
      );
    };

    // Utility function to find or create guardian
    const findOrCreateGuardian = async () => {
      const existing = await PARENT_GUARDIAN_T.findOne({
        where: {
          pgFirstName,
          pgMiddleName,
          pgLastName,
          pgContactNum,
        },
        transaction,
      });

      if (existing) return existing;
      return await PARENT_GUARDIAN_T.create(
        {
          pgFirstName,
          pgMiddleName,
          pgLastName,
          pgContactNum,
        },
        { transaction }
      );
    };

    const current = await findOrCreateAddress(currentAddress);
    const permanent = await findOrCreateAddress(permanentAddress);
    const guardian = await findOrCreateGuardian();

    await student.update(
      {
        student_id: studentID,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        suffix: suffix,
        birth_date: birthDate,
        place_of_birth: placeOfBirth,
        age,
        sex,
        contact_num: contactNumber,
        email,
        religion,
        nationality: nationality || "Filipino",
        height,
        weight,
        bmi,
        currentAddress: current.address_id,
        permanentAddress: permanent.address_id,
        guardian_id: guardian.parent_guardian_id,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json({
      message: "Student record updated successfully.",
      student,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("❌ Failed to update student:", err);
    res.status(500).json({ error: "Update failed." });
  }
});

// Get students by section
router.get("/section/:sectionId", async (req, res) => {
  const { sectionId } = req.params;

  try {
    // Convert sectionId to number and validate
    const numericSectionId = Number(sectionId);
    if (isNaN(numericSectionId)) {
      return res.status(400).json({ error: "Invalid section ID format" });
    }

    const students = await STUDENT_T.findAll({
      include: [
        {
          model: ACADEMIC_INFO_T,
          required: true,
          where: { section_id: numericSectionId },
          include: [
            {
              model: SECTION_T,
              required: true,
            },
          ],
        },
      ],
      order: [['student_id', 'ASC']] // Add consistent ordering
    });

    if (!students.length) {
      console.log(`No students found for section ID: ${numericSectionId}`);
    }

    res.json(students);
  } catch (error) {
    console.error("Error fetching students by section:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get students by department
router.get("/department/:departmentId", async (req, res) => {
  const { departmentId } = req.params;

  try {
    const students = await STUDENT_T.findAll({
      include: [
        {
          model: ACADEMIC_INFO_T,
          required: true,
          include: [
            {
              model: SECTION_T,
              required: true,
              include: [
                {
                  model: STRAND_T,
                  required: true,
                  where: { department_id: departmentId }
                }
              ]
            }
          ]
        },
        {
          model: PARENT_GUARDIAN_T,
        },
        {
          model: ADDRESS_T,
          as: "currentAddressData",
        },
        {
          model: ADDRESS_T,
          as: "permanentAddressData",
        }
      ],
      distinct: true
    });

    res.json(students);
  } catch (error) {
    console.error("Error fetching students by department:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update student status
router.put("/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const student = await STUDENT_T.findByPk(id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.update({ status });

    res.json({ message: 'Status updated successfully', status });
  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(500).json({ message: 'Failed to update student status' });
  }
});

// Address routes
router.get("/address", async (req, res) => {
  const listOfAddress = await ADDRESS_T.findAll();
  res.json(listOfAddress);
});

router.post("/address", async (req, res) => {
  const address = req.body;
  console.log("Incoming address data:", address);
  try {
    const created = await ADDRESS_T.create(address);
    res.json(created);
  } catch (err) {
    console.error("Error inserting address:", err);
    res.status(500).json({ error: "Failed to insert address" });
  }
});

// Parent/Guardian routes
router.get("/parent-guardian", async (req, res) => {
  const listOfPGs = await PARENT_GUARDIAN_T.findAll();
  res.json(listOfPGs);
});

router.post("/parent-guardian", async (req, res) => {
  const ParentGuardian = req.body;
  console.log("Incoming ParentGuardian data:", ParentGuardian);
  try {
    const created = await PARENT_GUARDIAN_T.create(ParentGuardian);
    res.json(created);
  } catch (err) {
    console.error("Error inserting ParentGuardian:", err);
    res.status(500).json({ error: "Failed to insert ParentGuardian" });
  }
});

module.exports = router;
