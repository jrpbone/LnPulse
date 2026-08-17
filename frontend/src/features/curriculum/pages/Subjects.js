import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../shared/api/client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../core/auth/AuthContext";
import WorkspacePageHeader from "../../../shared/components/WorkspacePageHeader";
import { useConfirmation } from "../../../shared/confirmation/ConfirmationContext";
import { FiBookOpen, FiCheck, FiChevronRight, FiPlus, FiX } from "react-icons/fi";

function Subjects() {
  const navigate = useNavigate();
  const { privileges } = useAuth();
  const confirmAction = useConfirmation();
  const [allStrands, setAllStrands] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedStrand, setSelectedStrand] = useState(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommonSubjects, setShowCommonSubjects] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterType, setFilterType] = useState('all'); // 'all', 'common', 'specialized'
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedType, setSelectedType] = useState('core');
  const [curriculum, setCurriculum] = useState({
    11: {
      '1st Semester': { core: [], specialized: [] },
      '2nd Semester': { core: [], specialized: [] }
    },
    12: {
      '1st Semester': { core: [], specialized: [] },
      '2nd Semester': { core: [], specialized: [] }
    }
  });

  // Fetch all strands once on component mount
  useEffect(() => {
    fetchAllStrands();
  }, []);

  // Fetch all strands (this will be done once)
  const fetchAllStrands = () => {
    const url = privileges?.departmentId 
      ? `/strands/byDepartment/${privileges.departmentId}`
      : "/strands";

    apiClient
      .get(url)
      .then((res) => {
        setAllStrands(res.data);
      })
      .catch((err) => {
        console.error("Error fetching strands:", err);
      });
  };

  // Fetch all subjects (core subjects)
  const fetchAllSubjects = () => {
    apiClient
      .get("/subjects")
      .then((res) => {
        setAllSubjects(res.data);
      })
      .catch((err) => {
        console.error("Error fetching subjects:", err);
      });
  };

  // Fetch curriculum for the selected strand
  const fetchCurriculum = async (strandId) => {
    try {
      const response = await apiClient.get(`/curriculum/byStrand/${strandId}`);
      if (response.data) {
        setCurriculum(response.data);
      }
    } catch (error) {
      console.error('Error fetching curriculum:', error);
    }
  };

  // Fetch common subjects
  const fetchCommonSubjects = () => {
    apiClient
      .get("/subjects/common")
      .then((res) => {
        setSubjects(res.data);
      })
      .catch((err) => {
        console.error("Error fetching common subjects:", err);
      });
  };

  // Fetch subjects for the selected strand
  const fetchSubjects = (strandId) => {
    apiClient
      .get(`/subjects/byStrand/${strandId}`)
      .then((res) => {
        setSubjects(res.data);
      })
      .catch((err) => {
        console.error("Error fetching subjects:", err);
      });
  };

  // Add subject modal validation schema
  const subjectSchema = Yup.object().shape({
    subject_name: Yup.string().required("Subject name is required"),
    subject_description: Yup.string().required("Subject description is required")
  });

  const handleDeleteSubject = async (subjectId) => {
    const confirmed = await confirmAction({ title: "Delete this subject?", message: "The subject will be permanently removed from the subject catalog.", confirmLabel: "Delete subject", variant: "danger" });
    if (confirmed) {
      apiClient
        .delete(`/subjects/${subjectId}`)
        .then(() => {
          selectedStrand ? fetchSubjects(selectedStrand) : fetchAllSubjects();
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        })
        .catch((err) => {
          console.error("Error deleting subject:", err);
        });
    }
  };

  // Handle subject selection
  const handleSubjectCheck = (subjectId) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Handle adding selected subjects
  const handleAddSelectedSubjects = async () => {
    try {
      for (const subjectId of selectedSubjects) {
        await apiClient.post('/curriculum/assign', {
          strand_id: selectedStrand,
          subject_id: subjectId,
          grade_level: selectedGradeLevel,
          semester: selectedSemester
        });
      }
      
      // Refresh the curriculum data
      await fetchCurriculum(selectedStrand);
      
      // Reset the modal state
      setShowSubjectModal(false);
      setSelectedSubjects([]);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error assigning subjects:', error);
      alert('Failed to assign subjects to curriculum. Please try again.');
    }
  };

  // Handle opening add subject modal
  const handleOpenAddModal = (gradeLevel, semester, type) => {
    setSelectedGradeLevel(gradeLevel);
    setSelectedSemester(semester);
    setSelectedType(type);
    setSelectedSubjects([]);
    setShowSubjectModal(true);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingSubject(null);
  };

  // Sorting function
  const sortSubjects = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedSubjects = [...subjects].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setSubjects(sortedSubjects);
  };

  // Filter function
  const filterSubjects = (type) => {
    setFilterType(type);
    let filteredSubjects = [...allSubjects];

    // If common subjects are selected, show only common subjects regardless of strand
    if (type === 'common') {
      filteredSubjects = filteredSubjects.filter(subject => subject.is_common);
    } else {
      // For other types, apply strand filter if a strand is selected
      if (selectedStrand) {
        if (type === 'specialized') {
          // For specialized subjects, only show subjects for the selected strand
          filteredSubjects = filteredSubjects.filter(subject => 
            subject.strand_id === selectedStrand && !subject.is_common
          );
        } else {
          // For 'all', show both common subjects and strand-specific subjects for the selected strand
          filteredSubjects = filteredSubjects.filter(subject => 
            subject.strand_id === selectedStrand || subject.is_common
          );
        }
      } else {
        // If no strand is selected, filter only by type
        if (type === 'specialized') {
          filteredSubjects = filteredSubjects.filter(subject => !subject.is_common);
        }
      }
    }

    setSubjects(filteredSubjects);
  };

  // Update subjects when strand selection changes
  useEffect(() => {
    if (selectedStrand) {
      filterSubjects(filterType);
    } else {
      filterSubjects(filterType);
    }
  }, [selectedStrand]);

  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    }
    return '';
  };

  // Get strand name by ID
  const getStrandName = (strandId) => {
    const strand = allStrands.find(s => s.strand_id === strandId);
    return strand ? strand.strand_name : 'Unknown Strand';
  };

  // Add function to handle curriculum navigation
  const handleCurriculumClick = (strandId, strandName) => {
    navigate(`/curriculum/${strandId}`, { state: { strandName } });
  };

  // Handle adding new subject
  const handleAddSubject = async (values, { resetForm }) => {
    try {
      await apiClient.post('/curriculum/assign', {
        strand_id: selectedStrand,
        subject_name: values.subject_name,
        subject_description: values.subject_description,
        grade_level: selectedGradeLevel,
        semester: selectedSemester,
        type: selectedType
      });
      
      // Refresh the curriculum data
      await fetchCurriculum(selectedStrand);
      
      // Reset the modal state
      setShowSubjectModal(false);
      resetForm();
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data.error);
      } else {
        console.error('Error adding subject:', error);
        alert('Failed to add subject. Please try again.');
      }
    }
  };

  // Handle subject deletion
  const handleDeleteSubjectCurriculum = async (curriculumId) => {
    const confirmed = await confirmAction({ title: "Remove this curriculum subject?", message: "The subject will be removed from the selected strand and academic period.", confirmLabel: "Remove subject", variant: "danger" });
    if (confirmed) {
      try {
        await apiClient.delete(`/curriculum/${curriculumId}`);
        await fetchCurriculum(selectedStrand);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } catch (err) {
        console.error("Error deleting subject:", err);
        alert("Failed to delete subject. Please try again.");
      }
    }
  };

  return (
    <div className="strand_panel workspace-page curriculum-workspace">
      {showSuccessMessage && (
        <div className="success-message">
          Operation completed successfully!
        </div>
      )}
      
      <WorkspacePageHeader
        eyebrow="Academic planning"
        title="Curriculum"
        count={allStrands.length}
        description="Select a strand to review and manage its subject curriculum."
      />

      {/* Display all strands */}
      <div className="listOfStrands">
        {allStrands.length === 0 ? (
          <div className="collection-empty curriculum-empty"><FiBookOpen /><strong>No strands available</strong><span>Add strands to a department before building its curriculum.</span></div>
        ) : (
          allStrands.map((strand) => (
            <article
              key={strand.strand_id}
              className={`strand curriculum-strand-instance ${selectedStrand === strand.strand_id ? 'active' : ''}`}
              onClick={() => {
                setSelectedStrand(strand.strand_id);
                fetchCurriculum(strand.strand_id);
              }}
            >
              <div className="curriculum-strand-icon"><FiBookOpen /></div>
              <div className="strand-content">
                <h3 className="strandName">{strand.strand_name}</h3>
                <p className="strandDescription">{strand.strand_description}</p>
              </div>
              <span className="curriculum-strand-arrow">{selectedStrand === strand.strand_id ? <FiCheck /> : <FiChevronRight />}</span>
            </article>
          ))
        )}
      </div>

      {/* Display curriculum if a strand is selected */}
      {selectedStrand && (
        <div className="curriculum-page">
          <h3>{getStrandName(selectedStrand)} Curriculum</h3>
          
          <table className="curriculum-table">
            <thead>
              <tr>
                <th colSpan="2">Grade 11</th>
                <th colSpan="2">Grade 12</th>
              </tr>
              <tr>
                <th>1st Semester</th>
                <th>2nd Semester</th>
                <th>1st Semester</th>
                <th>2nd Semester</th>
              </tr>
            </thead>
            <tbody>
              {/* Core Subjects Section */}
              <tr>
                <td className="section-header" colSpan="4">Core Subjects</td>
              </tr>
              <tr>
                {Object.keys(curriculum).map(grade => 
                  Object.keys(curriculum[grade]).map(semester => (
                    <td key={`${grade}-${semester}`}>
                      {curriculum[grade][semester].core.length === 0 && (
                        <div className="subject-empty-slot">No core subjects yet</div>
                      )}
                      {curriculum[grade][semester].core.map((subject, subjectIndex) => (
                        <div key={subject.curriculum_id} className="subject-item">
                          <span className="subject-sequence">{String(subjectIndex + 1).padStart(2, '0')}</span>
                          <div>
                            <strong>{subject.subject_name}</strong>
                            <div className="subject-description">{subject.subject_description}</div>
                          </div>
                          <button 
                            className="remove-button"
                            onClick={() => handleDeleteSubjectCurriculum(subject.curriculum_id)}
                            title="Remove subject"
                            aria-label={`Remove ${subject.subject_name}`}
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                      <button 
                        className="add-button"
                        onClick={() => handleOpenAddModal(grade, semester, 'core')}
                      >
                        <FiPlus /> Add core subject
                      </button>
                    </td>
                  ))
                )}
              </tr>

              {/* Specialized Subjects Section */}
              <tr>
                <td className="section-header" colSpan="4">Specialized Subjects</td>
              </tr>
              <tr>
                {Object.keys(curriculum).map(grade => 
                  Object.keys(curriculum[grade]).map(semester => (
                    <td key={`${grade}-${semester}`}>
                      {curriculum[grade][semester].specialized.length === 0 && (
                        <div className="subject-empty-slot">No specialized subjects yet</div>
                      )}
                      {curriculum[grade][semester].specialized.map((subject, subjectIndex) => (
                        <div key={subject.curriculum_id} className="subject-item specialized-subject">
                          <span className="subject-sequence">{String(subjectIndex + 1).padStart(2, '0')}</span>
                          <div>
                            <strong>{subject.subject_name}</strong>
                            <div className="subject-description">{subject.subject_description}</div>
                          </div>
                          <button 
                            className="remove-button"
                            onClick={() => handleDeleteSubjectCurriculum(subject.curriculum_id)}
                            title="Remove subject"
                            aria-label={`Remove ${subject.subject_name}`}
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                      <button 
                        className="add-button"
                        onClick={() => handleOpenAddModal(grade, semester, 'specialized')}
                      >
                        <FiPlus /> Add specialized subject
                      </button>
                    </td>
                  ))
                )}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for adding subjects */}
      {showSubjectModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Add {getStrandName(selectedStrand)} {selectedType === 'core' ? 'Core' : 'Specialized'} Subject</h3>
            <h4>Grade {selectedGradeLevel} - {selectedSemester}</h4>
            
            <Formik
              initialValues={{
                subject_name: '',
                subject_description: ''
              }}
              validationSchema={subjectSchema}
              onSubmit={handleAddSubject}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="form-group">
                    <label>Subject Name:</label>
                    <Field name="subject_name" type="text" className="form-control" />
                    <ErrorMessage name="subject_name" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label>Subject Description:</label>
                    <Field name="subject_description" as="textarea" className="form-control" />
                    <ErrorMessage name="subject_description" component="div" className="error-message" />
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => setShowSubjectModal(false)}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="submit-button"
                    >
                      Add {selectedType === 'core' ? 'Core' : 'Specialized'} Subject
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSubject && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Edit Subject</h3>
            <Formik
              initialValues={{
                subject_name: editingSubject.subject_name,
                subject_description: editingSubject.subject_description,
                is_common: editingSubject.is_common,
              }}
              validationSchema={subjectSchema}
              onSubmit={(values, { resetForm }) => {
                apiClient
                  .put(
                    `/subjects/${editingSubject.subject_id}`,
                    {
                      ...values,
                      strand_id: selectedStrand,
                    }
                  )
                  .then(() => {
                    selectedStrand
                      ? fetchSubjects(selectedStrand)
                      : fetchAllSubjects();
                    resetForm();
                    handleCloseEditModal();
                  })
                  .catch((err) => {
                    console.error("Error updating subject:", err);
                  });
              }}
            >
              <Form>
                <div>
                  <label>Subject Name:</label>
                  <Field name="subject_name" type="text" />
                  <ErrorMessage
                    name="subject_name"
                    component="div"
                    style={styles.error}
                  />
                </div>

                <div>
                  <label>Subject Description:</label>
                  <Field name="subject_description" type="text" />
                  <ErrorMessage
                    name="subject_description"
                    component="div"
                    style={styles.error}
                  />
                </div>

                <div>
                  <label>
                    <Field name="is_common" type="checkbox" />
                    Common Subject (for all strands)
                  </label>
                </div>

                <button type="submit">Update</button>
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </Form>
            </Formik>
          </div>
        </div>
      )}

      {/* Add the styles */}
      <style jsx>{curriculumStyles}</style>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "white",
    padding: 20,
    borderRadius: 8,
    width: 400,
    maxHeight: "90vh",
    overflowY: "auto",
  },
  cancelButton: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#ccc",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
  },
  submitButton: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#2196f3",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "0.8em",
  },
  subjectControls: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  curriculumSection: undefined,
  gradeSection: undefined,
  semesterSection: undefined,
  curriculumTable: undefined,
  curriculumTableHeader: undefined,
  curriculumTableCell: undefined,
  addButton: undefined,
  removeButton: undefined,
};

// Add CSS styles for curriculum table
const curriculumStyles = `
  .curriculum-page {
    padding: 20px;
  }

  .curriculum-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }

  .curriculum-table th,
  .curriculum-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    vertical-align: top;
  }

  .section-header {
    background-color: #f5f5f5;
    font-weight: bold;
    text-align: center;
  }

  .subject-item {
    margin: 5px 0;
    padding: 8px;
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .subject-description {
    font-size: 0.9em;
    color: #666;
    margin-top: 4px;
  }

  .add-button {
    margin-top: 10px;
    padding: 8px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
  }

  .remove-button {
    background-color: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    margin-left: 8px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .form-control {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-top: 4px;
  }

  .error-message {
    color: #ff4444;
    font-size: 0.8em;
    margin-top: 4px;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }

  .cancel-button {
    padding: 8px 16px;
    background-color: #ddd;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .submit-button {
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .submit-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export default Subjects;
