const { seedAdditionalStudents } = require('../seeders/additionalStudents');

async function runSeeder() {
    try {
        await seedAdditionalStudents();
        console.log('Successfully added additional students!');
        process.exit(0);
    } catch (error) {
        console.error('Error running seeder:', error);
        process.exit(1);
    }
}

runSeeder(); 