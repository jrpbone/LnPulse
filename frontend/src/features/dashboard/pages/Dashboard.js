import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import apiClient from "../../../shared/api/client";
import { useAuth } from "../../../core/auth/AuthContext";
import WorkspacePageHeader from "../../../shared/components/WorkspacePageHeader";
import {
  FiBookOpen,
  FiCalendar,
  FiCheck,
  FiLayers,
  FiSettings,
  FiShield,
  FiUsers,
  FiX,
} from "react-icons/fi";
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
    totalUsers: 0,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get("/academicSettings/current");
        setAcademicSettings(response.data);
      } catch (error) {
        console.error("Error fetching academic settings:", error);
        setErrorMessage("Academic settings could not be loaded.");
        setShowErrorModal(true);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await apiClient.get("/dashboard/stats");
        if (response.data) {
          setStats({
            totalStudents: response.data.totalStudents || 0,
            activeStudents: response.data.activeStudents || 0,
            totalDepartments: response.data.totalDepartments || 0,
            totalUsers: response.data.totalUsers || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setErrorMessage("Dashboard statistics could not be loaded.");
        setShowErrorModal(true);
      }
    };

    fetchSettings();
    fetchStats();
  }, []);

  const settingsSchema = Yup.object().shape({
    current_school_year: Yup.string()
      .matches(/^\d{4}-\d{4}$/, "Use the YYYY-YYYY format")
      .required("School year is required"),
    current_semester: Yup.string()
      .oneOf(["1st Semester", "2nd Semester", "Summer Class"], "Select a valid semester")
      .required("Semester is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await apiClient.put("/academicSettings/update", values);
      setAcademicSettings(response.data);
      setSuccessMessage("The active academic period has been updated successfully.");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error updating academic settings:", error);
      setErrorMessage(error.response?.data?.message || "Academic settings could not be updated.");
      setShowErrorModal(true);
    }
    setSubmitting(false);
  };

  const firstName = user?.firstname || user?.username || "there";
  const today = new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  const activeRate = stats.totalStudents
    ? Math.round((stats.activeStudents / stats.totalStudents) * 100)
    : 0;

  const statItems = [
    { label: "Total students", value: stats.totalStudents, note: "All student records", icon: FiUsers, tone: "blue" },
    { label: "Active students", value: stats.activeStudents, note: `${activeRate}% currently enrolled`, icon: FiBookOpen, tone: "green" },
    { label: "Departments", value: stats.totalDepartments, note: "Academic departments", icon: FiLayers, tone: "violet" },
    { label: "System users", value: stats.totalUsers, note: "Authorized accounts", icon: FiShield, tone: "amber" },
  ];

  return (
    <div className="dashboard-container workspace-page">
      <WorkspacePageHeader
        eyebrow="Overview"
        title={`Welcome back, ${firstName}`}
        description="Here’s what’s happening across LNHS Senior High today."
        actions={(
          <div className="date-chip">
          <FiCalendar aria-hidden="true" />
          <span>{today}</span>
          </div>
        )}
      />

      <section className="dashboard-hero" aria-label="Academic year summary">
        <div className="hero-copy">
          <span className="hero-badge">LNHS Student Information System</span>
          <h2>Everything you need to keep student records moving.</h2>
          <p>Monitor enrollment, departments, and academic settings from one secure workspace.</p>
        </div>
        <div className="hero-period">
          <span>Current academic period</span>
          <strong>{academicSettings?.current_school_year || "Not set"}</strong>
          <small>{academicSettings?.current_semester || "Select a semester"}</small>
        </div>
      </section>

      <section className="stats-container" aria-label="School statistics">
        {statItems.map(({ label, value, note, icon: Icon, tone }) => (
          <article className="stat-card" key={label}>
            <div className={`stat-icon ${tone}`}><Icon aria-hidden="true" /></div>
            <div className="stat-content">
              <p className="stat-label">{label}</p>
              <p className="stat-number">{Number(value).toLocaleString()}</p>
              <p className="stat-description"><span />{note}</p>
            </div>
          </article>
        ))}
      </section>

      {user?.type === "admin" && (
        <section className="settings-layout">
          <div className="card settings-card">
            <div className="card-header">
              <div className="card-title-icon"><FiSettings aria-hidden="true" /></div>
              <div>
                <p className="eyebrow">Configuration</p>
                <h2>Academic settings</h2>
                <p className="card-subtitle">Set the active school year and grading period.</p>
              </div>
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
                    <label htmlFor="current_school_year">Current school year</label>
                    <Field id="current_school_year" type="text" name="current_school_year" placeholder="e.g. 2026-2027" className="form-control" />
                    <ErrorMessage name="current_school_year" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="current_semester">Current semester</label>
                    <Field id="current_semester" as="select" name="current_semester" className="form-control">
                      <option value="">Select semester</option>
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                      <option value="Summer Class">Summer Class</option>
                    </Field>
                    <ErrorMessage name="current_semester" component="div" className="error-message" />
                  </div>

                  <button type="submit" disabled={isSubmitting} className="submit-button">
                    {isSubmitting ? <span className="button-loader" /> : <FiCheck aria-hidden="true" />}
                    {isSubmitting ? "Saving changes..." : "Save changes"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>

          <aside className="period-card">
            <div className="period-card-icon"><FiCalendar aria-hidden="true" /></div>
            <p className="eyebrow">Now active</p>
            <h3>{academicSettings?.current_school_year || "No school year set"}</h3>
            <p>{academicSettings?.current_semester || "Choose an academic period to make it visible across the system."}</p>
            <div className="period-status"><span /> Active configuration</div>
          </aside>
        </section>
      )}

      {showSuccessModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="success-title">
          <div className="modal-content success">
            <div className="modal-state-icon success"><FiCheck /></div>
            <button className="modal-close" onClick={() => setShowSuccessModal(false)} aria-label="Close"><FiX /></button>
            <div className="modal-header"><h3 id="success-title">Settings updated</h3></div>
            <div className="modal-body"><p>{successMessage}</p></div>
            <div className="modal-footer">
              <button onClick={() => setShowSuccessModal(false)} className="modal-button success">Done</button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="error-title">
          <div className="modal-content error">
            <div className="modal-state-icon error">!</div>
            <button className="modal-close" onClick={() => setShowErrorModal(false)} aria-label="Close"><FiX /></button>
            <div className="modal-header"><h3 id="error-title">Something went wrong</h3></div>
            <div className="modal-body"><p>{errorMessage}</p></div>
            <div className="modal-footer">
              <button onClick={() => setShowErrorModal(false)} className="modal-button error">Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
