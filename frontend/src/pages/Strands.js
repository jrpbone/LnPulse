import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";

function StrandSections() {
  const { department_id } = useParams();
  const location = useLocation();
  const departmentName = location.state?.departmentName || "Department";
  const [, setStrandId] = useState(null);
  const [strands, setStrands] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedStrand, setSelectedStrand] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [strandToEdit, setStrandToEdit] = useState(null);
  const [sectionToEdit, setSectionToEdit] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [showStrandEditModal, setShowStrandEditModal] = useState(false);
  const [showStrandDeleteModal, setShowStrandDeleteModal] = useState(false);
  const [strandToDelete, setStrandToDelete] = useState(null);
  const [showAddStrandModal, setShowAddStrandModal] = useState(false);
  const navigate = useNavigate();
  const { privileges } = useAuth();

  // Check if user has access to this department
  useEffect(() => {
    if (privileges?.departmentId && privileges.departmentId.toString() !== department_id.toString()) {
      navigate('/unauthorized');
    }
  }, [department_id, privileges?.departmentId, navigate]);

  const fetchStrands = useCallback(() => {
    axios
      .get(`http://localhost:3001/strands/byDepartment/${department_id}`)
      .then((res) => {
        setStrands(res.data);
        if (res.data.length > 0) {
          setStrandId(res.data[0].strand_id);
        }
      });
  }, [department_id]);

  const fetchSections = useCallback((strandId = null) => {
    const url = strandId
      ? `http://localhost:3001/sections/byStrand/${strandId}`
      : `http://localhost:3001/sections/byDepartment/${department_id}`;

    axios.get(url).then((res) => {
      setSections(res.data);
    });
  }, [department_id]);

  useEffect(() => {
    fetchStrands();
    fetchSections();
  }, [fetchStrands, fetchSections]);

  const strandSchema = Yup.object().shape({
    strand_name: Yup.string().required("Strand name is required"),
    strand_description: Yup.string().required("Strand description is required"),
  });

  const sectionSchema = Yup.object().shape({
    section_name: Yup.string().required("Section name is required"),
    grade_level: Yup.string().required("Grade level is required"),
  });

  const handleAddClick = (type) => {
    if (type === 'strand') {
      setShowAddStrandModal(true);
    } else if (type === 'section' && selectedStrand) {
      setShowAddModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const handleEdit = (section) => {
    setSectionToEdit(section);
    setShowEditModal(true);
  };

  const handleDelete = (section) => {
    setSectionToDelete(section);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/sections/${sectionToDelete.section_id}`);
      fetchSections(selectedStrand);
      setShowDeleteModal(false);
      setSectionToDelete(null);
      setSuccessMessage("Section successfully deleted!");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 2000);
    } catch (error) {
      console.error("Error deleting section:", error);
    }
  };

  const handleEditStrand = (strand) => {
    setStrandToEdit(strand);
    setShowStrandEditModal(true);
  };

  const handleDeleteStrand = (strand) => {
    setStrandToDelete(strand);
    setShowStrandDeleteModal(true);
  };

  const confirmStrandDelete = async () => {
    try {
      // First, get all sections for this strand
      const sectionsResponse = await axios.get(`http://localhost:3001/sections/byStrand/${strandToDelete.strand_id}`);
      const sections = sectionsResponse.data;

      // Delete all sections associated with this strand
      for (const section of sections) {
        await axios.delete(`http://localhost:3001/sections/${section.section_id}`);
      }

      // After all sections are deleted, delete the strand
      await axios.delete(`http://localhost:3001/strands/${strandToDelete.strand_id}`);
      
      // Update the UI
      fetchStrands();
      setShowStrandDeleteModal(false);
      setStrandToDelete(null);
      setSuccessMessage("Strand and its sections successfully deleted!");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 2000);

      // Reset selected strand and show all sections
      setSelectedStrand(null);
      fetchSections();
    } catch (error) {
      console.error("Error deleting strand and its sections:", error);
    }
  };

  const renderModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>{showAddStrandModal ? 'Add New Strand' : 'Add New Section'}</h3>
          {showAddStrandModal ? (
            <Formik
              initialValues={{
                strand_name: "",
                strand_description: "",
              }}
              validationSchema={strandSchema}
              onSubmit={(values, { resetForm }) => {
                axios
                  .post("http://localhost:3001/strands", {
                    ...values,
                    department_id: department_id,
                  })
                  .then(() => {
                    fetchStrands();
                    resetForm();
                    handleCloseModal();
                    setSuccessMessage("Strand successfully added!");
                    setShowSuccessMessage(true);
                    setTimeout(() => setShowSuccessMessage(false), 2000);
                  });
              }}
            >
              <Form>
                <div className="form-group">
                  <label>Strand Name:</label>
                  <Field name="strand_name" type="text" className="form-input" />
                  <ErrorMessage name="strand_name" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label>Strand Description:</label>
                  <Field name="strand_description" type="text" className="form-input" />
                  <ErrorMessage name="strand_description" component="div" className="error-message" />
                </div>

                <div className="button-group">
                  <button type="submit" className="save-button">Save</button>
                  <button type="button" onClick={handleCloseModal} className="cancel-button">
                    Cancel
                  </button>
                </div>
              </Form>
            </Formik>
          ) : (
            <Formik
              initialValues={{
                section_name: "",
                grade_level: "",
              }}
              validationSchema={sectionSchema}
              onSubmit={(values, { resetForm }) => {
                axios
                  .post("http://localhost:3001/sections", {
                    ...values,
                    strand_id: selectedStrand,
                  })
                  .then(() => {
                    fetchSections(selectedStrand);
                    resetForm();
                    handleCloseModal();
                    setSuccessMessage("Section successfully added!");
                    setShowSuccessMessage(true);
                    setTimeout(() => setShowSuccessMessage(false), 2000);
                  })
                  .catch((err) => {
                    console.error("Error adding section:", err);
                  });
              }}
            >
              <Form>
                <div className="form-group">
                  <label>Grade Level:</label>
                  <Field name="grade_level" as="select" className="form-input">
                    <option value="" disabled hidden>-- Select Grade Level --</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                  </Field>
                  <ErrorMessage name="grade_level" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label>Section Name:</label>
                  <Field name="section_name" type="text" className="form-input" />
                  <ErrorMessage name="section_name" component="div" className="error-message" />
                </div>

                <div className="button-group">
                  <button type="submit" className="save-button">Save</button>
                  <button type="button" onClick={handleCloseModal} className="cancel-button">
                    Cancel
                  </button>
                </div>
              </Form>
            </Formik>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="create_main">
      {showSuccessMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      <div className="createStudentPage">
        <h2>{departmentName} Strands</h2>
        {!privileges?.departmentId && (
          <div className="button-container">
            <button className="add-button" onClick={() => handleAddClick('strand')}>+ Add Strand</button>
            <button 
              className="show-all-button"
              onClick={() => {
                setSelectedStrand(null);
                fetchSections();
              }}
            >
              Show All Sections
            </button>
          </div>
        )}

        {strands.length === 0 ? (
          <p>No strands found for this department.</p>
        ) : (
          <ul className="strand-list">
            {strands.map((strand) => (
              <li
                key={strand.strand_id}
                className={`strand-item ${selectedStrand === strand.strand_id ? 'selected' : ''}`}
              >
                <div className="strand-content" onClick={() => {
                  setSelectedStrand(strand.strand_id);
                  fetchSections(strand.strand_id);
                }}>
                  <strong>{strand.strand_name}</strong> — {strand.strand_description}
                </div>
                {!privileges?.departmentId && (
                  <div className="strand-actions">
                    <button 
                      className="edit-button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStrand(strand);
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStrand(strand);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <h2>
          {selectedStrand 
            ? `${strands.find(s => s.strand_id === selectedStrand)?.strand_name || ''} Sections`
            : 'All Sections'
          }
        </h2>

        {selectedStrand && !privileges?.departmentId && (
          <div className="button-container">
            <button 
              className="add-button" 
              onClick={() => handleAddClick('section')}
            >
              + Add Section
            </button>
          </div>
        )}

        {sections.length === 0 ? (
          <p>No sections available.</p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Strand</th>
                  <th>Grade Level</th>
                  <th>Section Name</th>
                  <th>Number of Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <tr key={section.section_id}>
                    <td>{section.STRAND_T?.strand_name || section.strand_name || "N/A"}</td>
                    <td>{section.grade_level}</td>
                    <td>{section.section_name}</td>
                    <td>{section.number_students ?? 0}</td>
                    <td>
                      <div className="dropdown">
                        <button className="dropdown-button">Actions ▼</button>
                      </div>
                      <div className="dropdown-content">
                        <button 
                          className="dropdown-item"
                          onClick={() => handleEdit(section)}
                        >
                          Edit
                        </button>
                        <button 
                          className="dropdown-item"
                          onClick={() => handleDelete(section)}
                        >
                          Delete
                        </button>
                        <button 
                          className="dropdown-item"
                          onClick={() => navigate(`/section/${section.section_id}/students`)}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {renderModal()}

        {showStrandEditModal && strandToEdit && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Edit Strand</h3>
              <Formik
                initialValues={{
                  strand_name: strandToEdit.strand_name || "",
                  strand_description: strandToEdit.strand_description || "",
                }}
                enableReinitialize
                validationSchema={strandSchema}
                onSubmit={(values, { resetForm }) => {
                  axios
                    .put(`http://localhost:3001/strands/${strandToEdit.strand_id}`, {
                      strand_name: values.strand_name,
                      strand_description: values.strand_description,
                      department_id: department_id,
                    })
                    .then((response) => {
                      fetchStrands();
                      resetForm();
                      setShowStrandEditModal(false);
                      setStrandToEdit(null);
                      setSuccessMessage("Strand successfully updated!");
                      setShowSuccessMessage(true);
                      setTimeout(() => setShowSuccessMessage(false), 2000);
                    })
                    .catch((err) => {
                      console.error("Error updating strand:", err);
                    });
                }}
              >
                <Form>
                  <div className="form-group">
                    <label>Strand Name:</label>
                    <Field name="strand_name" type="text" className="form-input" />
                    <ErrorMessage name="strand_name" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label>Strand Description:</label>
                    <Field name="strand_description" type="text" className="form-input" />
                    <ErrorMessage name="strand_description" component="div" className="error-message" />
                  </div>

                  <div className="button-group">
                    <button type="submit" className="save-button">Update</button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => {
                        setShowStrandEditModal(false);
                        setStrandToEdit(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              </Formik>
            </div>
          </div>
        )}

        {showEditModal && sectionToEdit && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Edit Section</h3>
              <Formik
                initialValues={{
                  section_name: sectionToEdit.section_name || "",
                  grade_level: sectionToEdit.grade_level || "",
                }}
                enableReinitialize
                validationSchema={sectionSchema}
                onSubmit={(values, { resetForm }) => {
                  axios
                    .put(`http://localhost:3001/sections/${sectionToEdit.section_id}`, {
                      ...values,
                      strand_id: sectionToEdit.strand_id,
                    })
                    .then(() => {
                      fetchSections(selectedStrand);
                      resetForm();
                      setShowEditModal(false);
                      setSectionToEdit(null);
                      setSuccessMessage("Section successfully updated!");
                      setShowSuccessMessage(true);
                      setTimeout(() => setShowSuccessMessage(false), 2000);
                    })
                    .catch((err) => {
                      console.error("Error updating section:", err);
                    });
                }}
              >
                <Form>
                  <div className="form-group">
                    <label>Grade Level:</label>
                    <Field name="grade_level" as="select" className="form-input">
                      <option value="" disabled hidden>-- Select Grade Level --</option>
                      <option value="11">11</option>
                      <option value="12">12</option>
                    </Field>
                    <ErrorMessage name="grade_level" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label>Section Name:</label>
                    <Field name="section_name" type="text" className="form-input" />
                    <ErrorMessage name="section_name" component="div" className="error-message" />
                  </div>

                  <div className="button-group">
                    <button type="submit" className="save-button">Update</button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSectionToEdit(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              </Formik>
            </div>
          </div>
        )}

        {showDeleteModal && sectionToDelete && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete section {sectionToDelete.section_name}?</p>
              <div className="button-group">
                <button 
                  className="delete-button" 
                  onClick={confirmDelete}
                >
                  Delete
                </button>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSectionToDelete(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showStrandDeleteModal && strandToDelete && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete strand {strandToDelete.strand_name}? <br /> This will also delete all associated sections.</p>
              <div className="button-group">
                <button 
                  className="delete-button" 
                  onClick={confirmStrandDelete}
                >
                  Delete
                </button>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setShowStrandDeleteModal(false);
                    setStrandToDelete(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddStrandModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Add New Strand</h3>
              <Formik
                initialValues={{
                  strand_name: "",
                  strand_description: "",
                }}
                validationSchema={strandSchema}
                onSubmit={(values, { resetForm }) => {
                  axios
                    .post("http://localhost:3001/strands", {
                      ...values,
                      department_id: department_id,
                    })
                    .then(() => {
                      fetchStrands();
                      resetForm();
                      setShowAddStrandModal(false);
                      setSuccessMessage("Strand successfully added!");
                      setShowSuccessMessage(true);
                      setTimeout(() => setShowSuccessMessage(false), 2000);
                    })
                    .catch((err) => {
                      console.error("Error adding strand:", err);
                    });
                }}
              >
                <Form>
                  <div className="form-group">
                    <label>Strand Name:</label>
                    <Field name="strand_name" type="text" className="form-input" />
                    <ErrorMessage name="strand_name" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label>Strand Description:</label>
                    <Field name="strand_description" type="text" className="form-input" />
                    <ErrorMessage name="strand_description" component="div" className="error-message" />
                  </div>

                  <div className="button-group">
                    <button type="submit" className="save-button">Save</button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => {
                        setShowAddStrandModal(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              </Formik>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StrandSections;