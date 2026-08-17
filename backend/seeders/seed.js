const bcrypt = require('bcrypt');
const {
    sequelize,
    DEPARTMENT_T,
    STRAND_T,
    SECTION_T,
    CURRICULUM_T,
    USERS_T,
    SECTION_USER_T,
    DEPARTMENT_USER_T,
    STUDENT_T,
    ACADEMIC_INFO_T,
    ACADEMIC_PERFORMANCE_T,
    ACADEMIC_SETTINGS_T,
    ADDRESS_T,
    PARENT_GUARDIAN_T,
} = require('../models');

const DEPARTMENTS = [
    ['TVL Department', 'Technical-Vocational-Livelihood'],
    ['FEH Department', 'HUMSS | GAS'],
    ['AMS Department', 'STEM | ABM'],
];

const STRANDS = [
    ['FEH Department', 'HUMSS', 'Humanities and Social Sciences', 'HUMSS'],
    ['FEH Department', 'GAS', 'General Academic Strand', 'GAS'],
    ['AMS Department', 'STEM', 'Science, Technology, Engineering, and Mathematics', 'STEM'],
    ['AMS Department', 'ABM', 'Accountancy, Business, and Management', 'ABM'],
    ['AMS Department', 'A&D', 'Arts and Design', 'A&D'],
    ['TVL Department', 'TVL-ICT (CSS)', 'TVL - Information and Communications Technology (Computer Systems Servicing)', 'CSS'],
    ['TVL Department', 'TVL-IA (EPAS)', 'TVL - Industrial Arts (Electronic Product Assembly and Servicing)', 'EPAS'],
    ['TVL Department', 'TVL-IA (EIM)', 'TVL - Industrial Arts (Electrical Installation and Maintenance)', 'EIM'],
    ['TVL Department', 'TVL-HE (Dressmaking)', 'TVL - Home Economics (Dressmaking)', 'Dressmaking'],
    ['TVL Department', 'TVL-HE (Cookery)', 'TVL - Home Economics (Cookery)', 'Cookery'],
    ['TVL Department', 'TVL-HE (BNC)', 'TVL - Home Economics (Beauty/Nail Care)', 'BNC'],
];

const CORE_SUBJECTS = {
    '11': {
        '1st Semester': [
            ['Oral Communication', 'Core subject focusing on oral communication skills'],
            ['Komunikasyon at Pananaliksik', 'Core subject for Filipino communication and research'],
            ['General Mathematics', 'Core subject for general mathematics'],
            ['Earth and Life Science', 'Core subject for earth and life sciences'],
            ['Understanding Culture, Society and Politics', 'Core subject for understanding society and culture'],
            ['Contemporary Philippine Arts from the Regions', 'Core subject for Philippine arts and culture'],
            ['PE and Health 1', 'Core subject for physical education and health'],
        ],
        '2nd Semester': [
            ['Reading and Writing', 'Core subject for reading and writing skills'],
            ['Pagbasa at Pagsusuri', 'Core subject for reading and analysis'],
            ['Statistics and Probability', 'Core subject for statistics and probability'],
            ['Physical Science', 'Core subject for physical sciences'],
            ['PR1', 'Practical Research 1 - Introduction to research methodologies'],
            ['21st Century Literature', 'Core subject for contemporary literature'],
            ['PE and Health 2', 'Core subject for physical education and health'],
        ],
    },
    '12': {
        '1st Semester': [
            ['Media and Information Literacy', 'Core subject for media and information literacy'],
            ['Introduction to Philosophy of the Human Person', 'Core subject for philosophy and human person'],
            ['PR2', 'Practical Research 2 - Advanced research methodologies'],
            ['PE and Health 3', 'Core subject for physical education and health'],
        ],
        '2nd Semester': [
            ['III', 'Inquiries, Investigation, and Immersion - Applied research and field work'],
            ['Personal Development', 'Core subject for personal growth and development'],
            ['PE and Health 4', 'Core subject for physical education and health'],
        ],
    },
};

const USERS = [
    ['John', 'Smith', 'tvl_head', 'department_user'],
    ['Maria', 'Garcia', 'feh_head', 'department_user'],
    ['Robert', 'Johnson', 'ams_head', 'department_user'],
    ['Sarah', 'Williams', 'humss_adviser', 'section_user'],
    ['Michael', 'Brown', 'stem_adviser', 'section_user'],
    ['Emily', 'Davis', 'abm_adviser', 'section_user'],
];

