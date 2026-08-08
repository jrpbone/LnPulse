const express = require('express')
const cors = require('cors')
const { sequelize } = require('./models')
const { seedAll } = require('./seeders')
const { DEPARTMENT_T, ACADEMIC_INFO_T, ACADEMIC_PERFORMANCE_T } = require('./models')


const app = express()


app.use(express.json())
app.use(cors())


const db = require('./models')


// Routers
const studentRouter = require('./routes/students')
app.use("/students", studentRouter)
const StrandRouter = require('./routes/strands')
app.use("/strands", StrandRouter)
const SubjectRouter = require('./routes/subject')
app.use("/subjects", SubjectRouter)
const AcadsInfoRouter = require('./routes/academic_info')
app.use("/academicInfo", AcadsInfoRouter)
const SectionsRouter = require('./routes/sections')
app.use("/sections", SectionsRouter)
const DeptsRoutrer = require('./routes/departments')
app.use("/departments", DeptsRoutrer)
const GradesRouter = require('./routes/grades')
app.use("/grades", GradesRouter)
const usersRouter = require('./routes/users')
app.use("/users", usersRouter)
const departmentUsersRouter = require('./routes/department_users')
app.use("/department-users", departmentUsersRouter)
const sectionUsersRouter = require('./routes/section_users')
app.use("/section-users", sectionUsersRouter)
const reportsRouter = require('./routes/reports')
app.use("/reports", reportsRouter)
const curriculumRouter = require('./routes/curriculum')
app.use("/curriculum", curriculumRouter)
const AcademicPerformanceRouter = require('./routes/academic_performance')
app.use("/academicPerformance", AcademicPerformanceRouter)
const AcademicSettingsRouter = require('./routes/academic_settings')
app.use("/academicSettings", AcademicSettingsRouter)
const dashboardRouter = require('./routes/dashboard')
app.use("/dashboard", dashboardRouter)


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})


// Set to true only when you want to reset the database and reseed (add shit and data such as instances of departments, strands, sections, subjects, etc.)
// WARNING: This will delete all existing data if set to true

  
const PORT = process.env.PORT || 3001
const FORCE_SYNC = false


// Function to initialize academic performance records
const initializeAcademicPerformance = async () => {
  try {
    // Get all academic info records
    const academicInfos = await ACADEMIC_INFO_T.findAll();
    
    // For each academic info record, check if it has a performance record
    for (const acadInfo of academicInfos) {
      const existingPerformance = await ACADEMIC_PERFORMANCE_T.findOne({
        where: { acads_id: acadInfo.acads_id }
      });

      // If no performance record exists, create one
      if (!existingPerformance) {
        await ACADEMIC_PERFORMANCE_T.create({
          acads_id: acadInfo.acads_id,
          gpa: null,
          honors: null,
          remarks: "Pending Grades"
        });
        console.log(`Created academic performance record for acads_id: ${acadInfo.acads_id}`);
      }
    }
    console.log('Academic performance records initialized');
  } catch (error) {
    console.error('Error initializing academic performance records:', error);
  }
};


// Sync database and start server if constant FORCE_SYNC is set to true!
const startServer = async () => {
  try {
    if (FORCE_SYNC) {
      await sequelize.sync({ force: true })
      console.log('Database synced and reset')
     
      // Run all seeders in sequence
      await seedAll()
      console.log('Initial data seeded')
    } else {
      await sequelize.authenticate()
      console.log('Database connection established')
      
      // Initialize academic performance records
      await initializeAcademicPerformance()
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Unable to start server:', error)
  }
}


startServer()

