import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
import { useAuth } from "../core/auth";

function AppShell({ children }) {
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

  const isActive = (path) =>
    location.pathname.toLowerCase().startsWith(path.toLowerCase());
  const isLoginPage = location.pathname === "/" || location.pathname === "/login";
  const showAppShell = !isLoginPage && isAuthenticated;
  const displayName = user?.firstname || user?.username || "User";
  const displayRole = user?.type === "admin" ? "Administrator" : "Faculty account";

  const navLink = (to, label, Icon, activePath = to) => (
    <Link to={to} className={isActive(activePath) ? "active" : ""}>
      <Icon aria-hidden="true" />
      <span>{label}</span>
      <FiChevronRight className="nav-chevron" aria-hidden="true" />
    </Link>
  );

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
              {privileges?.canManageStudents &&
                privileges?.canViewAllStudents &&
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
                navLink(
                  `/section/${privileges.sectionId}/students`,
                  "My section",
                  FiBookOpen,
                  "/section/"
                )}
            </nav>

            <div className="sidebar-footer">
              <div className="system-status">
                <span /> System online
              </div>
              <button onClick={handleLogout} className="logout-button">
                <FiLogOut aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </div>
          </aside>
        </>
      )}

      <main className="main-content">{children}</main>
    </div>
  );
}

export default AppShell;
