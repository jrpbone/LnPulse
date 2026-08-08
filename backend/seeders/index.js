const { seedInitialData } = require('./initialData');
const { seedAdditionalStudents } = require('./additionalStudents');
const { seedGrade12Students } = require('./grade12Students');
const { seedSpecializedSubjects } = require('./specializedSubjects');

async function seedAll() {
    try {
        await seedInitialData();
        await seedAdditionalStudents();
        await seedGrade12Students();
        await seedSpecializedSubjects();
        console.log('All seeders completed successfully!');
    } catch (error) {
        console.error('Error in seeding:', error);
    }
}

module.exports = {
    seedAll
}; 