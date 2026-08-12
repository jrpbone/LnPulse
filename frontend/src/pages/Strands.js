import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import ConfirmationModal from "../components/ConfirmationModal";
import WorkspacePageHeader from "../components/WorkspacePageHeader";
import { FiBookOpen, FiCheck, FiEdit3, FiEye, FiGrid, FiLayers, FiPlus, FiTrash2, FiUsers, FiX } from "react-icons/fi";

function StrandSections() {
  const { department_id } = useParams();
  const location = useLocation();
  const departmentName = location.state?.departmentName || "Department";
  const [, setStrandId] = useState(null);
  const [strands, setStrands] = useState([]);
  const [sections, setSections] = useState([]);
  const [strandSectionCounts, setStrandSectionCounts] = useState({});
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
      if (strandId) {
        setStrandSectionCounts((current) => ({ ...current, [strandId]: res.data.length }));
      } else {
        setStrandSectionCounts(res.data.reduce((counts, section) => {
          const strandIdKey = section.strand_id || section.STRAND_T?.strand_id;
          if (strandIdKey) counts[strandIdKey] = (counts[strandIdKey] || 0) + 1;
          return counts;
        }, {}));
      }
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

  const getStrandSectionCount = (strandId) => strandSectionCounts[strandId] || 0;

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
    <div className="container workspace-page strand-sections-page">
      {showSuccessMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      <WorkspacePageHeader
        eyebrow="Academic structure"
        title={`${departmentName} Strands`}
        count={strands.length}
        description="Select a strand to review its sections, student capacity, and academic assignments."
        actions={!privileges?.departmentId ? (
          <button type="button" className="workspace-primary-action" onClick={() => handleAddClick('strand')}><FiPlus /><span>New strand</span></button>
        ) : null}
      />

      <section className="strand-collection-panel">
        <div className="strand-collection-heading">
          <div><span>Department strands</span><p>Choose a strand to filter the sections below.</p></div>
          {selectedStrand && (
            <button type="button" className="strand-secondary-action" onClick={() => { setSelectedStrand(null); fetchSections(); }}><FiGrid /> Show all sections</button>
          )}
        </div>

        {strands.length === 0 ? (
          <div className="collection-empty strand-route-empty"><FiBookOpen /><strong>No strands in this department</strong><span>Create the first strand to start organizing sections.</span></div>
        ) : (
          <div className="strand-instance-grid">
            {strands.map((strand) => {
              const isSelected = selectedStrand === strand.strand_id;
              const sectionCount = getStrandSectionCount(strand.strand_id);
              return (
                <article
                  key={strand.strand_id}
                  className={`department-strand-instance ${isSelected ? 'selected' : ''}`}
                  onClick={() => { setSelectedStrand(strand.strand_id); fetchSections(strand.strand_id); }}
                  onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedStrand(strand.strand_id); fetchSections(strand.strand_id); } }}
                  role="button"
                  tabIndex="0"
                  aria-pressed={isSelected}
                >
                  <div className="department-strand-topline">
                    <span className="department-strand-icon"><FiBookOpen /></span>
                    {isSelected && <span className="selected-strand-badge"><FiCheck /> Selected</span>}
                    {!privileges?.departmentId && (
                      <div className="department-strand-actions">
                        <button type="button" className="instance-action edit" onClick={(event) => { event.stopPropagation(); handleEditStrand(strand); }} title="Edit strand" aria-label={`Edit ${strand.strand_name}`}><FiEdit3 /></button>
                        <button type="button" className="instance-action delete" onClick={(event) => { event.stopPropagation(); handleDeleteStrand(strand); }} title="Delete strand" aria-label={`Delete ${strand.strand_name}`}><FiTrash2 /></button>
                      </div>
                    )}
                  </div>
                  <div className="department-strand-copy">
                    <h3>{strand.strand_name}</h3>
                    <p>{strand.strand_description || 'No description provided for this strand.'}</p>
                  </div>
                  <footer className="department-strand-footer">
                    <span><FiLayers /><strong>{sectionCount}</strong> {sectionCount === 1 ? 'section' : 'sections'}</span>
                    <span className="strand-open-label">View sections <FiEye /></span>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="strand-sections-panel">
        <div className="collection-section-heading">
          <div className="collection-section-title"><span className="collection-section-icon adviser"><FiGrid /></span><div><h2>{selectedStrand ? `${strands.find(s => s.strand_id === selectedStrand)?.strand_name || ''} Sections` : 'All Sections'}</h2><p>{selectedStrand ? 'Showing sections assigned to the selected strand' : 'Showing every section in this department'}</p></div></div>
          <div className="strand-section-heading-actions">
            <span className="collection-count">{sections.length}</span>
            {selectedStrand && !privileges?.departmentId && <button type="button" className="strand-add-section" onClick={() => handleAddClick('section')}><FiPlus /> Add section</button>}
          </div>
        </div>

        {sections.length === 0 ? (
          <div className="collection-empty"><FiGrid /><strong>No sections available</strong><span>{selectedStrand ? 'Add a section to this strand to get started.' : 'Sections created for this department will appear here.'}</span></div>
        ) : (
          <div className="strand-section-table-wrap">
            <table className="data-table strand-section-table">
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
                    <td><span className="section-strand-name"><FiBookOpen />{section.STRAND_T?.strand_name || section.strand_name || "N/A"}</span></td>
                    <td><span className="grade-level-chip">Grade {section.grade_level}</span></td>
                    <td><div className="section-identity"><span className="section-avatar">{section.section_name?.charAt(0)?.toUpperCase() || 'S'}</span><span><strong>{section.section_name}</strong><small>Section #{section.section_id}</small></span></div></td>
                    <td><span className="section-student-count"><FiUsers /><strong>{section.number_students ?? 0}</strong> students</span></td>
                    <td>
                      <div className="instance-actions">
                        <button type="button" className="instance-action view" onClick={() => navigate(`/section/${section.section_id}/students`)} title="View students" aria-label={`View students in ${section.section_name}`}><FiEye /></button>
                        <button type="button" className="instance-action edit" onClick={() => handleEdit(section)} title="Edit section" aria-label={`Edit ${section.section_name}`}><FiEdit3 /></button>
                        <button type="button" className="instance-action delete" onClick={() => handleDelete(section)} title="Delete section" aria-label={`Delete ${section.section_name}`}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

        {renderModal()}

        {showStrandEditModal && strandToEdit && (
          <div className="modal-overlay entity-edit-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-strand-title">
            <div className="modal-content entity-edit-modal">
              <header className="entity-edit-header">
                <div className="entity-edit-icon strand"><FiBookOpen /></div>
                <div><p>Curriculum structure</p><h3 id="edit-strand-title">Edit strand</h3><span>Refine the strand name and description shown in this department.</span></div>
                <button type="button" className="entity-edit-close" onClick={() => { setShowStrandEditModal(false); setStrandToEdit(null); }} aria-label="Close edit strand dialog"><FiX /></button>
              </header>
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
                <Form className="entity-edit-form">
                  <div className="form-group">
                    <label htmlFor="edit-strand-name">Strand name <span>*</span></label>
                    <Field id="edit-strand-name" name="strand_name" type="text" className="form-input" autoFocus />
                    <ErrorMessage name="strand_name" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-strand-description">Description <span>*</span></label>
                    <Field id="edit-strand-description" name="strand_description" as="textarea" className="form-input entity-description-input" />
                    <ErrorMessage name="strand_description" component="div" className="error-message" />
                  </div>

                  <div className="entity-edit-note"><FiLayers /><span>Section assignments remain unchanged when strand details are updated.</span></div>
                  <div className="button-group entity-edit-actions">
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
                    <button type="submit" className="save-button"><FiEdit3 /> Save changes</button>
                  </div>
                </Form>
              </Formik>
            </div>
          </div>
        )}

        {showEditModal && sectionToEdit && (
          <div className="modal-overlay entity-edit-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-section-title">
            <div className="modal-content entity-edit-modal">
              <header className="entity-edit-header">
                <div className="entity-edit-icon section"><FiGrid /></div>
                <div><p>Class organization</p><h3 id="edit-section-title">Edit section</h3><span>Update the section label and grade-level assignment.</span></div>
                <button type="button" className="entity-edit-close" onClick={() => { setShowEditModal(false); setSectionToEdit(null); }} aria-label="Close edit section dialog"><FiX /></button>
              </header>
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
                <Form className="entity-edit-form">
                  <div className="entity-edit-grid">
                  <div className="form-group">
                    <label htmlFor="edit-section-grade">Grade level <span>*</span></label>
                    <Field id="edit-section-grade" name="grade_level" as="select" className="form-input">
                      <option value="" disabled hidden>-- Select Grade Level --</option>
                      <option value="11">Grade 11</option>
                      <option value="12">Grade 12</option>
                    </Field>
                    <ErrorMessage name="grade_level" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-section-name">Section name <span>*</span></label>
                    <Field id="edit-section-name" name="section_name" type="text" className="form-input" autoFocus />
                    <ErrorMessage name="section_name" component="div" className="error-message" />
                  </div>
                  </div>

                  <div className="entity-edit-note"><FiUsers /><span>Students and existing academic records remain assigned to this section.</span></div>
                  <div className="button-group entity-edit-actions">
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
                    <button type="submit" className="save-button"><FiEdit3 /> Save changes</button>
                  </div>
                </Form>
              </Formik>
            </div>
          </div>
        )}

        <ConfirmationModal isOpen={showDeleteModal && Boolean(sectionToDelete)} title="Delete this section?" message="Learners and records associated with this section may be affected." confirmLabel="Delete section" variant="danger" onConfirm={confirmDelete} onCancel={() => { setShowDeleteModal(false); setSectionToDelete(null); }}>
          <dl className="confirmation-details-list"><div className="confirmation-detail"><dt>Section</dt><dd>{sectionToDelete?.section_name}</dd></div></dl>
          <p className="confirmation-warning">This action cannot be undone.</p>
        </ConfirmationModal>

        <ConfirmationModal isOpen={showStrandDeleteModal && Boolean(strandToDelete)} title="Delete this strand?" message="The strand and every section associated with it will be permanently removed." confirmLabel="Delete strand" variant="danger" onConfirm={confirmStrandDelete} onCancel={() => { setShowStrandDeleteModal(false); setStrandToDelete(null); }}>
          <dl className="confirmation-details-list"><div className="confirmation-detail"><dt>Strand</dt><dd>{strandToDelete?.strand_name}</dd></div></dl>
          <p className="confirmation-warning">All associated sections will also be deleted. This cannot be undone.</p>
        </ConfirmationModal>

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
  );
}

export default StrandSections;
