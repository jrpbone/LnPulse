import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../../shared/api/client";
import { FiArrowLeft, FiCheck, FiKey, FiShield, FiUser } from "react-icons/fi";
import WorkspacePageHeader from "../../../shared/components/WorkspacePageHeader";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import "./CreateUser.css";
import "./EditUserModern.css";

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
          apiClient.get("/departments"),
          apiClient.get("/sections"),
          apiClient.get("/users")
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
      apiClient.get(`/sections/byDepartment/${formData.department_id}`)
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

      const response = await apiClient.post("/users", submitData);
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

  const selectedDepartment = departments.find(d => d.department_id === parseInt(formData.department_id));
  const selectedSection = sections.find(s => s.section_id === parseInt(formData.section_id));

  return (
    <div className="create-user-container workspace-page edit-user-page create-user-page">
      {showSuccessMessage && (
        <div className="edit-user-toast"><FiCheck /> Account created successfully. Returning to users…</div>
      )}

      <WorkspacePageHeader
        eyebrow="Access management"
        title={isAdviserCreation ? "New adviser" : "New user"}
        description="Create a secure account and assign the appropriate school access."
        actions={<button type="button" className="workspace-secondary-action" onClick={() => navigate("/Users")}><FiArrowLeft /> Back to users</button>}
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
          <div className="user-section-heading"><span><FiUser /></span><div><h2>Personal identity</h2><p>Enter the staff member's complete legal name.</p></div></div>
          <div className="user-form-grid three-columns">
            <div className="form-group"><label htmlFor="firstname">First name <b>*</b></label><input type="text" id="firstname" name="firstname" value={formData.firstname} onChange={handleChange} placeholder="First name" required autoFocus /></div>
            <div className="form-group"><label htmlFor="middlename">Middle name <b>*</b></label><input type="text" id="middlename" name="middlename" value={formData.middlename} onChange={handleChange} placeholder="Middle name" required /></div>
            <div className="form-group"><label htmlFor="lastname">Last name <b>*</b></label><input type="text" id="lastname" name="lastname" value={formData.lastname} onChange={handleChange} placeholder="Last name" required /></div>
          </div>
        </section>

        <section className="user-form-section">
          <div className="user-section-heading"><span><FiKey /></span><div><h2>Sign-in credentials</h2><p>Create the username and initial password for this account.</p></div></div>
          <div className="user-form-grid two-columns">
            <div className="form-group"><label htmlFor="username">Username <b>*</b></label><input type="text" id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" autoComplete="username" required /></div>
            <div className="form-group"><label htmlFor="password">Temporary password <b>*</b></label><input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a secure password" autoComplete="new-password" required /><small className="helper-text">Share this securely with the account owner.</small></div>
          </div>
        </section>

        <section className="user-form-section">
          <div className="user-section-heading"><span><FiShield /></span><div><h2>Role and assignment</h2><p>Choose the account's responsibility and school assignment.</p></div></div>
          {!isAdviserCreation && (
            <div className="role-choice" role="radiogroup" aria-label="User type">
              <label className={formData.type === "department_user" ? "selected" : ""}><input type="radio" name="type" value="department_user" checked={formData.type === "department_user"} onChange={handleChange} /><span><strong>Department head</strong><small>Manages a department, advisers, and student records.</small></span></label>
              <label className={formData.type === "section_user" ? "selected" : ""}><input type="radio" name="type" value="section_user" checked={formData.type === "section_user"} onChange={handleChange} /><span><strong>Section adviser</strong><small>Manages learners and grades in one assigned section.</small></span></label>
            </div>
          )}
          <div className={`user-form-grid ${formData.type === "section_user" ? "two-columns" : "one-column"}`}>
            <div className="form-group"><label htmlFor="department_id">Department <b>*</b></label><select id="department_id" name="department_id" value={formData.department_id} onChange={handleChange} required><option value="">Select department</option>{(formData.type === "department_user" && !isAdviserCreation ? availableDepartments : departments).map((dept) => <option key={dept.department_id} value={dept.department_id}>{dept.department_name}</option>)}</select>{formData.type === "department_user" && availableDepartments.length === 0 && <small className="assignment-warning">All departments currently have assigned heads.</small>}</div>
            {formData.type === "section_user" && <div className="form-group"><label htmlFor="section_id">Section <b>*</b></label><select id="section_id" name="section_id" value={formData.section_id} onChange={handleChange} required disabled={!formData.department_id}><option value="">Select section</option>{filteredSections.map((section) => <option key={section.section_id} value={section.section_id}>{section.grade_level} - {section.section_name}</option>)}</select>{formData.department_id && filteredSections.length === 0 && <small className="assignment-warning">All sections in this department already have advisers.</small>}</div>}
          </div>
        </section>

        <div className="form-actions modern-user-actions">
          <div><strong>Ready to create this account?</strong><span>You’ll review all access details before they are saved.</span></div>
          <div><button type="button" className="cancel-button" onClick={() => navigate("/Users")}>Cancel</button><button type="submit" className="submit-button"><FiCheck /> Review account</button></div>
        </div>
      </form>

      <ConfirmationModal isOpen={showConfirmModal} title={`Create ${formData.type === "section_user" ? "adviser" : "department head"} account?`} message="Review the account details and assignment before creating access." confirmLabel="Create account" cancelLabel="Go back" onConfirm={confirmSubmit} onCancel={cancelSubmit}>
        <dl className="confirmation-details-list">
          <div className="confirmation-detail"><dt>Name</dt><dd>{formData.firstname} {formData.middlename} {formData.lastname}</dd></div>
          <div className="confirmation-detail"><dt>Username</dt><dd>{formData.username}</dd></div>
          <div className="confirmation-detail"><dt>Role</dt><dd>{formData.type === "department_user" ? "Department head" : "Section adviser"}</dd></div>
          {selectedDepartment && <div className="confirmation-detail"><dt>Department</dt><dd>{selectedDepartment.department_name}</dd></div>}
          {selectedSection && <div className="confirmation-detail"><dt>Section</dt><dd>{selectedSection.grade_level} - {selectedSection.section_name}</dd></div>}
        </dl>
      </ConfirmationModal>
    </div>
  );
}

export default CreateUser;
