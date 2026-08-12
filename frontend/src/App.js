import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiChevronRight,
  FiGrid,
  FiLayers,
  FiLogOut,
  FiMenu,
  FiUsers,
  FiX,
} from "react-icons/fi";
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
import { ConfirmationProvider } from "./context/ConfirmationContext";

function AppWrapper() {
  return (
    <AuthProvider>
      <ConfirmationProvider>
        <Router>
          <App />
        </Router>
      </ConfirmationProvider>
    </AuthProvider>
  );
}

function App() {
  const { isAuthenticated, logout, privileges, user } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const isLoginPage = location.pathname === "/" || location.pathname === "/login";

  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname.toLowerCase().startsWith(path.toLowerCase());
  };

  const displayName = user?.firstname || user?.username || "User";
  const displayRole = user?.type === "admin" ? "Administrator" : "Faculty account";

  const navLink = (to, label, Icon, activePath = to) => (
    <Link to={to} className={isActive(activePath) ? "active" : ""}>
      <Icon aria-hidden="true" />
      <span>{label}</span>
      <FiChevronRight className="nav-chevron" aria-hidden="true" />
    </Link>
  );

  const showAppShell = !isLoginPage && isAuthenticated;

  return (
    <div className={`App ${showAppShell ? "app-shell" : "auth-shell"}`}>
      {showAppShell && (
        <>
          <button
            className="mobile-menu-button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <FiMenu />
          </button>
          <button
            className={`sidebar-backdrop ${isSidebarOpen ? "visible" : ""}`}
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close navigation"
          />
          <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
            <div className="sidebar-brand">
              <img src="/logo192.png" alt="Ligao National High School" />
              <div>
                <strong>LN Pulse</strong>
                <span>Student Information System</span>
              </div>
              <button
                className="sidebar-close"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close navigation"
              >
                <FiX />
              </button>
            </div>

            <div className="sidebar-user">
              <span className="user-avatar">{displayName.charAt(0).toUpperCase()}</span>
              <div>
                <strong>{displayName}</strong>
                <span>{displayRole}</span>
              </div>
            </div>

            <nav className="sidebar-nav" aria-label="Primary navigation">
              <p className="nav-label">Workspace</p>
              {navLink("/dashboard", "Dashboard", FiGrid)}

              {privileges?.canManageStudents && privileges?.canViewAllStudents &&
                navLink("/StudentList", "Students", FiUsers)}
              {privileges?.canViewDepartments &&
                navLink(
                  `/Departments${privileges?.departmentId ? `/${privileges.departmentId}` : ""}`,
                  "Departments",
                  FiLayers,
                  "/Departments"
                )}
              {(privileges?.canViewSubjects ||
                (!privileges?.departmentId && !privileges?.sectionId)) &&
                navLink("/Subjects", "Curriculum", FiBookOpen)}
              {privileges?.canManageUsers && navLink("/Users", "Users", FiUsers)}
              {privileges?.sectionId &&
                navLink(`/section/${privileges.sectionId}/students`, "My section", FiBookOpen, "/section/")}
            </nav>

            <div className="sidebar-footer">
              <div className="system-status"><span /> System online</div>
              <button onClick={handleLogout} className="logout-button">
                <FiLogOut aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </div>
          </aside>
        </>
      )}

      <main className="main-content">
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
            path="/StudentList/new"
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
      </main>
    </div>
  );
}

export default AppWrapper;
