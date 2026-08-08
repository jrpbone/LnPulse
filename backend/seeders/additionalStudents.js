const { STUDENT_T, ACADEMIC_INFO_T, ADDRESS_T, PARENT_GUARDIAN_T, SECTION_T, STRAND_T } = require("../models");

async function seedAdditionalStudents() {
    try {
        // Create more addresses
        const addresses = await ADDRESS_T.bulkCreate([
            {
                houseNo: "789",
                street_barangay: "Bagumbayan",
                city_municipality: "Ligao City",
                province: "Albay"
            },
            {
                houseNo: "321",
                street_barangay: "Guilid",
                city_municipality: "Ligao City",
                province: "Albay"
            },
            {
                houseNo: "456",
                street_barangay: "Binatagan",
                city_municipality: "Ligao City",
                province: "Albay"
            }
        ]);

        // Create more parent/guardian records
        const guardians = await PARENT_GUARDIAN_T.bulkCreate([
            {
                pgFirstName: "Maria",
                pgMiddleName: "Cruz",
                pgLastName: "Santos",
                pgContactNum: "09234567890"
            },
            {
                pgFirstName: "Pedro",
                pgMiddleName: "Garcia",
                pgLastName: "Reyes",
                pgContactNum: "09345678901"
            },
            {
                pgFirstName: "Elena",
                pgMiddleName: "Magtanggol",
                pgLastName: "Ramos",
                pgContactNum: "09456789012"
            }
        ]);

        // Student data with Filipino names
        const studentData = [
            { first: "Juan", middle: "Santos", last: "Dela Cruz" },
            { first: "Maria", middle: "Garcia", last: "Santos" },
            { first: "Jose", middle: "Reyes", last: "Ramos" },
            { first: "Ana", middle: "Cruz", last: "Bautista" },
            { first: "Pedro", middle: "Luna", last: "Torres" },
            { first: "Sofia", middle: "Rizal", last: "Gonzales" },
            { first: "Miguel", middle: "Aquino", last: "Fernandez" },
            { first: "Isabella", middle: "Marcos", last: "Lopez" },
            { first: "Gabriel", middle: "Bonifacio", last: "Reyes" },
            { first: "Emma", middle: "Aguinaldo", last: "Martinez" }
        ];

        // Get all sections with their associated strands
        const sections = await SECTION_T.findAll({
            where: { grade_level: 11 },
            include: [{
                model: STRAND_T,
                attributes: ['strand_id', 'department_id']
            }]
        });

        let studentCounter = 1; // Counter for all students

        // Create multiple students for each section
        for (const section of sections) {
            for (let i = 0; i < 3; i++) { // 3 students per section
                const studentIndex = Math.floor(Math.random() * studentData.length);
                const student = studentData[studentIndex];
                const guardianIndex = Math.floor(Math.random() * guardians.length);
                const addressIndex = Math.floor(Math.random() * addresses.length);
                
                // Generate unique LRN (using a different prefix: 111728 instead of 111727)
                const lrn = `111728${String(studentCounter).padStart(5, '0')}`;
                studentCounter++;
                
                // Random birth date between 2005 and 2007
                const year = 2005 + Math.floor(Math.random() * 3);
                const month = 1 + Math.floor(Math.random() * 12);
                const day = 1 + Math.floor(Math.random() * 28);
                const birthDate = new Date(year, month - 1, day);
                const age = new Date().getFullYear() - birthDate.getFullYear();

                // Random height and weight for realistic BMI
                const height = 150 + Math.floor(Math.random() * 30); // 150-180 cm
                const weight = 45 + Math.floor(Math.random() * 30);  // 45-75 kg
                const bmi = (weight / ((height/100) * (height/100))).toFixed(2);

                // Create student
                const newStudent = await STUDENT_T.create({
                    student_id: lrn,
                    guardian_id: guardians[guardianIndex].parent_guardian_id,
                    currentAddress: addresses[addressIndex].address_id,
                    permanentAddress: addresses[(addressIndex + 1) % addresses.length].address_id,
                    first_name: student.first,
                    middle_name: student.middle,
                    last_name: student.last,
                    suffix: null,
                    birth_date: birthDate,
                    place_of_birth: "Ligao City",
                    age: age,
                    sex: i % 2 === 0 ? "Male" : "Female",
                    contact_num: `09${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
                    email: `${student.first.toLowerCase()}.${student.last.toLowerCase()}@example.com`,
                    religion: ["Catholic", "Christian", "INC", "Born Again"][Math.floor(Math.random() * 4)],
                    height: height,
                    weight: weight,
                    bmi: bmi,
                    nationality: "Filipino",
                    status: "active"
                });

                // Create academic info with correct department_id from strand
                await ACADEMIC_INFO_T.create({
                    student_id: lrn,
                    department_id: section.STRAND_T.department_id,
                    strand_id: section.strand_id,
                    section_id: section.section_id,
                    gradeLevel: "11",
                    schoolYear: "2023-2024",
                    semester: "1st Semester",
                    entryStatus: ["New Enrollee", "Transferee"][Math.floor(Math.random() * 2)],
                    exitStatus: "Pending"
                });
            }
        }

        console.log("Additional students seeding completed successfully!");
    } catch (error) {
        console.error('Error seeding additional students:', error);
        throw error;
    }
}

module.exports = {
    seedAdditionalStudents
}; 