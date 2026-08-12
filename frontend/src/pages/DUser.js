import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FiArrowLeft, FiCheck, FiKey, FiShield, FiUser } from "react-icons/fi";
import WorkspacePageHeader from "../components/WorkspacePageHeader";
import ConfirmationModal from "../components/ConfirmationModal";
import "./CreateUser.css";
import "./EditUserModern.css";

function DUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const { privileges } = useAuth();
  
  // Get department ID from URL query parameter or privileges
  const queryParams = new URLSearchParams(location.search);
  const deptFromQuery = queryParams.get('dept');
  const departmentId = deptFromQuery || privileges?.departmentId;

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

      await axios.post("http://localhost:3001/users", submitData);
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

  const selectedSection = filteredSections.find(s => s.section_id === parseInt(formData.section_id));
  const selectedDepartment = departments.find(d => d.department_id === parseInt(formData.department_id));

  return (
    <div className="create-user-container workspace-page edit-user-page create-user-page">
      {showSuccessMessage && (
        <div className="edit-user-toast"><FiCheck /> Adviser account created. Returning to users…</div>
      )}

      <WorkspacePageHeader eyebrow="Access management" title="New adviser" description="Create an adviser account and assign it to an available section." actions={<button type="button" className="workspace-secondary-action" onClick={() => navigate("/Users")}><FiArrowLeft /> Back to users</button>} />

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
          <div className="user-section-heading"><span><FiUser /></span><div><h2>Personal identity</h2><p>Enter the adviser's complete legal name.</p></div></div>
          <div className="user-form-grid three-columns">
        <div className="form-group">
          <label htmlFor="firstname">First name <b>*</b></label>
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
          <label htmlFor="middlename">Middle name <b>*</b></label>
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
          <label htmlFor="lastname">Last name <b>*</b></label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
        </div>
          </div>
        </section>

        <section className="user-form-section">
          <div className="user-section-heading"><span><FiKey /></span><div><h2>Sign-in credentials</h2><p>Create the username and initial password for this adviser.</p></div></div>
          <div className="user-form-grid two-columns">
        <div className="form-group">
          <label htmlFor="username">Username <b>*</b></label>
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
          <label htmlFor="password">Temporary password <b>*</b></label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
          </div>
        </section>

        <section className="user-form-section">
          <div className="user-section-heading"><span><FiShield /></span><div><h2>School assignment</h2><p>Assign this adviser to an available section in the department.</p></div></div>
          <div className="user-form-grid two-columns">
        <div className="form-group">
          <label>Department</label>
          <input
            type="text"
            value={departments.find(d => d.department_id === parseInt(formData.department_id))?.department_name || ""}
            disabled
            className="disabled-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="section_id">Section <b>*</b></label>
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
          </div>
        </section>

        <div className="form-actions modern-user-actions">
          <div><strong>Ready to create this adviser?</strong><span>You’ll review the account and section assignment before saving.</span></div>
          <div><button type="button" className="cancel-button" onClick={() => navigate("/Users")}>Cancel</button><button type="submit" className="submit-button"><FiCheck /> Review account</button></div>
        </div>
      </form>

      <ConfirmationModal isOpen={showConfirmModal} title="Create adviser account?" message="Review the account and section assignment before creating access." confirmLabel="Create adviser" cancelLabel="Go back" onConfirm={confirmSubmit} onCancel={cancelSubmit}>
        <dl className="confirmation-details-list">
          <div className="confirmation-detail"><dt>Name</dt><dd>{formData.firstname} {formData.middlename} {formData.lastname}</dd></div>
          <div className="confirmation-detail"><dt>Username</dt><dd>{formData.username}</dd></div>
          <div className="confirmation-detail"><dt>Department</dt><dd>{selectedDepartment?.department_name}</dd></div>
          <div className="confirmation-detail"><dt>Section</dt><dd>{selectedSection ? `${selectedSection.grade_level} - ${selectedSection.section_name}` : ""}</dd></div>
        </dl>
      </ConfirmationModal>
    </div>
  );
}

export default DUser;