const ADDRESSES = [
    ['123', 'Tuburan'], ['456', 'Paulba'], ['789', 'Bagumbayan'],
    ['321', 'Guilid'], ['456', 'Binatagan'], ['234', 'Nabonton'],
    ['567', 'Tambo'], ['890', 'Tula-tula'], ['123', 'Batang'],
].map(([houseNo, street_barangay]) => ({
    houseNo,
    street_barangay,
    city_municipality: 'Ligao City',
    province: 'Albay',
}));

const GUARDIANS = [
    ['Juan', 'Santos', 'Dela Cruz', '09123456789'],
    ['Maria', 'Cruz', 'Santos', '09234567890'],
    ['Pedro', 'Garcia', 'Reyes', '09345678901'],
    ['Elena', 'Magtanggol', 'Ramos', '09456789012'],
    ['Ricardo', 'Mercado', 'Lim', '09567890123'],
    ['Victoria', 'Pangilinan', 'Tan', '09678901234'],
    ['Eduardo', 'Villanueva', 'Ocampo', '09789012345'],
    ['Rosario', 'Enriquez', 'Yap', '09890123456'],
].map(([pgFirstName, pgMiddleName, pgLastName, pgContactNum]) => ({
    pgFirstName,
    pgMiddleName,
    pgLastName,
    pgContactNum,
}));

const STUDENT_NAMES = [
    ['Juan', 'Santos', 'Dela Cruz'], ['Maria', 'Garcia', 'Santos'],
    ['Jose', 'Reyes', 'Ramos'], ['Ana', 'Cruz', 'Bautista'],
    ['Pedro', 'Luna', 'Torres'], ['Sofia', 'Rizal', 'Gonzales'],
    ['Miguel', 'Aquino', 'Fernandez'], ['Isabella', 'Marcos', 'Lopez'],
    ['Gabriel', 'Bonifacio', 'Reyes'], ['Emma', 'Aguinaldo', 'Martinez'],
    ['Angelo', 'Bautista', 'Santos'], ['Bianca', 'Villanueva', 'Reyes'],
    ['Carlo', 'Mendoza', 'Tan'], ['Diana', 'Lim', 'Cruz'],
    ['Eduardo', 'Santos', 'Garcia'], ['Francesca', 'Reyes', 'Lim'],
    ['Hannah', 'Garcia', 'Santos'], ['Ian', 'Tan', 'Reyes'],
    ['Julia', 'Mendoza', 'Cruz'], ['Kevin', 'Santos', 'Garcia'],
];

const createStats = () => ({ created: 0, updated: 0, unchanged: 0 });

async function ensureRecord(model, where, values, transaction, stats, updateExisting = true) {
    const [record, created] = await model.findOrCreate({
        where,
        defaults: { ...where, ...values },
        transaction,
    });

    if (created) {
        stats.created += 1;
        return record;
    }

    if (!updateExisting) {
        stats.unchanged += 1;
        return record;
    }

    record.set(values);
    if (record.changed()) {
        await record.save({ transaction });
        stats.updated += 1;
    } else {
        stats.unchanged += 1;
    }
    return record;
}

