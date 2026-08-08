// Define privileges for each role
export const rolePrivileges = {
  admin: {
    // User Management
    canManageUsers: true,
    canAddDepartmentUsers: true,
    canAddAdvisers: true,
    
    // Department Management
    canManageDepartments: true,
    canViewDepartments: true,
    
    // Section Management
    canManageSections: true,
    canViewAllSections: true,
    canManageAllSections: true,
    
    // Student Management
    canViewAllStudents: true,
    canManageStudents: true,
    canEditStudents: true,
    
    // Grade Management
    canViewAllGrades: true,
    canManageGrades: true,
    
    // Subject Management
    canManageSubjects: true,
    canViewSubjects: true,
    
    // Reports
    canViewReports: true,
    canManageReports: true,

    // Curriculum
    canViewCurriculum: true,
    
    // Navigation
    navigationItems: [
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/Users', label: 'Users', icon: 'users' },
      { path: '/Departments', label: 'Departments', icon: 'departments' },
      { path: '/Subjects', label: 'Subjects', icon: 'subjects' },
      { path: '/StudentList', label: 'View Student List', icon: 'students' },
      { path: '/CreateStudent', label: 'Create New Record', icon: 'add-student' },
      { path: '/Grades', label: 'Grades', icon: 'grades' },
      { path: '/Reports', label: 'Reports', icon: 'reports' }
    ]
  },
  
  department_user: {
    // User Management
    canManageUsers: true,
    canAddAdvisers: true,      // Can create new adviser users
    canAddDepartmentUsers: false,
    
    // Department Management
    canManageDepartments: false,
    canViewDepartments: true,  // Can view departments (especially their own)
    
    // Section Management
    canManageSections: false,
    canViewAllSections: false,
    canManageAllSections: false,
    
    // Student Management
    canViewAllStudents: true,  // Can view all students but filtered by department
    canManageStudents: true,   // Can create and manage students in their department
    canEditStudents: true,     // Can edit student details
    
    // Subject Management
    canManageSubjects: true,   // Can add subjects for all students
    canViewSubjects: true,     // Can view subjects
    
    // Grade Management
    canViewAllGrades: false,
    canManageGrades: false,
    
    // Reports
    canViewReports: false,
    canManageReports: false,

    // Curriculum
    canViewCurriculum: true,
    
    // Navigation - Only show specified tabs
    navigationItems: [
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/CreateStudent', label: 'Create New Record', icon: 'add-student' },
      { path: '/StudentList', label: 'View Student List', icon: 'students' },
      { path: '/Subjects', label: 'Subjects', icon: 'subjects' },
      { path: '/Users', label: 'Users', icon: 'users' },
      { path: '/Users/CreateUser', label: 'Add Adviser', icon: 'add-user' }
    ]
  },
  
  section_user: {
    // User Management
    canManageUsers: false,
    canAddAdvisers: false,
    canAddDepartmentUsers: false,
    
    // Department Management
    canManageDepartments: false,
    canViewDepartments: false,
    
    // Section Management
    canManageSections: false,
    canViewAllSections: false,
    canManageAllSections: false,
    
    // Student Management
    canViewAllStudents: false,
    canManageStudents: true,
    canEditStudents: false,    // Cannot edit student details
    
    // Grade Management
    canViewAllGrades: false,
    canManageGrades: true,
    
    // Reports
    canViewReports: false,
    canManageReports: false,
    
    // Navigation
    navigationItems: [
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/section-students', label: 'My Students', icon: 'students' },
      { path: '/Grades', label: 'Grades', icon: 'grades' }
    ]
  }
};

// Helper function to get privileges for a role
export const getPrivilegesForRole = (role) => {
  return rolePrivileges[role] || rolePrivileges.section_user; // Default to section_user if role not found
}; 