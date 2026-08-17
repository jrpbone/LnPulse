const routeModules = [
  ['/students', require('./modules/students/students.routes')],
  ['/academicInfo', require('./modules/students/academic-info.routes')],
  ['/academicPerformance', require('./modules/students/academic-performance.routes')],
  ['/grades', require('./modules/students/grades.routes')],
  ['/departments', require('./modules/academics/departments.routes')],
  ['/strands', require('./modules/academics/strands.routes')],
  ['/sections', require('./modules/academics/sections.routes')],
  ['/subjects', require('./modules/academics/subjects.routes')],
  ['/curriculum', require('./modules/academics/curriculum.routes')],
  ['/academicSettings', require('./modules/academics/academic-settings.routes')],
  ['/users', require('./modules/users/users.routes')],
  ['/department-users', require('./modules/users/department-users.routes')],
  ['/section-users', require('./modules/users/section-users.routes')],
  ['/dashboard', require('./modules/dashboard/dashboard.routes')],
  ['/reports', require('./modules/reports/reports.routes')],
];

const registerRoutes = (app) => {
  routeModules.forEach(([path, router]) => app.use(path, router));
};

module.exports = { registerRoutes };