async function seedDatabase({ sync = false } = {}) {
    await sequelize.authenticate();
    if (sync) {
        await sequelize.sync();
    }

    const stats = createStats();
    const specializedSubjects = {
            // HUMSS specialized subjects
            HUMSS: {
                grade11: {
                    firstSem: [
                        {
                            subject_name: "Introduction to World Religions and Belief Systems",
                            subject_description: "Study of major world religions and belief systems"
                        },
                        {
                            subject_name: "Creative Writing",
                            subject_description: "Development of creative writing skills"
                        }
                    ],
                    secondSem: [
                        {
                            subject_name: "Disciplines and Ideas in the Social Sciences",
                            subject_description: "Overview of social science disciplines"
                        },
                        {
                            subject_name: "Creative Nonfiction",
                            subject_description: "Study and practice of creative nonfiction writing"
                        }
                    ]
                },
                grade12: {
                    firstSem: [
                        {
                            subject_name: "Disciplines and Ideas in the Applied Social Sciences",
                            subject_description: "Application of social science concepts"
                        },
                        {
                            subject_name: "Philippine Politics and Governance",
                            subject_description: "Study of Philippine political system"
                        }
                    ],
                    secondSem: [
                        {
                            subject_name: "Community Engagement, Solidarity, and Citizenship",
                            subject_description: "Community involvement and civic responsibility"
                        },
                        {
                            subject_name: "Trends, Networks, and Critical Thinking",
                            subject_description: "Analysis of current trends and networks"
                        }
                    ]
                }
            },

            // STEM specialized subjects
            STEM: {
                grade11: {
                    firstSem: [
                        {
                            subject_name: "Pre-Calculus",
                            subject_description: "Advanced mathematics preparation for calculus"
                        },
                        {
                            subject_name: "Basic Calculus",
                            subject_description: "Introduction to calculus concepts"
                        }
                    ],
                    secondSem: [
                        {
                            subject_name: "General Biology 1",
                            subject_description: "Study of biological concepts and principles"
                        },
                        {
                            subject_name: "General Chemistry 1",
                            subject_description: "Study of chemical concepts and principles"
                        }
                    ]
                },
                grade12: {
                    firstSem: [
                        {
                            subject_name: "General Physics 1",
                            subject_description: "Study of physical concepts and principles"
                        },
                        {
                            subject_name: "General Biology 2",
                            subject_description: "Advanced study of biological concepts"
                        }
                    ],
                    secondSem: [
                        {
                            subject_name: "General Chemistry 2",
                            subject_description: "Advanced study of chemical concepts"
                        },
                        {
                            subject_name: "General Physics 2",
                            subject_description: "Advanced study of physical concepts"
                        }
                    ]
                }
            },

            // ABM specialized subjects
            ABM: {
                grade11: {
                    firstSem: [
                        {
                            subject_name: "Organization and Management",
                            subject_description: "Principles of business organization and management"
                        },
                        {
                            subject_name: "Business Mathematics",
                            subject_description: "Mathematical applications in business"
                        }
                    ],
                    secondSem: [
                        {
                            subject_name: "Fundamentals of Accountancy, Business and Management 1",
                            subject_description: "Introduction to accounting and business concepts"
                        },
                        {
                            subject_name: "Business Finance",
                            subject_description: "Study of business financial management"
                        }
                    ]
                },
                grade12: {
                    firstSem: [
                        {
                            subject_name: "Fundamentals of Accountancy, Business and Management 2",
                            subject_description: "Advanced accounting and business concepts"
                        },
                        {
                            subject_name: "Business Ethics and Social Responsibility",
                            subject_description: "Ethical considerations in business"
                        }
                    ],
                    secondSem: [
                        {
                            subject_name: "Applied Economics",
                            subject_description: "Application of economic principles"
                        },
                        {
                            subject_name: "Business Enterprise Simulation",
                            subject_description: "Simulation of business operations"
                        }
                    ]
                }
            },

            // GAS specialized subjects
            GAS: {
                grade11: {
                    firstSem: [
                        {
                            subject_name: "Humanities 1",
                            subject_description: "Introduction to humanities"
                        },
                        {
                            subject_name: "Social Sciences 1",
                            subject_description: "Introduction to social sciences"
                        }
                    ],
                    secondSem: [
                        {
                            subject_name: "Humanities 2",
                            subject_description: "Advanced humanities concepts"
                        },
                        {
                            subject_name: "Social Sciences 2",
                            subject_description: "Advanced social science concepts"
                        }
                    ]
                },
                grade12: {
                    firstSem: [
                        {
                            subject_name: "Humanities 3",
                            subject_description: "Specialized humanities topics"
                        },
                        {
                            subject_name: "Social Sciences 3",
                            subject_description: "Specialized social science topics"
                        }
                    ],
                    secondSem: [
                        {
                            subject_name: "Humanities 4",
                            subject_description: "Advanced specialized humanities"
                        },
                        {
                            subject_name: "Social Sciences 4",
                            subject_description: "Advanced specialized social sciences"
                        }
                    ]
                }
            },

            // TVL specialized subjects (common for all TVL strands)
            TVL: {
                grade11: {
                    firstSem: [
                        {
                            subject_name: "Work Immersion/Research/Career Advocacy/Culminating Activity",
                            subject_description: "Practical application of TVL skills"
                        },
                        {
                            subject_name: "Entrepreneurship",
                            subject_description: "Business and entrepreneurial skills"
                        }
                    ],
                    secondSem: [
                        {
                            subject_name: "Work Immersion/Research/Career Advocacy/Culminating Activity",
                            subject_description: "Advanced practical application"
                        },
                        {
                            subject_name: "Business Enterprise Simulation",
                            subject_description: "Business operation simulation"
                        }
                    ]
                },
                grade12: {
                    firstSem: [
                        {
                            subject_name: "Work Immersion/Research/Career Advocacy/Culminating Activity",
                            subject_description: "Specialized practical application"
                        },
                        {
                            subject_name: "Entrepreneurship",
                            subject_description: "Advanced entrepreneurial skills"
                        }
                    ],
                    secondSem: [
                        {
                            subject_name: "Work Immersion/Research/Career Advocacy/Culminating Activity",
                            subject_description: "Final practical application"
                        },
                        {
                            subject_name: "Business Enterprise Simulation",
                            subject_description: "Final business simulation"
                        }
                    ]
                }
            }
        };

    await sequelize.transaction(async (transaction) => {
        const foundation = await seedFoundation(transaction, stats);
        await seedCurriculum(foundation.strands, specializedSubjects, transaction, stats);
        await seedUsers(foundation, transaction, stats);
        await seedStudents(foundation, transaction, stats);
        await seedAcademicSettings(transaction, stats);
    });

    return stats;
}

