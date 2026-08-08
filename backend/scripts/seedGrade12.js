const { seedGrade12Students } = require('../seeders/grade12Students');

async function runSeeder() {
    try {
        await seedGrade12Students();
        console.log('Successfully added Grade 12 students!');
        process.exit(0);
    } catch (error) {
        console.error('Error running seeder:', error);
        process.exit(1);
    }
}

runSeeder(); 