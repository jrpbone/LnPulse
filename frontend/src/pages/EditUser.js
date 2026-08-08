import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./CreateUser.css";

function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
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
    type: "department_user",
    department_id: "",
    section_id: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await axios.get(`http://localhost:3001/users/${id}`);
        const userData = userResponse.data;

        // Fetch departments, sections, and users
        const [deptResponse, sectionResponse, usersResponse] = await Promise.all([
          axios.get("http://localhost:3001/departments"),
          axios.get("http://localhost:3001/sections"),
          axios.get("http://localhost:3001/users")
        ]);

        setDepartments(deptResponse.data);
        setSections(sectionResponse.data);
        setExistingUsernames(usersResponse.data
          .filter(user => user.id !== parseInt(id))
          .map(user => user.username));

        // Set form data
        setFormData({
          firstname: userData.firstname,
          middlename: userData.middlename || "",
          lastname: userData.lastname,
          username: userData.username,
          password: "", // Don't show current password
          type: userData.type,
          department_id: userData.type === 'department_user' 
            ? userData.departmentUser?.department_id 
            : userData.sectionUser?.department_id || "",
          section_id: userData.sectionUser?.section_id || ""
        });

        // If user is a section user, fetch filtered sections
        if (userData.type === "section_user" && userData.sectionUser?.department_id) {
          const filteredSectionsResponse = await axios.get(
            `http://localhost:3001/sections/byDepartment/${userData.sectionUser.department_id}`
          );
          setFilteredSections(filteredSectionsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error loading user data. Please try again.");
      }
    };
    fetchData();
  }, [id]);

  // Update filtered sections when department changes
  useEffect(() => {
    if (formData.department_id && formData.type === "section_user") {
      axios.get(`http://localhost:3001/sections/byDepartment/${formData.department_id}`)
        .then((response) => {
          setFilteredSections(response.data);
        })
        .catch((error) => {
          console.error("Error fetching sections:", error);
          setError("Failed to fetch sections for the selected department");
        });
    } else {
      setFilteredSections([]);
    }
  }, [formData.department_id, formData.type]);

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
    if (!formData.firstname || !formData.lastname || !formData.username) {
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
        username: formData.username.trim() // Trim whitespace from username
      };

      // Only include password if it's been changed
      if (!submitData.password) {
        delete submitData.password;
      }

      // Handle department and section IDs based on user type
      if (formData.type === "department_user") {
        submitData.department_id = parseInt(formData.department_id);
        submitData.section_id = null; // Explicitly set to null for department users
      } else {
        submitData.department_id = parseInt(formData.department_id);
        submitData.section_id = parseInt(formData.section_id);
      }

      console.log("Submitting data:", submitData);

      const response = await axios.put(`http://localhost:3001/users/${id}`, submitData);
      console.log("Server response:", response.data);

      setSuccess("User updated successfully!");
      setShowConfirmModal(false);
      setShowSuccessMessage(true);
      
      // Wait for 2 seconds before redirecting
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate("/Users");
      }, 2000);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        if (error.response.data.message && error.response.data.message.includes("username must be unique")) {
          setError("This username is already taken. Please choose a different one.");
        } else if (error.response.data.message && error.response.data.message.includes("cannot be null")) {
          setError("Please make sure all required fields are filled out correctly.");
        } else {
          setError(error.response.data.message || "Error updating user. Please try again.");
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
        <h1>Edit User</h1>
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
          <label htmlFor="password">Password (leave blank to keep current password)</label>
          <input
            type="text"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

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
            <option value="section_user">Adviser</option>
          </select>
        </div>

        {formData.type === "department_user" ? (
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
              {!formData.department_id && (
                <small className="helper-text">Please select a department first</small>
              )}
            </div>
          </>
        )}

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Update User
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
            <h3>Confirm User Update</h3>
            <p>Are you sure you want to update this user with the following details?</p>
            <div className="confirmation-details">
              <p><strong>Name:</strong> {formData.firstname} {formData.middlename} {formData.lastname}</p>
              <p><strong>Username:</strong> {formData.username}</p>
              <p><strong>Type:</strong> {formData.type === 'department_user' ? 'Department Head' : 'Adviser'}</p>
              {formData.type === 'department_user' ? (
                <p><strong>Department:</strong> {departments.find(d => d.department_id === parseInt(formData.department_id))?.department_name}</p>
              ) : (
                <>
                  <p><strong>Department:</strong> {departments.find(d => d.department_id === parseInt(formData.department_id))?.department_name}</p>
                  <p><strong>Section:</strong> {filteredSections.find(s => s.section_id === parseInt(formData.section_id))?.section_name}</p>
                </>
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

export default EditUser; 