async function seedFoundation(transaction, stats) {
    const departments = new Map();
    for (const [name, description] of DEPARTMENTS) {
        const department = await ensureRecord(
            DEPARTMENT_T,
            { department_name: name },
            { department_description: description },
            transaction,
            stats
        );
        departments.set(name, department);
    }

    const strands = [];
    const strandsByName = new Map();
    const sectionsByKey = new Map();
    for (const [departmentName, name, description, sectionName] of STRANDS) {
        const department = departments.get(departmentName);
        const strand = await ensureRecord(
            STRAND_T,
            { strand_name: name },
            {
                department_id: department.department_id,
                strand_description: description,
            },
            transaction,
            stats
        );
        strands.push(strand);
        strandsByName.set(name, strand);

        for (const gradeLevel of [11, 12]) {
            const section = await ensureRecord(
                SECTION_T,
                {
                    strand_id: strand.strand_id,
                    grade_level: gradeLevel,
                    section_name: sectionName,
                },
                {},
                transaction,
                stats
            );
            sectionsByKey.set(`${name}:${gradeLevel}`, section);
        }
    }

    const addresses = [];
    for (const address of ADDRESSES) {
        addresses.push(
            await ensureRecord(ADDRESS_T, address, {}, transaction, stats)
        );
    }

    const guardians = [];
    for (const guardian of GUARDIANS) {
        guardians.push(
            await ensureRecord(PARENT_GUARDIAN_T, guardian, {}, transaction, stats)
        );
    }

    return { departments, strands, strandsByName, sectionsByKey, addresses, guardians };
}

async function seedCurriculum(strands, specializedSubjects, transaction, stats) {
    for (const strand of strands) {
        for (const [gradeLevel, semesters] of Object.entries(CORE_SUBJECTS)) {
            for (const [semester, subjects] of Object.entries(semesters)) {
                for (const [subjectName, subjectDescription] of subjects) {
                    await seedSubject(
                        strand,
                        gradeLevel,
                        semester,
                        'core',
                        subjectName,
                        subjectDescription,
                        transaction,
                        stats
                    );
                }
            }
        }

        const strandKey = strand.strand_name.split('-')[0];
        const subjects = specializedSubjects[strandKey] || specializedSubjects.TVL;
        const specializedGroups = [
            ['11', '1st Semester', subjects.grade11.firstSem],
            ['11', '2nd Semester', subjects.grade11.secondSem],
            ['12', '1st Semester', subjects.grade12.firstSem],
            ['12', '2nd Semester', subjects.grade12.secondSem],
        ];
        for (const [gradeLevel, semester, group] of specializedGroups) {
            for (const subject of group) {
                await seedSubject(
                    strand,
                    gradeLevel,
                    semester,
                    'specialized',
                    subject.subject_name,
                    subject.subject_description,
                    transaction,
                    stats
                );
            }
        }
    }
}

