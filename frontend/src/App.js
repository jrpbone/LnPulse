import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CreateStudent from "./pages/CreateStudent";
import StudentList from "./pages/StudentList";
import Student from "./pages/Student";
import Departments from "./pages/Departments";
import Subjects from "./pages/Subjects";
import Strands from "./pages/Strands";
import ProtectedRoute from "./components/ProtectedRoute";
import Grades from "./pages/Grades";
import Login from "./pages/Login";
import Users from "./pages/Users";
import CreateUser from "./pages/CreateUser";
import EditUser from "./pages/EditUser";
import EditStudent from "./pages/EditStudent";
import { AuthProvider, useAuth } from './context/AuthContext';
import Unauthorized from './pages/Unauthorized';
import SectionStudents from './pages/SectionStudents';
import Reports from './pages/Reports';
import DUser from "./pages/DUser";
import AcademicInfo from "./pages/AcademicInfo";

function AppWrapper() {
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
}

function App() {
  const { isAuthenticated, logout, privileges, user } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const isLoginPage = location.pathname === "/" || location.pathname === "/login";

  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname.toLowerCase().startsWith(path.toLowerCase());
  };

  return (
    <div className="App">
      {!isLoginPage && isAuthenticated && (
        <div className="sidebar">
          <h2>
            {!privileges?.departmentId && !privileges?.sectionId
              ? "Admin Panel"
              : "STUDENT INFORMATION SYSTEM"}
          </h2>

          {/* Show user's first name */}
          {user?.firstname && (
            <div className="sidebar-user">
              <strong>Welcome,</strong> {user.firstname}
            </div>
          )}

          <br />

          <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>
          <br />

          {privileges?.canManageStudents && (
            <>
              {!privileges?.sectionId && (
                <>
                  <Link to="/CreateStudent" className={isActive('/CreateStudent') ? 'active' : ''}>Create New Record</Link>
                  <br />
                </>
              )}
              {privileges?.canViewAllStudents && (
                <>
                  <Link to="/StudentList" className={isActive('/StudentList') ? 'active' : ''}>View Student List</Link>
                  <br />
                </>
              )}
            </>
          )}

          {/* Departments Link - Only for users who can view departments */}
          {privileges?.canViewDepartments && (
            <>
              <Link to={`/Departments${privileges?.departmentId ? `/${privileges.departmentId}` : ''}`} className={isActive('/Departments') ? 'active' : ''}>Departments</Link>
              <br />
            </>
          )}

          {/* Subjects/Curriculum Link */}
          {(privileges?.canViewSubjects ||
            (!privileges?.departmentId && !privileges?.sectionId)) && (
            <>
              <Link to="/Subjects" className={isActive('/Subjects') ? 'active' : ''}>Curriculum</Link>
              <br />
            </>
          )}

          {privileges?.canManageUsers && (
            <>
              <Link to="/Users" className={isActive('/Users') ? 'active' : ''}>Users</Link>
              <br />
            </>
          )}

          {privileges?.canViewReports && (
            <>
              <br />
            </>
          )}

          {privileges?.sectionId && (
            <>
              <Link to={`/section/${privileges.sectionId}/students`} className={isActive('/section/') ? 'active' : ''}>My Section</Link>
              <br />
            </>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

      <div className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Student management routes */}
          <Route
            path="/CreateStudent"
            element={
              <ProtectedRoute
                requiredPrivileges={['canManageStudents', 'canViewAllStudents']}
                unauthorizedRoles={['adviser']} // Add this to restrict advisers
              >
                <CreateStudent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/StudentList"
            element={
              <ProtectedRoute requiredPrivileges={['canViewAllStudents']}>
                <StudentList />
              </ProtectedRoute>
            }
          />

          {/* Department management routes */}
          <Route
            path="/Departments"
            element={
              <ProtectedRoute requiredPrivileges={['canViewDepartments']}>
                <Departments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Departments/:departmentId"
            element={
              <ProtectedRoute requiredPrivileges={['canViewDepartments']}>
                <Departments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Subjects"
            element={
              <ProtectedRoute requiredPrivileges={['canViewSubjects']}>
                <Subjects />
              </ProtectedRoute>
            }
          />

          {/* Users management routes */}
          <Route
            path="/Users"
            element={
              <ProtectedRoute requiredPrivileges={['canManageUsers']}>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Users/CreateUser"
            element={
              <ProtectedRoute requiredPrivileges={['canManageUsers']}>
                <CreateUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Users/DUser"
            element={
              <ProtectedRoute requiredPrivileges={['canAddAdvisers']}>
                <DUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Users/EditUser/:id"
            element={
              <ProtectedRoute requiredPrivileges={['canManageUsers']}>
                <EditUser />
              </ProtectedRoute>
            }
          />

          {/* Reports route - admin only */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredPrivileges={['canViewReports']}>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* Section user routes */}
          <Route
            path="/section/:sectionId/students"
            element={
              <ProtectedRoute requiredPrivileges={['canManageStudents']}>
                <SectionStudents />
              </ProtectedRoute>
            }
          />

          {/* Routes that require multiple privileges */}
          <Route
            path="/strands/:department_id"
            element={
              <ProtectedRoute>
                <Strands />
              </ProtectedRoute>
            }
          />

          {/* Grade management routes */}
          <Route
            path="/Student/:student_id/grades/:acads_id"
            element={
              <ProtectedRoute requiredPrivileges={['canManageStudents']}>
                <Grades />
              </ProtectedRoute>
            }
          />

          {/* Student edit route */}
          <Route
            path="/EditStudent"
            element={
              <ProtectedRoute requiredPrivileges={['canManageStudents']}>
                <EditStudent />
              </ProtectedRoute>
            }
          />

          {/* Student view route */}
          <Route
            path="/Student/:student_id"
            element={
              <ProtectedRoute requiredPrivileges={['canManageStudents']}>
                <Student />
              </ProtectedRoute>
            }
          />

          {/* Academic Info route */}
          <Route
            path="/academic-info/:student_id"
            element={
              <ProtectedRoute requiredPrivileges={['canManageStudents']}>
                <AcademicInfo />
              </ProtectedRoute>
            }
          />

          {/* Root route - redirect to login */}
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </div>
  );
}

export default AppWrapper;