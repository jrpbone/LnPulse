import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import './styles.css';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Breadcrumbs from '../components/Breadcrumbs';

function SectionStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionName, setSectionName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const { user, privileges } = useAuth();
  const { sectionId } = useParams();
  const [showAcadModal, setShowAcadModal] = useState(false);
  const [selectedAcadInfo, setSelectedAcadInfo] = useState(null);
  const [academicSettings, setAcademicSettings] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [strands, setStrands] = useState([]);
  const [sections, setSections] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const targetSectionId = sectionId || privileges.sectionId;
      
      if (!targetSectionId) {
        setError('No section ID provided');
        setLoading(false);
        return;
      }

      // Get students for the section
      const studentsResponse = await axios.get(`http://localhost:3001/students/section/${targetSectionId}`);
      
      // Get latest academic info for each student
      const studentsWithLatestInfo = await Promise.all(
        studentsResponse.data.map(async (student) => {
          try {
            const academicInfoResponse = await axios.get(`http://localhost:3001/academicInfo/byStudent/${student.student_id}`);
            // Get the latest academic info (last in the array)
            const latestAcademicInfo = academicInfoResponse.data[academicInfoResponse.data.length - 1];
            return {
              ...student,
              ACADEMIC_INFO_Ts: [latestAcademicInfo]
            };
          } catch (err) {
            console.error(`Error fetching academic info for student ${student.student_id}:`, err);
            return student;
          }
        })
      );
      
      setStudents(studentsWithLatestInfo);

      // Try to get section name and grade level from the first student's academic info if available
      if (studentsWithLatestInfo.length > 0 && studentsWithLatestInfo[0].ACADEMIC_INFO_Ts?.[0]?.SECTION_T) {
        const academicInfo = studentsWithLatestInfo[0].ACADEMIC_INFO_Ts[0].SECTION_T;
        setSectionName(academicInfo.section_name);
        setGradeLevel(academicInfo.grade_level);
      } else {
        // Fallback to fetching section directly
        try {
          const sectionResponse = await axios.get(`http://localhost:3001/sections/${targetSectionId}`);
          setSectionName(sectionResponse.data.section_name);
          setGradeLevel(sectionResponse.data.grade_level);
        } catch (sectionErr) {
          console.error('Error fetching section name:', sectionErr);
        }
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [sectionId, privileges.sectionId]);

  useEffect(() => {
    const fetchAcademicSettings = async () => {
      try {
        const settingsResponse = await axios.get("http://localhost:3001/academicSettings/current");
        setAcademicSettings(settingsResponse.data);
      } catch (error) {
        console.error("Error fetching academic settings:", error);
      }
    };

    fetchAcademicSettings();
  }, []);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [strandsRes, sectionsRes, departmentsRes] = await Promise.all([
          axios.get("http://localhost:3001/strands"),
          axios.get("http://localhost:3001/sections"),
          axios.get("http://localhost:3001/departments")
        ]);
        setStrands(strandsRes.data);
        setSections(sectionsRes.data);
        setDepartments(departmentsRes.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, []);

  const getFilteredSections = (gradeLevel, departmentId, strandId) => {
    if (!gradeLevel || !departmentId || !strandId) return [];
    
    return sections.filter(section => {
      const sectionGradeLevel = parseInt(section.grade_level);
      const selectedGradeLevel = parseInt(gradeLevel);
      const selectedStrandId = parseInt(strandId);
      
      return section.strand_id === selectedStrandId && 
             sectionGradeLevel === selectedGradeLevel;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Only select students with "Completed" exit status
      const completedStudents = students
        .filter(student => student.ACADEMIC_INFO_Ts?.[0]?.exitStatus === "Completed")
        .map(student => student.student_id);
      setSelectedStudents(completedStudents);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    const student = students.find(s => s.student_id === studentId);
    // Only allow selection if exit status is "Completed"
    if (student?.ACADEMIC_INFO_Ts?.[0]?.exitStatus === "Completed") {
      setSelectedStudents(prev => {
        if (prev.includes(studentId)) {
          return prev.filter(id => id !== studentId);
        } else {
          return [...prev, studentId];
        }
      });
    }
  };

  const handleSave = () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    // Get the first selected student's latest academic info
    const firstSelectedStudent = students.find(student => student.student_id === selectedStudents[0]);
    const latestAcademicInfo = firstSelectedStudent?.ACADEMIC_INFO_Ts?.[0];

    if (latestAcademicInfo) {
      setSelectedAcadInfo({
        gradeLevel: latestAcademicInfo.gradeLevel,
        schoolYear: academicSettings?.current_school_year || latestAcademicInfo.schoolYear, // Use current school year from settings
        semester: academicSettings?.current_semester || latestAcademicInfo.semester, // Use current semester from settings
        entryStatus: latestAcademicInfo.entryStatus,
        strand_id: latestAcademicInfo.strand_id?.toString() || latestAcademicInfo.STRAND_T?.strand_id?.toString(),
        section_id: latestAcademicInfo.section_id?.toString() || latestAcademicInfo.SECTION_T?.section_id?.toString(),
        department_id: latestAcademicInfo.department_id?.toString() || latestAcademicInfo.DEPARTMENT_T?.department_id?.toString(),
      });
    }

    setShowAcadModal(true);
  };

  const handleCloseAcadModal = () => {
    setShowAcadModal(false);
    setSelectedAcadInfo(null);
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
  };

  // Validation schema for academic info form
  const academicInfoSchema = Yup.object().shape({
    gradeLevel: Yup.string().required("Grade level is required"),
    schoolYear: Yup.string().required("School year is required"),
    semester: Yup.string().required("Semester is required"),
    entryStatus: Yup.string().required("Entry status is required"),
    strand_id: Yup.string().required("Strand is required"),
    section_id: Yup.string().required("Section is required"),
    department_id: Yup.string().required("Department is required"),
  });

  const handleAcadModalSubmit = async (values) => {
    // Check if any selected student already has an academic record for this school year and semester
    const hasDuplicateRecord = selectedStudents.some(studentId => {
      const student = students.find(s => s.student_id === studentId);
      return student?.ACADEMIC_INFO_Ts?.some(info => 
        info.schoolYear === values.schoolYear && 
        info.semester === values.semester
      );
    });

    if (hasDuplicateRecord) {
      setErrorMessage("One or more selected students already have an academic record for this school year and semester.");
      setShowErrorModal(true);
      setShowAcadModal(false);
      return;
    }

    try {
      // Apply the academic info to all selected students
      const promises = selectedStudents.map(async (studentId) => {
        const academicInfoData = {
          student_id: studentId,
          gradeLevel: values.gradeLevel,
          schoolYear: values.schoolYear,
          semester: values.semester,
          entryStatus: values.entryStatus,
          strand_id: parseInt(values.strand_id),
          section_id: parseInt(values.section_id),
          department_id: parseInt(values.department_id),
          exitStatus: "Pending" // Default exit status for new academic records
        };

        // Create academic info record
        const academicResponse = await axios.post("http://localhost:3001/academicInfo", academicInfoData);
        
        // Create academic performance record
        const academicPerformanceData = {
          acads_id: academicResponse.data.acads_id,
          gpa: null,
          honors: null
        };

        await axios.post("http://localhost:3001/academicPerformance", academicPerformanceData);
      });

      await Promise.all(promises);
      
      // Refresh the data to show updated records
      await fetchData();
      
      // Reset the form and close modal
      setShowAcadModal(false);
      setShowCheckboxes(false);
      setSelectedStudents([]);
      
      // Show success message
      setSuccessMessage(`${selectedStudents.length} student(s) promoted successfully!`);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error("Error promoting students:", error);
      setErrorMessage("Failed to promote students. Please try again.");
      setShowErrorModal(true);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="container">
      <Breadcrumbs />
      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ border: '2px solid #dc3545' }}>
            <div className="modal-header" style={{ backgroundColor: '#dc3545', color: 'white' }}>
              <h3>Error</h3>
            </div>
            <div className="modal-body">
              <p style={{ color: '#dc3545' }}>{errorMessage}</p>
            </div>
            <div className="modal-footer">
              <button
                className="modal-button"
                onClick={handleCloseErrorModal}
                style={{ 
                  backgroundColor: '#dc3545',
                  borderColor: '#dc3545',
                  color: 'white'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ border: '2px solid #28a745' }}>
            <div className="modal-header" style={{ backgroundColor: '#28a745', color: 'white' }}>
              <h3>Success</h3>
            </div>
            <div className="modal-body">
              <p style={{ color: '#28a745' }}>{successMessage}</p>
            </div>
            <div className="modal-footer">
              <button
                className="modal-button"
                onClick={handleCloseSuccessModal}
                style={{ 
                  backgroundColor: '#28a745',
                  borderColor: '#28a745',
                  color: 'white'
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      <h1>{sectionName ? `${students[0]?.ACADEMIC_INFO_Ts?.[0]?.gradeLevel || ''} -  ${sectionName} Students` : 'Section Students'}</h1>
      <div style={{ marginBottom: '20px' }}>
        {!privileges?.sectionId && (
          <button 
            onClick={() => setShowCheckboxes(!showCheckboxes)}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
          >
            Promote Students
          </button>
        )}
        {showCheckboxes && (
          <>
            <button
              onClick={handleSave}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                marginLeft: '10px'
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={e => e.target.style.backgroundColor = '#007bff'}
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowCheckboxes(false);
                setSelectedStudents([]);
              }}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                marginLeft: '10px'
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#c82333'}
              onMouseOut={e => e.target.style.backgroundColor = '#dc3545'}
            >
              Cancel
            </button>
          </>
        )}
      </div>
      {showAcadModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '600px', maxWidth: '95%' }}>
            <div className="modal-header">
              <h3>Add Academic Info</h3>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <Formik
                enableReinitialize
                initialValues={{
                  gradeLevel: selectedAcadInfo?.gradeLevel || '',
                  schoolYear: selectedAcadInfo?.schoolYear || academicSettings?.current_school_year || '',
                  semester: selectedAcadInfo?.semester || academicSettings?.current_semester || '',
                  entryStatus: selectedAcadInfo?.entryStatus || '',
                  strand_id: selectedAcadInfo?.strand_id || '',
                  section_id: selectedAcadInfo?.section_id || '',
                  department_id: selectedAcadInfo?.department_id || '',
                }}
                validationSchema={academicInfoSchema}
                onSubmit={handleAcadModalSubmit}
              >
                {(formik) => (
                  <Form>
                    <div className="form-group">
                      <label className="label">Grade Level:</label>
                      <Field 
                        as="select" 
                        name="gradeLevel" 
                        className="form-control"
                      >
                        <option value="">Select</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                      </Field>
                      <ErrorMessage name="gradeLevel" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label className="label">Department:</label>
                      <Field 
                        as="select" 
                        name="department_id" 
                        className="form-control"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option
                            key={dept.department_id}
                            value={dept.department_id.toString()}
                          >
                            {dept.department_name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="department_id" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label className="label">Strand:</label>
                      <Field 
                        as="select" 
                        name="strand_id" 
                        className="form-control"
                      >
                        <option value="">Select Strand</option>
                        {strands
                          .filter(strand => !formik.values.department_id || strand.department_id === parseInt(formik.values.department_id))
                          .map((strand) => (
                            <option
                              key={strand.strand_id}
                              value={strand.strand_id.toString()}
                            >
                              {strand.strand_name}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage name="strand_id" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label className="label">Section:</label>
                      <Field 
                        as="select" 
                        name="section_id" 
                        className="form-control"
                      >
                        <option value="">Select Section</option>
                        {getFilteredSections(
                          formik.values.gradeLevel,
                          formik.values.department_id,
                          formik.values.strand_id
                        ).map((section) => (
                          <option
                            key={section.section_id}
                            value={section.section_id.toString()}
                          >
                            {section.section_name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="section_id" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label className="label">School Year:</label>
                      <Field
                        type="text"
                        name="schoolYear"
                        className="form-control"
                        disabled={true}
                      />
                      <ErrorMessage name="schoolYear" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label className="label">Semester:</label>
                      <Field 
                        type="text"
                        name="semester" 
                        className="form-control"
                        disabled={true}
                      />
                      <ErrorMessage name="semester" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label className="label">Entry Status:</label>
                      <Field 
                        as="select" 
                        name="entryStatus" 
                        className="form-control"
                      >
                        <option value="">Select</option>
                        <option value="New Enrollee">New Enrollee</option>
                        <option value="Regular">Regular</option>
                        <option value="Irregular">Irregular</option>
                        <option value="Transferee">Transferee</option>
                        <option value="Returning">Returning</option>
                        <option value="Remedial">Remedial</option>
                      </Field>
                      <ErrorMessage name="entryStatus" component="div" className="error-message" />
                    </div>

                    <div className="modal-footer">
                      <button type="submit" className="modal-button">Save</button>
                      <button
                        type="button"
                        className="modal-button"
                        onClick={handleCloseAcadModal}
                        style={{ marginLeft: '10px', background: '#6c757d' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {showCheckboxes && (
                <th>
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === students.filter(student => 
                      student.ACADEMIC_INFO_Ts?.[0]?.exitStatus === "Completed"
                    ).length}
                    onChange={handleSelectAll}
                    style={{ width: '16px', height: '16px' }}
                  />
                </th>
              )}
              <th>Student ID</th>
              <th>Name</th>
              <th>Entry Status</th>
              <th>Exit Status</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.student_id}>
                {showCheckboxes && (
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.student_id)}
                      onChange={() => handleSelectStudent(student.student_id)}
                      disabled={student.ACADEMIC_INFO_Ts?.[0]?.exitStatus !== "Completed"}
                      style={{ 
                        width: '16px', 
                        height: '16px',
                        opacity: student.ACADEMIC_INFO_Ts?.[0]?.exitStatus === "Completed" ? 1 : 0.5
                      }}
                    />
                  </td>
                )}
                <td>{student.student_id}</td>
                <td>{`${student.first_name} ${student.middle_name} ${student.last_name}`}</td>
                <td>{student.ACADEMIC_INFO_Ts?.[0]?.entryStatus || 'N/A'}</td>
                <td>{student.ACADEMIC_INFO_Ts?.[0]?.exitStatus || 'N/A'}</td>
                <td style={{ 
                  color: !student.ACADEMIC_INFO_Ts?.[0]?.ACADEMIC_PERFORMANCE_Ts || student.ACADEMIC_INFO_Ts?.[0]?.ACADEMIC_PERFORMANCE_Ts.length === 0 ? "#dc3545" : "#333"
                }}>
                  {student.ACADEMIC_INFO_Ts?.[0]?.ACADEMIC_PERFORMANCE_Ts?.[0]?.remarks || 'Pending Grades'}
                </td>
                <td>
                  <button onClick={() => window.location.href = `/Student/${student.student_id}`}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          text-align: center;
          margin-bottom: 15px;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
        }

        .modal-body {
          margin-bottom: 20px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }

        .form-control {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .error-message {
          color: #dc3545;
          font-size: 12px;
          margin-top: 5px;
        }

        .modal-button {
          padding: 8px 16px;
          font-size: 16px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .modal-button:hover {
          background-color: #218838;
        }
      `}</style>
    </div>
  );
}

export default SectionStudents; 