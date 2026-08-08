import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./styles.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  // const { login, hasPrivilege, hasAnyPrivilege, hasAllPrivileges } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:3001/users/login", {
        username,
        password,
      });

      if (response.data) {
        const userData = response.data;
        
        // Ensure section ID is present for advisers
        if (userData.type === 'section_user' && !userData.sectionUser?.section?.section_id) {
          setError("Adviser account not properly configured - missing section ID");
          setLoading(false);
          return;
        }

        // Store user data and privileges
        login(userData);
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          navigate("/dashboard");
        }, 1800);
        setLoading(false);
        return;
      }
    } catch (err) {
      // If database authentication fails, check hardcoded admin credentials
      if (username === "admin" && password === "admin") {
        // Create admin user object with all privileges
        const adminUser = {
          id: 1,
          username: 'admin',
          type: 'admin',
          privileges: {
            canManageUsers: true,
            canManageDepartments: true,
            canViewDepartments: true,
            canAddDepartmentUsers: true,
            canManageSections: true,
            canViewAllStudents: true,
            canManageStudents: true,
            canViewAllGrades: true,
            canManageGrades: true,
            canViewReports: true,
            canManageReports: true,
            canViewAllSections: true,
            canManageAllSections: true,
            canViewSubjects: true,
            canViewCurriculum: true
          }
        };

        // Store admin data and privileges
        login(adminUser);
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          navigate("/dashboard");
        }, 1800);
        setLoading(false);
        return;
      }
      
      setError(err.response?.data?.message || "Invalid username or password");
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="login-container">
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="welcome-animation">
              <h2>Welcome{username === "admin" ? ", Administrator!" : "!"}</h2>
              <div className="loading-spinner"></div>
              <p>Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      )}
      <div className="login-box">
        <div className="login-header">
          <img src="/favicon (2).ico" alt="School Logo" className="school-logo" />
          <h2>Student Information System</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Username</label>
            <div className="input-user-icon">
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                className="login-username-input"
                disabled={loading || showModal}
                required
              />
            </div>
          </div>
        
          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                className="login-password-input"
                disabled={loading || showModal}
                required
              />
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading || showModal}
              />
              Remember me
            </label>
            <a href="https://www.youtube.com/watch?v=Ajrg-2USq9g" className="forgot-password">Forgot Password?</a>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit"
            className="login-button"
            disabled={loading || showModal}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <p>Need help? Contact <a href="https://www.youtube.com/watch?v=xvFZjo5PgG0">support@lnhs.edu</a></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
