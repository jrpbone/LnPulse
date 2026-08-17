import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../shared/api/client";
import { FiArrowLeft, FiCheck, FiKey, FiShield, FiUser } from "react-icons/fi";
import WorkspacePageHeader from "../../../shared/components/WorkspacePageHeader";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import "./CreateUser.css";
import "./EditUserModern.css";

function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [departments, setDepartments] = useState([]);
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
        const userResponse = await apiClient.get(`/users/${id}`);
        const userData = userResponse.data;

        // Fetch departments and users
        const [deptResponse, usersResponse] = await Promise.all([
          apiClient.get("/departments"),
          apiClient.get("/users")
        ]);

        setDepartments(deptResponse.data);
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
          const filteredSectionsResponse = await apiClient.get(
            `/sections/byDepartment/${userData.sectionUser.department_id}`
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
      apiClient.get(`/sections/byDepartment/${formData.department_id}`)
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

      const response = await apiClient.put(`/users/${id}`, submitData);
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
    <div className="create-user-container workspace-page edit-user-page">
      {showSuccessMessage && (
        <div className="edit-user-toast">
          <FiCheck /> User updated successfully. Returning to users…
        </div>
      )}

      <WorkspacePageHeader
        eyebrow="Access management"
        title="Edit user"
        description="Update account identity, credentials, role, and school assignment."
        actions={(
          <button type="button" className="workspace-secondary-action" onClick={() => navigate("/Users")}>
            <FiArrowLeft /> Back to users
          </button>
        )}
      />

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

      <form className="create-user-form modern-user-form" onSubmit={handleSubmit}>
        <section className="user-form-section">
          <div className="user-section-heading"><span><FiUser /></span><div><h2>Personal identity</h2><p>The name displayed throughout the system.</p></div></div>
          <div className="user-form-grid three-columns">
            <div className="form-group"><label htmlFor="firstname">First name <b>*</b></label><input type="text" id="firstname" name="firstname" value={formData.firstname} onChange={handleChange} placeholder="First name" required /></div>
            <div className="form-group"><label htmlFor="middlename">Middle name <b>*</b></label><input type="text" id="middlename" name="middlename" value={formData.middlename} onChange={handleChange} placeholder="Middle name" required /></div>
            <div className="form-group"><label htmlFor="lastname">Last name <b>*</b></label><input type="text" id="lastname" name="lastname" value={formData.lastname} onChange={handleChange} placeholder="Last name" required /></div>
          </div>
        </section>

        <section className="user-form-section">
          <div className="user-section-heading"><span><FiKey /></span><div><h2>Sign-in credentials</h2><p>Change the username or optionally set a new password.</p></div></div>
          <div className="user-form-grid two-columns">
            <div className="form-group"><label htmlFor="username">Username <b>*</b></label><input type="text" id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Username" autoComplete="username" required /></div>
            <div className="form-group"><label htmlFor="password">New password <em>Optional</em></label><input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current password" autoComplete="new-password" /><small className="helper-text">Only enter a value when resetting this user's password.</small></div>
          </div>
        </section>

        <section className="user-form-section">
          <div className="user-section-heading"><span><FiShield /></span><div><h2>Role and assignment</h2><p>Controls permissions and which school records this user can access.</p></div></div>
          <div className="role-choice" role="radiogroup" aria-label="User type">
            <label className={formData.type === "department_user" ? "selected" : ""}><input type="radio" name="type" value="department_user" checked={formData.type === "department_user"} onChange={handleChange} /><span><strong>Department head</strong><small>Manages a department, advisers, and student records.</small></span></label>
            <label className={formData.type === "section_user" ? "selected" : ""}><input type="radio" name="type" value="section_user" checked={formData.type === "section_user"} onChange={handleChange} /><span><strong>Adviser</strong><small>Manages learners and grades within an assigned section.</small></span></label>
          </div>
          <div className={`user-form-grid ${formData.type === "section_user" ? "two-columns" : "one-column"}`}>
            <div className="form-group"><label htmlFor="department_id">Department <b>*</b></label><select id="department_id" name="department_id" value={formData.department_id} onChange={handleChange} required><option value="">Select department</option>{departments.map((dept) => <option key={dept.department_id} value={dept.department_id}>{dept.department_name}</option>)}</select></div>
            {formData.type === "section_user" && (
              <div className="form-group"><label htmlFor="section_id">Section <b>*</b></label><select id="section_id" name="section_id" value={formData.section_id} onChange={handleChange} required disabled={!formData.department_id}><option value="">Select section</option>{filteredSections.map((section) => <option key={section.section_id} value={section.section_id}>{section.grade_level} - {section.section_name}</option>)}</select>{!formData.department_id && <small className="helper-text">Select a department first.</small>}</div>
            )}
          </div>
        </section>

        <div className="form-actions modern-user-actions">
          <div><strong>Review your changes</strong><span>You’ll confirm the updated account details before saving.</span></div>
          <div><button type="button" className="cancel-button" onClick={() => navigate("/Users")}>Cancel</button><button type="submit" className="submit-button"><FiCheck /> Review changes</button></div>
        </div>
      </form>

      <ConfirmationModal isOpen={showConfirmModal} title="Update this account?" message="Review the details below before changing this user's access." confirmLabel="Confirm update" cancelLabel="Go back" onConfirm={confirmSubmit} onCancel={cancelSubmit}>
        <dl className="confirmation-details-list">
          <div className="confirmation-detail"><dt>Name</dt><dd>{formData.firstname} {formData.middlename} {formData.lastname}</dd></div>
          <div className="confirmation-detail"><dt>Username</dt><dd>{formData.username}</dd></div>
          <div className="confirmation-detail"><dt>Role</dt><dd>{formData.type === 'department_user' ? 'Department head' : 'Adviser'}</dd></div>
          <div className="confirmation-detail"><dt>Department</dt><dd>{departments.find(d => d.department_id === parseInt(formData.department_id))?.department_name}</dd></div>
          {formData.type === 'section_user' && <div className="confirmation-detail"><dt>Section</dt><dd>{filteredSections.find(s => s.section_id === parseInt(formData.section_id))?.section_name}</dd></div>}
        </dl>
      </ConfirmationModal>
    </div>
  );
}

export default EditUser;
