const { DEPARTMENT_T, STRAND_T, SECTION_T, CURRICULUM_T, USERS_T, SECTION_USER_T, DEPARTMENT_USER_T, STUDENT_T, ACADEMIC_INFO_T, ADDRESS_T, PARENT_GUARDIAN_T } = require("../models");
const bcrypt = require('bcrypt');

async function seedInitialData() {
    try {
        //departments
        const departments = await DEPARTMENT_T.bulkCreate([
            {
                department_name: "TVL Department",
                department_description: "Technical-Vocational-Livelihood"
            },
            {
                department_name: "FEH Department",
                department_description: "HUMSS | GAS"
            },
            {
                department_name: "AMS Department",
                department_description: "STEM | ABM"
            }
        ]);

        const strands = await STRAND_T.bulkCreate([
            {
                department_id: departments[1].department_id,
                strand_name: "HUMSS",
                strand_description: "Humanities and Social Sciences"
            },
            {
                department_id: departments[1].department_id,
                strand_name: "GAS",
                strand_description: "General Academic Strand"
            },
            {
                department_id: departments[2].department_id,
                strand_name: "STEM",
                strand_description: "Science, Technology, Engineering, and Mathematics"
            },
            {
                department_id: departments[2].department_id,
                strand_name: "ABM",
                strand_description: "Accountancy, Business, and Management"
            },
            {
                department_id: departments[2].department_id,
                strand_name: "A&D",
                strand_description: "Arts and Design"
            },
            {
                department_id: departments[0].department_id,
                strand_name: "TVL-ICT (CSS)",
                strand_description: "TVL - Information and Communications Technology (Computer Systems Servicing)"
            },
            {
                department_id: departments[0].department_id,
                strand_name: "TVL-IA (EPAS)",
                strand_description: "TVL - Industrial Arts (Electronic Product Assembly and Servicing)"
            },
            {
                department_id: departments[0].department_id,
                strand_name: "TVL-IA (EIM)",
                strand_description: "TVL - Industrial Arts (Electrical Installation and Maintenance)"
            },
            {
                department_id: departments[0].department_id,
                strand_name: "TVL-HE (Dressmaking)",
                strand_description: "TVL - Home Economics (Dressmaking)"
            },
            {
                department_id: departments[0].department_id,
                strand_name: "TVL-HE (Cookery)",
                strand_description: "TVL - Home Economics (Cookery)"
            },
            {
                department_id: departments[0].department_id,
                strand_name: "TVL-HE (BNC)",
                strand_description: "TVL - Home Economics (Beauty/Nail Care)"
            },
        ]);
        
        await SECTION_T.bulkCreate([
            // HUMSS
            {
                strand_id: strands[0].strand_id,
                grade_level: 11,
                section_name: "HUMSS-1"
            },
            {
                strand_id: strands[0].strand_id,
                grade_level: 12,
                section_name: "HUMSS-2"
            },
            // GAS
            {
                strand_id: strands[1].strand_id,
                grade_level: 11,
                section_name: "GAS-1"
            },
            {
                strand_id: strands[1].strand_id,
                grade_level: 12,
                section_name: "GAS-2"
            },
            // STEM
            {
                strand_id: strands[2].strand_id,
                grade_level: 11,
                section_name: "STEM-1"
            },
            {
                strand_id: strands[2].strand_id,
                grade_level: 12,
                section_name: "STEM-2"
            },
            // ABM
            {
                strand_id: strands[3].strand_id,
                grade_level: 11,
                section_name: "ABM-1"
            },
            {
                strand_id: strands[3].strand_id,
                grade_level: 12,
                section_name: "ABM-2"
            },
            // A&D
            {
                strand_id: strands[4].strand_id,
                grade_level: 11,
                section_name: "A&D-1"
            },
            {
                strand_id: strands[4].strand_id,
                grade_level: 12,
                section_name: "A&D-2"
            },
            // TVL-ICT (CSS)
            {
                strand_id: strands[5].strand_id,
                grade_level: 11,
                section_name: "CSS"
            },
            {
                strand_id: strands[5].strand_id,
                grade_level: 12,
                section_name: "CSS"
            },
            // TVL-IA (EPAS)
            {
                strand_id: strands[6].strand_id,
                grade_level: 11,
                section_name: "EPAS"
            },
            {
                strand_id: strands[6].strand_id,
                grade_level: 12,
                section_name: "EPAS"
            },
            // TVL-IA (EIM)
            {
                strand_id: strands[7].strand_id,
                grade_level: 11,
                section_name: "EIM"
            },
            {
                strand_id: strands[7].strand_id,
                grade_level: 12,
                section_name: "EIM"
            },
            // TVL-HE (Dressmaking)
            {
                strand_id: strands[8].strand_id,
                grade_level: 11,
                section_name: "Dressmaking"
            },
            {
                strand_id: strands[8].strand_id,
                grade_level: 12,
                section_name: "Dressmaking"
            },
            // TVL-HE (Cookery)
            {
                strand_id: strands[9].strand_id,
                grade_level: 11,
                section_name: "Cookery"
            },
            {
                strand_id: strands[9].strand_id,
                grade_level: 12,
                section_name: "Cookery"
            },
            // TVL-HE (BNC)
            {
                strand_id: strands[10].strand_id,
                grade_level: 11,
                section_name: "BNC"
            },
            {
                strand_id: strands[10].strand_id,
                grade_level: 12,
                section_name: "BNC"
            }
        ]);

        // Define common subjects for all strands
        const commonSubjects = {
            grade11: {
                firstSem: [
                    {
                        subject_name: "Oral Communication",
                        subject_description: "Core subject focusing on oral communication skills"
                    },
                    {
                        subject_name: "Komunikasyon at Pananaliksik",
                        subject_description: "Core subject for Filipino communication and research"
                    },
                    {
                        subject_name: "General Mathematics",
                        subject_description: "Core subject for general mathematics"
                    },
                    {
                        subject_name: "Earth and Life Science",
                        subject_description: "Core subject for earth and life sciences"
                    },
                    {
                        subject_name: "Understanding Culture, Society and Politics",
                        subject_description: "Core subject for understanding society and culture"
                    },
                    {
                        subject_name: "Contemporary Philippine Arts from the Regions",
                        subject_description: "Core subject for Philippine arts and culture"
                    },
                    {
                        subject_name: "PE and Health 1",
                        subject_description: "Core subject for physical education and health"
                    }
                ],
                secondSem: [
                    {
                        subject_name: "Reading and Writing",
                        subject_description: "Core subject for reading and writing skills"
                    },
                    {
                        subject_name: "Pagbasa at Pagsusuri",
                        subject_description: "Core subject for reading and analysis"
                    },
                    {
                        subject_name: "Statistics and Probability",
                        subject_description: "Core subject for statistics and probability"
                    },
                    {
                        subject_name: "Physical Science",
                        subject_description: "Core subject for physical sciences"
                    },
                    {
                        subject_name: "PR1",
                        subject_description: "Practical Research 1 - Introduction to research methodologies"
                    },
                    {
                        subject_name: "21st Century Literature",
                        subject_description: "Core subject for contemporary literature"
                    },
                    {
                        subject_name: "PE and Health 2",
                        subject_description: "Core subject for physical education and health"
                    }
                ]
            },
            grade12: {
                firstSem: [
                    {
                        subject_name: "Media and Information Literacy",
                        subject_description: "Core subject for media and information literacy"
                    },
                    {
                        subject_name: "Introduction to Philosophy of the Human Person",
                        subject_description: "Core subject for philosophy and human person"
                    },
                    {
                        subject_name: "PR2",
                        subject_description: "Practical Research 2 - Advanced research methodologies"
                    },
                    {
                        subject_name: "PE and Health 3",
                        subject_description: "Core subject for physical education and health"
                    }
                ],
                secondSem: [
                    {
                        subject_name: "III",
                        subject_description: "Inquiries, Investigation, and Immersion - Applied research and field work"
                    },
                    {
                        subject_name: "Personal Development",
                        subject_description: "Core subject for personal growth and development"
                    },
                    {
                        subject_name: "PE and Health 4",
                        subject_description: "Core subject for physical education and health"
                    }
                ]
            }
        };

        // Add common subjects to all strands
        for (const strand of strands) {
            // Grade 11 First Semester
            await CURRICULUM_T.bulkCreate(
                commonSubjects.grade11.firstSem.map(subject => ({
                    strand_id: strand.strand_id,
                    subject_name: subject.subject_name,
                    subject_description: subject.subject_description,
                    grade_level: "11",
                    semester: "1st Semester",
                    type: "core",
                    isRegular: true
                }))
            );

            // Grade 11 Second Semester
            await CURRICULUM_T.bulkCreate(
                commonSubjects.grade11.secondSem.map(subject => ({
                    strand_id: strand.strand_id,
                    subject_name: subject.subject_name,
                    subject_description: subject.subject_description,
                    grade_level: "11",
                    semester: "2nd Semester",
                    type: "core",
                    isRegular: true
                }))
            );

            // Grade 12 First Semester
            await CURRICULUM_T.bulkCreate(
                commonSubjects.grade12.firstSem.map(subject => ({
                    strand_id: strand.strand_id,
                    subject_name: subject.subject_name,
                    subject_description: subject.subject_description,
                    grade_level: "12",
                    semester: "1st Semester",
                    type: "core",
                    isRegular: true
                }))
            );

            // Grade 12 Second Semester
            await CURRICULUM_T.bulkCreate(
                commonSubjects.grade12.secondSem.map(subject => ({
                    strand_id: strand.strand_id,
                    subject_name: subject.subject_name,
                    subject_description: subject.subject_description,
                    grade_level: "12",
                    semester: "2nd Semester",
                    type: "core",
                    isRegular: true
                }))
            );
        }

        // Initialize Users with hashed passwords
        const saltRounds = 10;
        const defaultPassword = "password123"; // You can change this default password
        const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

        const users = await USERS_T.bulkCreate([
            // Department Users
            {
                firstname: "John",
                lastname: "Smith",
                username: "tvl_head",
                password: hashedPassword,
                type: "department_user",
                status: 1
            },
            {
                firstname: "Maria",
                lastname: "Garcia",
                username: "feh_head",
                password: hashedPassword,
                type: "department_user",
                status: 1
            },
            {
                firstname: "Robert",
                lastname: "Johnson",
                username: "ams_head",
                password: hashedPassword,
                type: "department_user",
                status: 1
            },
            // Section Users
            {
                firstname: "Sarah",
                lastname: "Williams",
                username: "humss_adviser",
                password: hashedPassword,
                type: "section_user",
                status: 1
            },
            {
                firstname: "Michael",
                lastname: "Brown",
                username: "stem_adviser",
                password: hashedPassword,
                type: "section_user",
                status: 1
            },
            {
                firstname: "Emily",
                lastname: "Davis",
                username: "abm_adviser",
                password: hashedPassword,
                type: "section_user",
                status: 1
            }
        ]);

        // Initialize Department Users
        await DEPARTMENT_USER_T.bulkCreate([
            {
                user_id: users[0].id,
                department_id: departments[0].department_id // TVL Department
            },
            {
                user_id: users[1].id,
                department_id: departments[1].department_id // FEH Department
            },
            {
                user_id: users[2].id,
                department_id: departments[2].department_id // AMS Department
            }
        ]);

        // Initialize Section Users
        await SECTION_USER_T.bulkCreate([
            {
                user_id: users[3].id,
                section_id: 1, // HUMSS-1
                department_id: departments[1].department_id // FEH Department
            },
            {
                user_id: users[4].id,
                section_id: 5, // STEM-1
                department_id: departments[2].department_id // AMS Department
            },
            {
                user_id: users[5].id,
                section_id: 7, // ABM-1
                department_id: departments[2].department_id // AMS Department
            }
        ]);

        // Create addresses first
        const addresses = await ADDRESS_T.bulkCreate([
            {
                houseNo: "123",
                street_barangay: "Tuburan",
                city_municipality: "Ligao City",
                province: "Albay"
            },
            {
                houseNo: "456",
                street_barangay: "Paulba",
                city_municipality: "Ligao City",
                province: "Albay"
            }
        ]);

        // Create parent/guardian records
        const guardians = await PARENT_GUARDIAN_T.bulkCreate([
            {
                pgFirstName: "Juan",
                pgMiddleName: "Santos",
                pgLastName: "Dela Cruz",
                pgContactNum: "09123456789"
            }
        ]);

        // Create one student for each strand
        for (let i = 0; i < strands.length; i++) {
            const strand = strands[i];
            const lrn = `11172710${String(i + 1).padStart(4, '0')}`;
            const birthDate = new Date('2006-01-01');
            const age = new Date().getFullYear() - birthDate.getFullYear();

            // Create student
            const student = await STUDENT_T.create({
                student_id: lrn,
                guardian_id: guardians[0].parent_guardian_id,
                currentAddress: addresses[0].address_id,
                permanentAddress: addresses[1].address_id,
                first_name: `Student`,
                middle_name: "Middle",
                last_name: strand.strand_name.replace(/[^a-zA-Z0-9]/g, ''),
                suffix: null,
                birth_date: birthDate,
                place_of_birth: "Ligao City",
                age: age,
                sex: i % 2 === 0 ? "Male" : "Female",
                contact_num: "09123456789",
                email: `student.${strand.strand_name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')}@example.com`,
                religion: "Catholic",
                height: 170.00,
                weight: 60.00,
                bmi: 20.76,
                nationality: "Filipino",
                status: "active"
            });

            // Find section for this strand (Grade 11)
            const section = await SECTION_T.findOne({
                where: { strand_id: strand.strand_id, grade_level: 11 }
            });

            // Create academic info
            await ACADEMIC_INFO_T.create({
                student_id: lrn,
                department_id: strand.department_id,
                strand_id: strand.strand_id,
                section_id: section.section_id,
                gradeLevel: "11",
                schoolYear: "2023-2024",
                semester: "1st Semester",
                entryStatus: "New Enrollee",
                exitStatus: "Pending"
            });
        }

        console.log("Initial data seeding completed successfully!");
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    }
}

module.exports = {
    seedInitialData
};