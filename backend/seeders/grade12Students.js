const { STUDENT_T, ACADEMIC_INFO_T, ADDRESS_T, PARENT_GUARDIAN_T, SECTION_T, STRAND_T } = require("../models");

async function seedGrade12Students() {
    try {
        // Create more addresses for Grade 12 students
        const addresses = await ADDRESS_T.bulkCreate([
            {
                houseNo: "234",
                street_barangay: "Nabonton",
                city_municipality: "Ligao City",
                province: "Albay"
            },
            {
                houseNo: "567",
                street_barangay: "Tambo",
                city_municipality: "Ligao City",
                province: "Albay"
            },
            {
                houseNo: "890",
                street_barangay: "Tula-tula",
                city_municipality: "Ligao City",
                province: "Albay"
            },
            {
                houseNo: "123",
                street_barangay: "Batang",
                city_municipality: "Ligao City",
                province: "Albay"
            }
        ]);

        // Create more parent/guardian records
        const guardians = await PARENT_GUARDIAN_T.bulkCreate([
            {
                pgFirstName: "Ricardo",
                pgMiddleName: "Mercado",
                pgLastName: "Lim",
                pgContactNum: "09567890123"
            },
            {
                pgFirstName: "Victoria",
                pgMiddleName: "Pangilinan",
                pgLastName: "Tan",
                pgContactNum: "09678901234"
            },
            {
                pgFirstName: "Eduardo",
                pgMiddleName: "Villanueva",
                pgLastName: "Ocampo",
                pgContactNum: "09789012345"
            },
            {
                pgFirstName: "Rosario",
                pgMiddleName: "Enriquez",
                pgLastName: "Yap",
                pgContactNum: "09890123456"
            }
        ]);

        // Extended student data with more Filipino names
        const studentData = [
            { first: "Angelo", middle: "Bautista", last: "Santos" },
            { first: "Bianca", middle: "Villanueva", last: "Reyes" },
            { first: "Carlo", middle: "Mendoza", last: "Tan" },
            { first: "Diana", middle: "Lim", last: "Cruz" },
            { first: "Eduardo", middle: "Santos", last: "Garcia" },
            { first: "Francesca", middle: "Reyes", last: "Lim" },
            { first: "Gabriel", middle: "Cruz", last: "Mendoza" },
            { first: "Hannah", middle: "Garcia", last: "Santos" },
            { first: "Ian", middle: "Tan", last: "Reyes" },
            { first: "Julia", middle: "Mendoza", last: "Cruz" },
            { first: "Kevin", middle: "Santos", last: "Garcia" },
            { first: "Lea", middle: "Cruz", last: "Tan" },
            { first: "Marco", middle: "Lim", last: "Santos" },
            { first: "Nicole", middle: "Garcia", last: "Reyes" },
            { first: "Oscar", middle: "Tan", last: "Cruz" },
            { first: "Patricia", middle: "Reyes", last: "Lim" },
            { first: "Quincy", middle: "Cruz", last: "Garcia" },
            { first: "Rachel", middle: "Santos", last: "Tan" },
            { first: "Samuel", middle: "Lim", last: "Reyes" },
            { first: "Teresa", middle: "Garcia", last: "Cruz" }
        ];

        // Get all sections with their associated strands
        const sections = await SECTION_T.findAll({
            where: { grade_level: 12 },
            include: [{
                model: STRAND_T,
                attributes: ['strand_id', 'department_id']
            }]
        });

        let studentCounter = 1; // Counter for all students

        // Create multiple students for each section
        for (const section of sections) {
            for (let i = 0; i < 4; i++) { // 4 students per section
                const studentIndex = Math.floor(Math.random() * studentData.length);
                const student = studentData[studentIndex];
                const guardianIndex = Math.floor(Math.random() * guardians.length);
                const addressIndex = Math.floor(Math.random() * addresses.length);
                
                // Generate unique LRN (using a different prefix: 111729 for Grade 12)
                const lrn = `111729${String(studentCounter).padStart(5, '0')}`;
                studentCounter++;
                
                // Random birth date between 2004 and 2006 (Grade 12 students are typically a year older)
                const year = 2004 + Math.floor(Math.random() * 3);
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
                    religion: ["Catholic", "Christian", "INC", "Born Again", "Baptist"][Math.floor(Math.random() * 5)],
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
                    gradeLevel: "12",
                    schoolYear: "2023-2024",
                    semester: "2nd Semester",
                    entryStatus: ["Continuing", "Transferee", "Shifted"][Math.floor(Math.random() * 3)],
                    exitStatus: "Pending"
                });
            }
        }

        console.log("Grade 12 students seeding completed successfully!");
    } catch (error) {
        console.error('Error seeding Grade 12 students:', error);
        throw error;
    }
}

module.exports = {
    seedGrade12Students
}; 