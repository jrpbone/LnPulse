import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./CreateUser.css";

function CreateUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userType = queryParams.get('type');
  const isAdviserCreation = userType === 'adviser';

  const [departments, setDepartments] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
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
    type: isAdviserCreation ? "section_user" : "department_user",
    department_id: "",
    section_id: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptResponse, sectionResponse, usersResponse] = await Promise.all([
          axios.get("http://localhost:3001/departments"),
          axios.get("http://localhost:3001/sections"),
          axios.get("http://localhost:3001/users")
        ]);

        const allDepartments = deptResponse.data;
        const allSections = sectionResponse.data;
        setDepartments(allDepartments);
        setSections(allSections);
        setExistingUsernames(usersResponse.data.map(user => user.username));

        // Filter out departments that already have heads
        const departmentUsers = usersResponse.data.filter(user => user.type === 'department_user');
        const departmentsWithHead = departmentUsers.map(user => 
          user.departmentUser?.department_id
        ).filter(Boolean);

        const availableDepts = allDepartments.filter(
          dept => !departmentsWithHead.includes(dept.department_id)
        );
        setAvailableDepartments(availableDepts);

        // Filter out sections that already have advisers
        const sectionUsers = usersResponse.data.filter(user => user.type === 'section_user');
        const sectionsWithAdviser = sectionUsers.map(user => 
          user.sectionUser?.section_id
        ).filter(Boolean);

        const availableSects = allSections.filter(
          section => !sectionsWithAdviser.includes(section.section_id)
        );
        setAvailableSections(availableSects);

      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error loading form data. Please try again.");
      }
    };
    fetchData();
  }, []);

  // Update filtered sections when department changes
  useEffect(() => {
    if (formData.department_id && formData.type === "section_user") {
      axios.get(`http://localhost:3001/sections/byDepartment/${formData.department_id}`)
        .then((response) => {
          // Filter sections by department AND availability
          const departmentSections = response.data;
          const availableDepartmentSections = departmentSections.filter(
            section => availableSections.some(
              availableSection => availableSection.section_id === section.section_id
            )
          );
          setFilteredSections(availableDepartmentSections);
        })
        .catch((error) => {
          console.error("Error fetching sections:", error);
          setError("Failed to fetch sections for the selected department");
        });
    } else {
      setFilteredSections([]);
    }
  }, [formData.department_id, formData.type, availableSections]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset section_id when department changes
      ...(name === "department_id" && { section_id: "" })
    }));

    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check for duplicate username
    if (existingUsernames.includes(formData.username.trim())) {
      setError("This username is already taken. Please choose a different one.");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setError("");
    setSuccess("");

    // Validate required fields
    if (!formData.firstname || !formData.middlename || !formData.lastname || !formData.username || !formData.password || !formData.type) {
      setError("Please fill in all required fields");
      return;
    }

    // Check for duplicate username again before submission
    if (existingUsernames.includes(formData.username.trim())) {
      setError("This username is already taken. Please choose a different one.");
      setShowConfirmModal(false);
      return;
    }

    if (formData.type === "department_user" && !formData.department_id) {
      setError("Please select a department");
      return;
    }

    if (formData.type === "section_user" && (!formData.section_id || !formData.department_id)) {
      setError("Please select both section and department");
      return;
    }

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        middlename: formData.middlename || "NONE", // Set default value if empty
        department_id: parseInt(formData.department_id),
        section_id: formData.section_id ? parseInt(formData.section_id) : null,
        username: formData.username.trim() // Trim whitespace from username
      };

      console.log("Submitting data:", submitData);

      const response = await axios.post("http://localhost:3001/users", submitData);
      console.log("Server response:", response.data);

      setSuccess("User created successfully!");
      setShowConfirmModal(false);
      setShowSuccessMessage(true);
      
      // Wait for 2 seconds before redirecting
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate("/Users");
      }, 2000);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        if (error.response.data.message && error.response.data.message.includes("username must be unique")) {
          setError("This username is already taken. Please choose a different one.");
        } else {
          setError(error.response.data.message || "Error creating user. Please try again.");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        setError("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        setError("Error setting up the request. Please try again.");
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
        <h1>{isAdviserCreation ? 'Add New Adviser' : 'Create New User'}</h1>
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

        {!isAdviserCreation && (
          <div className="form-group">
            <label htmlFor="type">User Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="department_user">Department Head</option>
              <option value="section_user">Section Adviser</option>
            </select>
          </div>
        )}

        {(formData.type === "department_user" && !isAdviserCreation) ? (
          <div className="form-group">
            <label htmlFor="department_id">Department *</label>
            <select
              id="department_id"
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {availableDepartments.map((dept) => (
                <option key={dept.department_id} value={dept.department_id}>
                  {dept.department_name}
                </option>
              ))}
            </select>
            {availableDepartments.length === 0 && (
              <p className="warning-text" style={{ color: '#856404', fontSize: '0.9em', marginTop: '5px' }}>
                All departments currently have assigned heads
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="department_id">Department *</label>
              <select
                id="department_id"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="section_id">Section *</label>
              <select
                id="section_id"
                name="section_id"
                value={formData.section_id}
                onChange={handleChange}
                required
                disabled={!formData.department_id}
              >
                <option value="">Select Section</option>
                {filteredSections.map((section) => (
                  <option key={section.section_id} value={section.section_id}>
                    {section.grade_level} - {section.section_name}
                  </option>
                ))}
              </select>
              {formData.department_id && filteredSections.length === 0 && (
                <p className="warning-text" style={{ color: '#856404', fontSize: '0.9em', marginTop: '5px' }}>
                  All sections in this department currently have assigned advisers
                </p>
              )}
            </div>
          </>
        )}

        <div className="form-actions">
          <button type="submit" className="submit-button">
            {isAdviserCreation ? 'Create Adviser' : 'Create User'}
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
            <h3>Confirm {isAdviserCreation ? 'Adviser' : 'User'} Creation</h3>
            <p>Are you sure you want to create a new {isAdviserCreation ? 'adviser' : 'user'} with the following details?</p>
            <div className="confirmation-details">
              <p><strong>Name:</strong> {formData.firstname} {formData.middlename} {formData.lastname}</p>
              <p><strong>Username:</strong> {formData.username}</p>
              {!isAdviserCreation && <p><strong>Type:</strong> {formData.type === 'department_user' ? 'Department Head' : 'Section Adviser'}</p>}
              {formData.department_id && (
                <p><strong>Department:</strong> {departments.find(d => d.department_id === parseInt(formData.department_id))?.department_name}</p>
              )}
              {formData.section_id && (
                <p><strong>Section:</strong> {sections.find(s => s.section_id === parseInt(formData.section_id))?.section_name}</p>
              )}
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

export default CreateUser;
