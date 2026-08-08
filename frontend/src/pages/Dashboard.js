import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./dash.css";

function Dashboard() {
  const { user } = useAuth();
  const [academicSettings, setAcademicSettings] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalDepartments: 0,
    totalUsers: 0
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get("http://localhost:3001/academicSettings/current");
        setAcademicSettings(response.data);
      } catch (error) {
        console.error("Error fetching academic settings:", error);
        setErrorMessage("Failed to fetch academic settings");
        setShowErrorModal(true);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:3001/dashboard/stats");
        if (response.data) {
          setStats({
            totalStudents: response.data.totalStudents || 0,
            activeStudents: response.data.activeStudents || 0,
            totalDepartments: response.data.totalDepartments || 0,
            totalUsers: response.data.totalUsers || 0
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setErrorMessage("Failed to fetch dashboard statistics");
        setShowErrorModal(true);
      }
    };

    fetchSettings();
    fetchStats();
  }, []);

  const settingsSchema = Yup.object().shape({
    current_school_year: Yup.string()
      .matches(/^\d{4}-\d{4}$/, "School year must be in YYYY-YYYY format")
      .required("Required"),
    current_semester: Yup.string()
      .oneOf(["1st Semester", "2nd Semester", "Summer Class"], "Invalid semester")
      .required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.put("http://localhost:3001/academicSettings/update", values);
      setAcademicSettings(response.data);
      setSuccessMessage("Academic settings updated successfully!");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error updating academic settings:", error);
      setErrorMessage(error.response?.data?.message || "Failed to update academic settings");
      setShowErrorModal(true);
    }
    setSubmitting(false);
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <h1>Welcome to LNHS SHS</h1>
              <p className="header-subtitle">School Information System</p>
            </div>
            <div className="user-info">
              <span className="user-icon">👤</span>
              <span>{user?.username}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Total Students</h3>
                <p className="stat-number">{stats.totalStudents}</p>
                <p className="stat-description">All Students in System</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <h3>Active Students</h3>
                <p className="stat-number">{stats.activeStudents}</p>
                <p className="stat-description">Currently Enrolled</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏛️</div>
              <div className="stat-content">
                <h3>Departments</h3>
                <p className="stat-number">{stats.totalDepartments}</p>
                <p className="stat-description">Active Departments</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👨‍🏫</div>
              <div className="stat-content">
                <h3>System Users</h3>
                <p className="stat-number">{stats.totalUsers}</p>
                <p className="stat-description">Registered Users</p>
              </div>
            </div>
          </div>

          {user?.type === 'admin' && (
            <div className="card">
              <div className="card-header">
                <h2>Academic Settings</h2>
                <p className="card-subtitle">Manage current academic year and semester</p>
              </div>
              <Formik
                enableReinitialize
                initialValues={{
                  current_school_year: academicSettings?.current_school_year || "",
                  current_semester: academicSettings?.current_semester || "",
                }}
                validationSchema={settingsSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="academic-settings-form">
                    <div className="form-group">
                      <label>Current School Year</label>
                      <Field
                        type="text"
                        name="current_school_year"
                        placeholder="YYYY-YYYY"
                        className="form-control"
                      />
                      <ErrorMessage name="current_school_year" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label>Current Semester</label>
                      <Field as="select" name="current_semester" className="form-control">
                        <option value="">Select Semester</option>
                        <option value="1st Semester">1st Semester</option>
                        <option value="2nd Semester">2nd Semester</option>
                        <option value="Summer Class">Summer Class</option>
                      </Field>
                      <ErrorMessage name="current_semester" component="div" className="error-message" />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="submit-button">
                      {isSubmitting ? 'Updating...' : 'Update Settings'}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          )}
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="modal-content success">
              <div className="modal-header">
                <h3>Success</h3>
              </div>
              <div className="modal-body">
                <p>{successMessage}</p>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowSuccessModal(false)} className="modal-button success">
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {showErrorModal && (
          <div className="modal-overlay">
            <div className="modal-content error">
              <div className="modal-header">
                <h3>Error</h3>
              </div>
              <div className="modal-body">
                <p>{errorMessage}</p>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowErrorModal(false)} className="modal-button error">
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;