async function seedSubject(
    strand,
    gradeLevel,
    semester,
    type,
    subjectName,
    subjectDescription,
    transaction,
    stats
) {
    await ensureRecord(
        CURRICULUM_T,
        {
            strand_id: strand.strand_id,
            grade_level: gradeLevel,
            semester,
            subject_name: subjectName,
        },
        {
            subject_description: subjectDescription,
            type,
            isRegular: true,
        },
        transaction,
        stats
    );
}

async function seedUsers(foundation, transaction, stats) {
    const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const users = new Map();

    for (const [firstname, lastname, username, type] of USERS) {
        const user = await ensureRecord(
            USERS_T,
            { username },
            { firstname, lastname, password: hashedPassword, type, status: 1 },
            transaction,
            stats,
            false
        );
        users.set(username, user);
    }

    const departmentAssignments = [
        ['tvl_head', 'TVL Department'],
        ['feh_head', 'FEH Department'],
        ['ams_head', 'AMS Department'],
    ];
    for (const [username, departmentName] of departmentAssignments) {
        await ensureRecord(
            DEPARTMENT_USER_T,
            { user_id: users.get(username).id },
            { department_id: foundation.departments.get(departmentName).department_id },
            transaction,
            stats
        );
    }

    const sectionAssignments = [
        ['humss_adviser', 'HUMSS', 'FEH Department'],
        ['stem_adviser', 'STEM', 'AMS Department'],
        ['abm_adviser', 'ABM', 'AMS Department'],
    ];
    for (const [username, strandName, departmentName] of sectionAssignments) {
        await ensureRecord(
            SECTION_USER_T,
            { user_id: users.get(username).id },
            {
                section_id: foundation.sectionsByKey.get(`${strandName}:11`).section_id,
                department_id: foundation.departments.get(departmentName).department_id,
            },
            transaction,
            stats
        );
    }
}

async function seedStudents(foundation, transaction, stats) {
    let initialSequence = 1;
    for (const strand of foundation.strands) {
        const studentId = `11172710${String(initialSequence).padStart(4, '0')}`;
        await seedStudent(
            {
                studentId,
                strand,
                section: foundation.sectionsByKey.get(`${strand.strand_name}:11`),
                gradeLevel: '11',
                semester: '1st Semester',
                entryStatus: 'New Enrollee',
                name: ['Student', 'Middle', strand.strand_name.replace(/[^a-zA-Z0-9]/g, '')],
                guardian: foundation.guardians[0],
                currentAddress: foundation.addresses[0],
                permanentAddress: foundation.addresses[1],
                sequence: initialSequence,
            },
            transaction,
            stats
        );
        initialSequence += 1;
    }

    await seedStudentsForGrade({
        gradeLevel: 11,
        countPerSection: 3,
        lrnPrefix: '111728',
        semester: '1st Semester',
        entryStatuses: ['New Enrollee', 'Transferee'],
        addressOffset: 2,
        addressCount: 3,
        guardianOffset: 1,
        guardianCount: 3,
        foundation,
        transaction,
        stats,
    });
    await seedStudentsForGrade({
        gradeLevel: 12,
        countPerSection: 4,
        lrnPrefix: '111729',
        semester: '2nd Semester',
        entryStatuses: ['Regular', 'Transferee', 'Returning'],
        addressOffset: 5,
        addressCount: 4,
        guardianOffset: 4,
        guardianCount: 4,
        foundation,
        transaction,
        stats,
    });
}

