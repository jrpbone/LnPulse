const { CURRICULUM_T, STRAND_T } = require("../models");

async function seedSpecializedSubjects() {
    try {
        // Get all strands
        const strands = await STRAND_T.findAll();

        // Define specialized subjects for each strand
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

        // Add specialized subjects for each strand
        for (const strand of strands) {
            const strandName = strand.strand_name.split('-')[0]; // Get base strand name (e.g., "TVL" from "TVL-ICT")
            const subjects = specializedSubjects[strandName] || specializedSubjects.TVL;

            // Grade 11 First Semester
            await CURRICULUM_T.bulkCreate(
                subjects.grade11.firstSem.map(subject => ({
                    strand_id: strand.strand_id,
                    subject_name: subject.subject_name,
                    subject_description: subject.subject_description,
                    grade_level: "11",
                    semester: "1st Semester",
                    type: "specialized",
                    isRegular: true
                }))
            );

            // Grade 11 Second Semester
            await CURRICULUM_T.bulkCreate(
                subjects.grade11.secondSem.map(subject => ({
                    strand_id: strand.strand_id,
                    subject_name: subject.subject_name,
                    subject_description: subject.subject_description,
                    grade_level: "11",
                    semester: "2nd Semester",
                    type: "specialized",
                    isRegular: true
                }))
            );

            // Grade 12 First Semester
            await CURRICULUM_T.bulkCreate(
                subjects.grade12.firstSem.map(subject => ({
                    strand_id: strand.strand_id,
                    subject_name: subject.subject_name,
                    subject_description: subject.subject_description,
                    grade_level: "12",
                    semester: "1st Semester",
                    type: "specialized",
                    isRegular: true
                }))
            );

            // Grade 12 Second Semester
            await CURRICULUM_T.bulkCreate(
                subjects.grade12.secondSem.map(subject => ({
                    strand_id: strand.strand_id,
                    subject_name: subject.subject_name,
                    subject_description: subject.subject_description,
                    grade_level: "12",
                    semester: "2nd Semester",
                    type: "specialized",
                    isRegular: true
                }))
            );
        }

        console.log("Specialized subjects seeding completed successfully!");
    } catch (error) {
        console.error('Error seeding specialized subjects:', error);
        throw error;
    }
}

module.exports = {
    seedSpecializedSubjects
}; 