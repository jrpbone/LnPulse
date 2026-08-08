import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./CreateUser.css";

function DUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const { privileges } = useAuth();
  
  // Get department ID from URL query parameter or privileges
  const queryParams = new URLSearchParams(location.search);
  const deptFromQuery = queryParams.get('dept');
  const departmentId = deptFromQuery || privileges?.departmentId;

  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [existingUsernames, setExistingUsernames] = useState([]);
  const [formData, setFormData] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    username: "",
    password: "",
    type: "section_user",
    department_id: departmentId || "",
    section_id: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentResponse, sectionResponse, usersResponse] = await Promise.all([
          axios.get("http://localhost:3001/departments"),
          axios.get(`http://localhost:3001/sections/byDepartment/${departmentId}`),
          axios.get("http://localhost:3001/users")
        ]);

        setDepartments(departmentResponse.data);
        
        // Get all section users (advisers)
        const sectionUsers = usersResponse.data.filter(user => user.type === 'section_user');
        const sectionsWithAdviser = sectionUsers.map(user => 
          user.sectionUser?.section_id
        ).filter(Boolean);

        // Filter out sections that already have advisers
        const availableSections = sectionResponse.data.filter(
          section => !sectionsWithAdviser.includes(section.section_id)
        );

        setSections(sectionResponse.data);
        setFilteredSections(availableSections);
        setExistingUsernames(usersResponse.data.map(user => user.username));
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error loading form data. Please try again.");
      }
    };
    fetchData();
  }, [departmentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (existingUsernames.includes(formData.username.trim())) {
      setError("This username is already taken. Please choose a different one.");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setError("");
    setSuccess("");

    if (!formData.firstname || !formData.middlename || !formData.lastname || 
        !formData.username || !formData.password || !formData.section_id) {
      setError("Please fill in all required fields");
      return;
    }

    if (existingUsernames.includes(formData.username.trim())) {
      setError("This username is already taken. Please choose a different one.");
      setShowConfirmModal(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        middlename: formData.middlename || "NONE",
        department_id: parseInt(privileges.departmentId),
        section_id: parseInt(formData.section_id),
        username: formData.username.trim()
      };

      const response = await axios.post("http://localhost:3001/users", submitData);
      setSuccess("Adviser created successfully!");
      setShowConfirmModal(false);
      setShowSuccessMessage(true);
      
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate("/Users");
      }, 2000);
    } catch (error) {
      console.error("Error creating adviser:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Error creating adviser. Please try again.");
      }
      setShowConfirmModal(false);
    }
  };

  const cancelSubmit = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className="create-user-container">
      {showSuccessMessage && (
        <div className="success-message">
          Operation completed successfully!
        </div>
      )}
      
      <div className="form-header">
        <h1>Add New Adviser</h1>
      </div>

      {error && (
        <div className="error-alert" role="alert">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="success-alert" role="alert">
          <p>{success}</p>
        </div>
      )}

      <form className="create-user-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstname">First Name *</label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="middlename">Middle Name *</label>
          <input
            type="text"
            id="middlename"
            name="middlename"
            value={formData.middlename}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastname">Last Name *</label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username *</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="text"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Department</label>
          <input
            type="text"
            value={departments.find(d => d.department_id === parseInt(formData.department_id))?.department_name || ""}
            disabled
            className="disabled-input"
            style={{
              backgroundColor: '#f5f5f5',
              color: '#666',
              cursor: 'not-allowed'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="section_id">Section *</label>
          <select
            id="section_id"
            name="section_id"
            value={formData.section_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Section</option>
            {filteredSections.map((section) => (
              <option key={section.section_id} value={section.section_id}>
                {section.grade_level} - {section.section_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Create Adviser
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/Users")}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Adviser Creation</h3>
            <p>Are you sure you want to create a new adviser with the following details?</p>
            <div className="confirmation-details">
              <p><strong>Name:</strong> {formData.firstname} {formData.middlename} {formData.lastname}</p>
              <p><strong>Username:</strong> {formData.username}</p>
              <p><strong>Section:</strong> {filteredSections.find(s => s.section_id === parseInt(formData.section_id))?.section_name}</p>
            </div>
            <div className="button-group">
              <button className="submit-button" onClick={confirmSubmit}>
                Confirm
              </button>
              <button className="cancel-button" onClick={cancelSubmit}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DUser; 