async function seedStudentsForGrade(options) {
    const {
        gradeLevel,
        countPerSection,
        lrnPrefix,
        semester,
        entryStatuses,
        addressOffset,
        addressCount,
        guardianOffset,
        guardianCount,
        foundation,
        transaction,
        stats,
    } = options;
    let sequence = 1;

    for (const strand of foundation.strands) {
        const section = foundation.sectionsByKey.get(`${strand.strand_name}:${gradeLevel}`);
        for (let index = 0; index < countPerSection; index += 1) {
            const studentId = `${lrnPrefix}${String(sequence).padStart(5, '0')}`;
            const name = STUDENT_NAMES[(sequence - 1) % STUDENT_NAMES.length];
            const addressIndex = addressOffset + ((sequence - 1) % addressCount);
            await seedStudent(
                {
                    studentId,
                    strand,
                    section,
                    gradeLevel: String(gradeLevel),
                    semester,
                    entryStatus: entryStatuses[(sequence - 1) % entryStatuses.length],
                    name,
                    guardian: foundation.guardians[
                        guardianOffset + ((sequence - 1) % guardianCount)
                    ],
                    currentAddress: foundation.addresses[addressIndex],
                    permanentAddress: foundation.addresses[
                        addressOffset + (sequence % addressCount)
                    ],
                    sequence,
                },
                transaction,
                stats
            );
            sequence += 1;
        }
    }
}

async function seedStudent(data, transaction, stats) {
    const [firstName, middleName, lastName] = data.name;
    const height = 150 + (data.sequence % 30);
    const weight = 45 + (data.sequence % 30);
    const bmi = (weight / ((height / 100) ** 2)).toFixed(2);
    const grade12 = data.gradeLevel === '12';
    const birthYear = grade12 ? 2005 : 2006;
    const birthMonth = String((data.sequence % 12) + 1).padStart(2, '0');
    const birthDay = String((data.sequence % 27) + 1).padStart(2, '0');

    await ensureRecord(
        STUDENT_T,
        { student_id: data.studentId },
        {
            guardian_id: data.guardian.parent_guardian_id,
            currentAddress: data.currentAddress.address_id,
            permanentAddress: data.permanentAddress.address_id,
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            suffix: null,
            birth_date: `${birthYear}-${birthMonth}-${birthDay}`,
            place_of_birth: 'Ligao City',
            age: grade12 ? 18 : 17,
            sex: data.sequence % 2 === 0 ? 'Female' : 'Male',
            contact_num: `09${String(100000000 + data.sequence).padStart(9, '0')}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}.${data.studentId}@example.com`,
            religion: ['Catholic', 'Christian', 'INC', 'Born Again'][data.sequence % 4],
            height,
            weight,
            bmi,
            nationality: 'Filipino',
            status: 'active',
        },
        transaction,
        stats,
        false
    );

    const academicInfo = await ensureRecord(
        ACADEMIC_INFO_T,
        {
            student_id: data.studentId,
            gradeLevel: data.gradeLevel,
            schoolYear: '2023-2024',
            semester: data.semester,
        },
        {
            department_id: data.strand.department_id,
            strand_id: data.strand.strand_id,
            section_id: data.section.section_id,
            entryStatus: data.entryStatus,
            exitStatus: 'Pending',
        },
        transaction,
        stats,
        false
    );

    await ensureRecord(
        ACADEMIC_PERFORMANCE_T,
        { acads_id: academicInfo.acads_id },
        { gpa: null, honors: null, remarks: 'Pending Grades' },
        transaction,
        stats,
        false
    );
}

async function seedAcademicSettings(transaction, stats) {
    const activeSettings = await ACADEMIC_SETTINGS_T.findOne({
        where: { is_active: true },
        transaction,
    });
    if (activeSettings) {
        stats.unchanged += 1;
        return;
    }

    const currentYear = new Date().getFullYear();
    await ACADEMIC_SETTINGS_T.create(
        {
            current_school_year: `${currentYear}-${currentYear + 1}`,
            current_semester: '1st Semester',
            is_active: true,
        },
        { transaction }
    );
    stats.created += 1;
}

async function runFromCommandLine() {
    const sync = process.argv.includes('--sync');
    const commandName = sync ? 'database setup' : 'database seed';
    try {
        console.log(`Starting ${commandName}...`);
        const stats = await seedDatabase({ sync });
        console.log(
            `Completed ${commandName}: ${stats.created} created, ${stats.updated} updated, ${stats.unchanged} unchanged.`
        );
    } catch (error) {
        console.error(`Failed ${commandName}:`, error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

if (require.main === module) {
    runFromCommandLine();
}

module.exports = { seedDatabase };
