import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from '../context/AuthContext';
import "./student.css";




function Student() {
  const { student_id } = useParams();
  const navigate = useNavigate();
  const { privileges } = useAuth();
  const [postObject, setPostObject] = useState({});
  const [showAcadModal, setShowAcadModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [academicInfo, setAcademicInfo] = useState([]);
  const [editingInfo, setEditingInfo] = useState(null);
  const [strands, setStrands] = useState([]);
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasAccess] = useState(true);
  const [academicPerformance, setAcademicPerformance] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [academicSettings, setAcademicSettings] = useState(null);




  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student data
        const studentResponse = await axios.get(`http://localhost:3001/students/byId/${student_id}`);
        setPostObject(studentResponse.data);




        // Fetch academic info
        const academicResponse = await axios.get(`http://localhost:3001/academicInfo/byStudent/${student_id}`);
        console.log("Fetched academic info:", JSON.stringify(academicResponse.data, null, 2));
        setAcademicInfo(academicResponse.data);




        // Fetch academic settings
        const settingsResponse = await axios.get("http://localhost:3001/academicSettings/current");
        setAcademicSettings(settingsResponse.data);




        // Fetch other data
        const [strandsRes, sectionsRes, departmentsRes] = await Promise.all([
          axios.get("http://localhost:3001/strands"),
          axios.get("http://localhost:3001/sections"),
          axios.get("http://localhost:3001/departments")
        ]);




        console.log("Fetched departments:", JSON.stringify(departmentsRes.data, null, 2));
        console.log("Fetched strands:", JSON.stringify(strandsRes.data, null, 2));
       
        setStrands(strandsRes.data);
        setSections(sectionsRes.data);
        setDepartments(departmentsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSuccessMessage("Error loading student information.");
        setShowSuccessModal(true);
      }
    };




    fetchData();
  }, [student_id, navigate]);




  const handleDelete = async (acads_id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`http://localhost:3001/academicInfo/${acads_id}`);
        setAcademicInfo((prev) =>
          prev.filter((info) => info.acads_id !== acads_id)
        );
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };




  const handleEdit = (info) => {
    console.log("Raw academic info for editing:", JSON.stringify(info, null, 2));
   
    // Get the department ID either from the direct field or from the DEPARTMENT_T association
    const departmentId = info.department_id || info.DEPARTMENT_T?.department_id;
    console.log("Department ID:", departmentId);
   
    // Create a complete info object with all required fields
    const completeInfo = {
      acads_id: info.acads_id,
      gradeLevel: info.gradeLevel,
      schoolYear: info.schoolYear,
      semester: info.semester,
      entryStatus: info.entryStatus,
      exitStatus: info.exitStatus,
      strand_id: info.strand_id || info.STRAND_T?.strand_id,
      section_id: info.section_id || info.SECTION_T?.section_id,
      department_id: departmentId,
      ACADEMIC_PERFORMANCE_Ts: info.ACADEMIC_PERFORMANCE_Ts // Include academic performance data
    };
   
    console.log("Processed info for editing:", JSON.stringify(completeInfo, null, 2));
    setEditingInfo(completeInfo);
    setShowAcadModal(true);
  };




  // Add function to check if can add academic info
  const canAddAcademicInfo = () => {
    if (!academicInfo || academicInfo.length === 0) return true;
    
    const latestAcademicInfo = academicInfo[academicInfo.length - 1];
    if (latestAcademicInfo.exitStatus === "Pending") {
      setErrorMessage("Cannot add new academic info. The student's latest academic record is still pending.");
      setShowErrorModal(true);
      return false;
    }
    if (latestAcademicInfo.exitStatus === "Graduated") {
      setErrorMessage("Cannot add new academic info. The student has already graduated.");
      setShowErrorModal(true);
      return false;
    }
    return true;
  };




  const handleAddAcademicInfo = () => {
    if (!canAddAcademicInfo()) return;
    setEditingInfo(null);
    setShowAcadModal(true);
  };




  const handleCloseAcadModal = () => setShowAcadModal(false);




  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
  };




  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage("");
  };




  const acadSchema = Yup.object().shape({
    gradeLevel: Yup.string().required("Required"),
    schoolYear: Yup.string().required("Required"),
    semester: Yup.string().required("Required"),
    entryStatus: Yup.string().required("Required"),
    strand_id: Yup.string().required("Required"),
    section_id: Yup.string().required("Required"),
    department_id: Yup.string().required("Required"),
  });




  const handlePrint = () => {
    const printWindow = window.open("", "_blank");




    printWindow.document.write(`
      <html>
        <head>
          <title>Student Details</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
              background-color: #f5f5f5;
              padding: 5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            .info-item {
              margin-bottom: 5px;
            }
            .label {
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
            @media print {
              body {
                padding: 0;
              }
              button {
                display: none;
              }
              @page {
                margin: 0.5cm;
                size: auto;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Student Information</h1>
            <p>LNHS Student Information System</p>
          </div>




          <div class="section">
            <div class="section-title">Personal Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">LRN:</span> ${postObject.student_id}
              </div>
              <div class="info-item">
                <span class="label">Name:</span> ${postObject.last_name}, ${
      postObject.first_name
    } ${postObject.middle_name || ""} ${postObject.suffix || ""}
              </div>
              <div class="info-item">
                <span class="label">Birth Date:</span> ${postObject.birth_date}
              </div>
              <div class="info-item">
                <span class="label">Place of Birth:</span> ${
                  postObject.place_of_birth
                }
              </div>
              <div class="info-item">
                <span class="label">Age:</span> ${postObject.age}
              </div>
              <div class="info-item">
                <span class="label">Gender:</span> ${postObject.sex}
              </div>
              <div class="info-item">
                <span class="label">Contact:</span> ${postObject.contact_num}
              </div>
              <div class="info-item">
                <span class="label">Email:</span> ${postObject.email}
              </div>
              <div class="info-item">
                <span class="label">Religion:</span> ${postObject.religion}
              </div>
              <div class="info-item">
                <span class="label">Height:</span> ${postObject.height}
              </div>
              <div class="info-item">
                <span class="label">Weight:</span> ${postObject.weight}
              </div>
              <div class="info-item">
                <span class="label">BMI:</span> ${postObject.bmi}
              </div>
              <div class="info-item">
                <span class="label">Nationality:</span> ${
                  postObject.nationality
                }
              </div>
            </div>
          </div>




          <div class="section">
            <div class="section-title">Guardian Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Guardian Name:</span> ${
                  postObject.PARENT_GUARDIAN_T
                    ? `${postObject.PARENT_GUARDIAN_T.pgLastName}, ${
                        postObject.PARENT_GUARDIAN_T.pgFirstName
                      } ${postObject.PARENT_GUARDIAN_T.pgMiddleName || ""}`
                    : "N/A"
                }
              </div>
              <div class="info-item">
                <span class="label">Contact Number:</span> ${
                  postObject.PARENT_GUARDIAN_T?.pgContactNum || "N/A"
                }
              </div>
            </div>
          </div>




          <div class="section">
            <div class="section-title">Address Information</div>
            <div class="info-item">
              <span class="label">Current Address:</span> ${
                postObject.currentAddressData
                  ? [
                      postObject.currentAddressData.houseNo,
                      postObject.currentAddressData.street_barangay,
                      postObject.currentAddressData.city_municipality,
                      postObject.currentAddressData.province,
                    ]
                      .filter(Boolean)
                      .join(", ")
                  : "N/A"
              }
            </div>
            <div class="info-item">
              <span class="label">Permanent Address:</span> ${
                postObject.permanentAddressData
                  ? [
                      postObject.permanentAddressData.houseNo,
                      postObject.permanentAddressData.street_barangay,
                      postObject.permanentAddressData.city_municipality,
                      postObject.permanentAddressData.province,
                    ]
                      .filter(Boolean)
                      .join(", ")
                  : "N/A"
              }
            </div>
          </div>




          <div class="section">
            <div class="section-title">Academic Information</div>
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Strand</th>
                  <th>Grade Level</th>
                  <th>Section</th>
                  <th>School Year</th>
                  <th>Semester</th>
                  <th>Entry Status</th>
                  <th>Exit Status</th>
                </tr>
              </thead>
              <tbody>
                ${academicInfo
                  .map(
                    (info) => `
                  <tr>
                    <td>${info.DEPARTMENT_T?.department_name || ""}</td>
                    <td>${info.STRAND_T?.strand_name || ""}</td>
                    <td>${info.gradeLevel}</td>
                    <td>${info.SECTION_T?.section_name || ""}</td>
                    <td>${info.schoolYear}</td>
                    <td>${info.semester}</td>
                    <td>${info.entryStatus}</td>
                    <td>${info.exitStatus}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>




          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px;">Print</button>
        </body>
      </html>
    `);




    printWindow.document.close();
  };




  // Add status update handler
  const handleStatusUpdate = async () => {
    try {
      await axios.put(`http://localhost:3001/students/status/${student_id}`, {
        status: selectedStatus
      });
     
      // Update local state
      setPostObject(prev => ({
        ...prev,
        status: selectedStatus
      }));
     
      setSuccessMessage("Student status updated successfully!");
      setShowSuccessModal(true);
      setShowStatusModal(false);
    } catch (error) {
      console.error("Error updating status:", error);
      setSuccessMessage("Failed to update student status.");
      setShowSuccessModal(true);
    }
  };




  // Add function to filter sections based on selected criteria
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




  return (
    <div className="details_main">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Success</h3>
            </div>
            <div className="modal-body">
              <p>{successMessage}</p>
            </div>
            <div className="modal-footer">
              <button
                className="modal-button"
                onClick={() => setShowSuccessModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Update Student Status</h3>
            </div>
            <div className="modal-body">
              <p><strong>Student ID:</strong> {postObject.student_id}</p>
              <p><strong>Name:</strong> {`${postObject.last_name}, ${postObject.first_name} ${postObject.middle_name || ''}`}</p>
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>Status:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowStatusModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#1E90FF',
                  color: '#fff',
                  cursor: 'pointer',
                  opacity: !selectedStatus ? 0.7 : 1
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}




      <div>
        <div className="details-section">
          <h2>
            Student Details
            <div className="button-group">
              {/* Only show Add Academics button if user has full edit permissions */}
              {privileges?.canEditStudents && (
                <button onClick={handleAddAcademicInfo}>+ Add Academics</button>
              )}
              {privileges?.canEditStudents && (
                <button
                  onClick={() =>
                    navigate("/EditStudent", {
                      state: { studentData: postObject },
                    })
                  }
                  className="edit-button"
                >
                  Edit Student Details
                </button>
              )}
              {privileges?.canEditStudents && (
                <button
                  onClick={() => {
                    setSelectedStatus(postObject.status || 'active');
                    setShowStatusModal(true);
                  }}
                  className="status-button"
                >
                  Update Status
                </button>
              )}
              <button onClick={handlePrint} className="print-button">
                Print Student Details
              </button>
            </div>
          </h2>
          <p>
            <strong>LRN:</strong> {postObject.student_id}
          </p>
          <p>
            <strong>Full Name:</strong>{" "}
            {`${postObject.last_name}, ${postObject.first_name} ${
              postObject.middle_name || ""
            }${postObject.suffix ? ", " + postObject.suffix : ""}`}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`status-badge status-${postObject.status || 'active'}`}>
              {postObject.status || 'active'}
            </span>
          </p>
          <br></br>


          <div className="section">
            <div className="section-title">Personal Information</div>
            <div className="details-info-grid">
              <p>
                <strong>Date of Birth:</strong> {postObject.birth_date}
              </p>
              <p>
                <strong>Place of Birth:</strong> {postObject.place_of_birth}
              </p>
              <p>
                <strong>Age:</strong> {postObject.age}
              </p>
              <p>
                <strong>Gender:</strong> {postObject.sex}
              </p>
              <p>
                <strong>Contact Number:</strong> {postObject.contact_num}
              </p>
              <p>
                <strong>Email:</strong> {postObject.email}
              </p>
              <p>
                <strong>Religion:</strong> {postObject.religion}
              </p>
              <p>
                <strong>Height:</strong> {postObject.height}
              </p>
              <p>
                <strong>Weight:</strong> {postObject.weight}
              </p>
              <p>
                <strong>BMI:</strong> {postObject.bmi}
              </p>
              <p>
                <strong>Nationality:</strong> {postObject.nationality}
              </p>
            </div>
          </div>


          <div className="section">
            <div className="section-title">Address Information</div>
            <div className="details-info-grid">
              <p>
                <strong>Current Address:</strong>{" "}
                {postObject.currentAddressData
                  ? [
                      postObject.currentAddressData.houseNo,
                      postObject.currentAddressData.street_barangay,
                      postObject.currentAddressData.city_municipality,
                      postObject.currentAddressData.province,
                    ]
                      .filter(Boolean)
                      .join(", ")
                  : "N/A"}
              </p>
              <p>
                <strong>Permanent Address:</strong>{" "}
                {postObject.permanentAddressData
                  ? [
                      postObject.permanentAddressData.houseNo,
                      postObject.permanentAddressData.street_barangay,
                      postObject.permanentAddressData.city_municipality,
                      postObject.permanentAddressData.province,
                    ]
                      .filter(Boolean)
                      .join(", ")
                  : "N/A"}
              </p>
            </div>
          </div>


          <div className="section">
            <div className="section-title">Guardian Information</div>
            <div className="details-info-grid">
              <p>
                <strong>Guardian: </strong>
                {postObject.PARENT_GUARDIAN_T
                  ? `${postObject.PARENT_GUARDIAN_T?.pgLastName} ${postObject.PARENT_GUARDIAN_T?.pgFirstName} ${postObject.PARENT_GUARDIAN_T?.pgMiddleName}`
                  : "N/A"}
              </p>
              <p>
                <strong>Contact Number: </strong>{" "}
                {postObject.PARENT_GUARDIAN_T?.pgContactNum}
              </p>
            </div>
          </div>
        </div>




        <h3>Academic Information</h3>
        {showAcadModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ width: '600px', maxWidth: '95%' }}>
              <div className="modal-header">
                <h3>{editingInfo ? "Edit Academic Info" : "Add Academic Info"}</h3>
              </div>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <Formik
                  enableReinitialize
                  initialValues={{
                    gradeLevel: editingInfo?.gradeLevel?.toString() || "",
                    schoolYear: editingInfo?.schoolYear || academicSettings?.current_school_year || "",
                    semester: editingInfo?.semester || academicSettings?.current_semester || "",
                    entryStatus: editingInfo?.entryStatus || "",
                    exitStatus: editingInfo?.exitStatus || "",
                    strand_id: editingInfo?.strand_id?.toString() || "",
                    section_id: editingInfo?.section_id?.toString() || "",
                    department_id: editingInfo?.department_id?.toString() || "",
                  }}
                  validationSchema={acadSchema}
                  onSubmit={(values, { resetForm }) => {
                    console.log("Form submission values:", JSON.stringify(values, null, 2));
                    
                    // For advisers, only update exit status
                    const newInfo = !privileges?.canEditStudents ? {
                      exitStatus: values.exitStatus
                    } : {
                      ...values,
                      student_id,
                      department_id: parseInt(values.department_id),
                      strand_id: parseInt(values.strand_id),
                      section_id: parseInt(values.section_id),
                      exitStatus: editingInfo ? values.exitStatus : "Pending" // Set default exitStatus for new records
                    };

                    // Check for duplicate entry before submitting
                    const isDuplicate = academicInfo.some(info => 
                      info.gradeLevel === values.gradeLevel &&
                      info.schoolYear === values.schoolYear &&
                      info.semester === values.semester &&
                      info.department_id === parseInt(values.department_id) &&
                      info.strand_id === parseInt(values.strand_id) &&
                      info.section_id === parseInt(values.section_id)
                    );

                    if (isDuplicate && !editingInfo) {
                      setSuccessMessage("This academic record already exists!");
                      setShowSuccessModal(true);
                      return;
                    }

                    if (editingInfo) {
                      console.log("Submitting edit with data:", JSON.stringify(newInfo, null, 2));
                      axios
                        .put(
                          `http://localhost:3001/academicInfo/${editingInfo.acads_id}`,
                          newInfo
                        )
                        .then(() => {
                          return axios.get(
                            `http://localhost:3001/academicInfo/byStudent/${student_id}`
                          );
                        })
                        .then((response) => {
                          console.log("Updated academic info response:", JSON.stringify(response.data, null, 2));
                          setAcademicInfo(response.data);
                          setSuccessMessage("Academic information updated successfully!");
                          setShowSuccessModal(true);
                          resetForm();
                          setShowAcadModal(false);
                          setEditingInfo(null);
                        })
                        .catch((err) => {
                          console.error("Update error:", err);
                          setSuccessMessage("Failed to update academic information.");
                          setShowSuccessModal(true);
                        });
                    } else {
                      axios
                        .post("http://localhost:3001/academicInfo", newInfo)
                        .then(() => {
                          return axios.get(
                            `http://localhost:3001/academicInfo/byStudent/${student_id}`
                          );
                        })
                        .then((response) => {
                          setAcademicInfo(response.data);
                          setSuccessMessage("Academic information added successfully!");
                          setShowSuccessModal(true);
                          resetForm();
                          setShowAcadModal(false);
                          setEditingInfo(null);
                        })
                        .catch((err) => {
                          console.error("Insert error:", err);
                          setSuccessMessage("Failed to add academic information.");
                          setShowSuccessModal(true);
                        });
                    }
                  }}
                >
                  {(formik) => {
                    console.log("Current formik values:", JSON.stringify(formik.values, null, 2));
                    console.log("Current editingInfo:", JSON.stringify(editingInfo, null, 2));
                    const selectedDepartment = parseInt(formik.values.department_id) || null;
                    console.log("Selected department:", selectedDepartment);




                    // Filter strands based on the selected department
                    const filteredStrands = strands.filter(
                      (strand) => !selectedDepartment || strand.department_id === selectedDepartment
                    );
                    console.log("Filtered strands:", JSON.stringify(filteredStrands, null, 2));




                    return (
                      <Form>
                        <div className="form-group">
                          <label className="label">Grade Level:</label>
                          <Field 
                            as="select" 
                            name="gradeLevel" 
                            className="form-control"
                            disabled={!privileges?.canEditStudents}
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
                            disabled={!privileges?.canEditStudents}
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
                            disabled={!privileges?.canEditStudents}
                          >
                            <option value="">Select Strand</option>
                            {filteredStrands.map((strand) => (
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
                            disabled={!privileges?.canEditStudents}
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
                            disabled={!privileges?.canEditStudents}
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

                        {editingInfo && (
                          <div className="form-group">
                            <label className="label">Exit Status:</label>
                            <Field 
                              as="select" 
                              name="exitStatus" 
                              className="form-control"
                            >
                              <option value="">Select</option>
                              {editingInfo?.ACADEMIC_PERFORMANCE_Ts?.[0]?.remarks === "Pending Grades" ? (
                                <>
                                  <option value="Pending">Pending</option>
                                  <option value="Dropped">Dropped</option>
                                  <option value="Transferred Out">Transferred Out</option>
                                  <option value="Shifted">Shifted</option>
                                </>
                              ) : (
                                <>
                                  <option value="Pending">Pending</option>
                                  {editingInfo?.ACADEMIC_PERFORMANCE_Ts?.[0]?.remarks === "Passed" && (
                                    <option value="Completed">Completed</option>
                                  )}
                                  <option value="Promoted with Deficiencies">Promoted with Deficiencies</option>
                                  <option value="Failed">Failed</option>
                                  <option value="Dropped">Dropped</option>
                                  <option value="Transferred Out">Transferred Out</option>
                                  <option value="Shifted">Shifted</option>
                                  {editingInfo?.gradeLevel === "12" && editingInfo?.semester === "2nd Semester" && editingInfo?.ACADEMIC_PERFORMANCE_Ts?.[0]?.remarks === "Passed" && (
                                    <option value="Graduated">Graduated</option>
                                  )}
                                </>
                              )}
                            </Field>
                            <ErrorMessage name="exitStatus" component="div" className="error-message" />
                          </div>
                        )}




                        <div className="modal-footer">
                          <button type="submit" className="modal-button">Save</button>
                          <button
                            type="button"
                            className="modal-button"
                            onClick={() => {
                              handleCloseAcadModal();
                              setEditingInfo(null);
                            }}
                            style={{ marginLeft: '10px', background: '#6c757d' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </Form>
                    );
                  }}
                </Formik>
              </div>
            </div>
          </div>
        )}
        <table border="1" cellPadding="10" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Date Created</th>
              <th>Date Updated</th>
              <th>Department</th>
              <th>Strand</th>
              <th>Grade Level</th>
              <th>Section</th>
              <th>School Year</th>
              <th>Semester</th>
              <th>Entry Status</th>
              <th>Exit Status</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {academicInfo.map((info, idx) => (
              <tr key={idx}>
                <td>
                  {new Date(info.createdAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </td>
                <td>
                  {new Date(info.updatedAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </td>
                <td>{info.DEPARTMENT_T?.department_name}</td>
                <td>{info.STRAND_T?.strand_name}</td>
                <td>{info.gradeLevel}</td>
                <td>{info.SECTION_T?.section_name}</td>
                <td>{info.schoolYear}</td>
                <td>{info.semester}</td>
                <td>{info.entryStatus}</td>
                <td>{info.exitStatus}</td>
                <td style={{ 
                  color: !info.ACADEMIC_PERFORMANCE_Ts || info.ACADEMIC_PERFORMANCE_Ts.length === 0 ? "#dc3545" : "#333"
                }}>
                  {info.ACADEMIC_PERFORMANCE_Ts && info.ACADEMIC_PERFORMANCE_Ts.length > 0 && info.ACADEMIC_PERFORMANCE_Ts[0].remarks
                    ? info.ACADEMIC_PERFORMANCE_Ts[0].remarks 
                    : "Pending Grades"}
                </td>
                <td>
                  <div className="dropdown">
                    <button className="dropdown-button">Actions ▼</button>
                    <div className="dropdown-content">
                      {privileges?.canManageStudents && (
                        <button 
                          onClick={() => handleEdit(info)} 
                          className="dropdown-item"
                        >
                          {privileges?.canEditStudents ? 'Edit' : 'Update Exit Status'}
                        </button>
                      )}
                      {privileges?.canEditStudents && (
                        <button 
                          onClick={() => handleDelete(info.acads_id)} 
                          className="dropdown-item delete"
                        >
                          Delete
                        </button>
                      )}
                      <button
                        onClick={() =>
                          navigate(`/Student/${student_id}/grades/${info.acads_id}`, {
                            state: { exitStatus: info.exitStatus }
                          })
                        }
                        className="dropdown-item"
                      >
                        View Grades
                      </button>
                    </div>
                  </div>
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


        .label{
          text-align: left;
          font-weight: bold;
          color: #333;
        }




        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 400px;
          max-width: 90%;
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
          text-align: center;
        }




        .modal-footer {
                    display: flex;
          justify-content: flex-end; /* aligns buttons to the right */
          gap: 10px;                 /* spacing between buttons */
          margin-top: 20px;
                }


        .modal-button {
          padding: 8px 16px;
          font-size: 16px;
          gap: 3px;
          background-color: green;
          color: white;
          border: 2px solid;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease;
        }


        .modal-button:hover {
          background-color: red;
          color: yellow; /* example: change text color on hover */
        }








        .form-group {
          margin-bottom: 15px;
        }




        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }




        .form-control {
          width: 100%;
          height: 60px;
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




        .modal-content {
          max-height: 90vh;
          overflow-y: auto;
        }




        .modal-body {
          padding: 20px;
        }




        .form-group select.form-control {
          background-color: white;
        }




        .form-control:focus {
          border-color: #80bdff;
          outline: 0;
          box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
        }

        .dropdown {
          position: relative;
          display: inline-block;
        }

        .dropdown-button {
          padding: 8px 16px;
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          color: black;
        }

        .dropdown-button:hover {
          background-color: #e9ecef;
        }

        .dropdown-content {
          display: none;
          position: absolute;
          right: 0;
          background-color: #fff;
          min-width: 160px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          border-radius: 4px;
          z-index: 1;
        }

        .dropdown:hover .dropdown-content {
          display: block;
        }

        .dropdown-item {
          display: block;
          width: 100%;
          padding: 8px 16px;
          text-align: left;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          color: #333;
        }

        .dropdown-item:hover {
          background-color: #f8f9fa;
        }

        .dropdown-item.delete {
          color: #dc3545;
        }

        .dropdown-item.delete:hover {
          background-color: #dc3545;
          color: white;
        }
      `}</style>
    </div>
  );
}




export default Student;



