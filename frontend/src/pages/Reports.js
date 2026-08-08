import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './styles.css';

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { privileges } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const params = {};
        
        // Add filters based on user privileges
        if (privileges.departmentId) {
          params.departmentId = privileges.departmentId;
        }
        if (privileges.sectionId) {
          params.sectionId = privileges.sectionId;
        }

        const response = await axios.get('http://localhost:3001/reports', { params });
        setReports(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to fetch reports. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [privileges.departmentId, privileges.sectionId]);

  if (loading) return <div className="loading">Loading reports...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="container">
      <div className="header">
        <h1>Reports</h1>
        {privileges.canManageReports && (
          <button className="create-report-button">
            Create New Report
          </button>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="no-reports">
          <p>No reports found.</p>
        </div>
      ) : (
        <div className="reports-list">
          {reports.map((report) => (
            <div key={report.id} className="report-card">
              <h3>{report.title}</h3>
              {report.description && <p>{report.description}</p>}
              <div className="report-meta">
                <span>Created by: {report.creator?.firstname} {report.creator?.lastname}</span>
                <span>Created: {new Date(report.created_at).toLocaleDateString()}</span>
                {report.department?.department_name && (
                  <span>Department: {report.department.department_name}</span>
                )}
                {report.section?.section_name && (
                  <span>Section: {report.section.section_name}</span>
                )}
              </div>
              <div className="report-actions">
                <button onClick={() => window.location.href = `/reports/${report.id}`}>
                  View Report
                </button>
                {privileges.canManageReports && (
                  <button 
                    className="edit-button"
                    onClick={() => window.location.href = `/reports/edit/${report.id}`}
                  >
                    Edit Report
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reports; 