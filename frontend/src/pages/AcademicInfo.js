import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from '../context/AuthContext';
import "./styles.css";

function AcademicInfo() {
  const { student_id } = useParams();
  const navigate = useNavigate();
  const { privileges } = useAuth();
  const [academicInfo, setAcademicInfo] = useState([]);
  const [strands, setStrands] = useState([]);
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [hasAccess, setHasAccess] = useState(true);
  const [academicSettings, setAcademicSettings] = useState(null);

  // Generate school years (current year and next 2 years)
  const getCurrentSchoolYears = () => {
    const currentYear = new Date().getFullYear();
    const schoolYears = [];
    for (let i = 0; i < 3; i++) {
      const year = currentYear + i;
      schoolYears.push(`${year}-${year + 1}`);
    }
    return schoolYears;
  };

  useEffect(() => {
    console.log("Loading academic info for student_id:", student_id);
    
    const fetchData = async () => {
      try {
        // Fetch student data using byId endpoint
        const studentResponse = await axios.get(`http://localhost:3001/students/byId/${student_id}`);
        console.log("Student data loaded:", studentResponse.data);
        setStudentData(studentResponse.data);

        // Fetch academic info to check if student has previous records
        const academicResponse = await axios.get(`http://localhost:3001/academicInfo/byStudent/${student_id}`);
        console.log("Academic info loaded:", academicResponse.data);
        setAcademicInfo(academicResponse.data);

        // Fetch academic settings
        const settingsResponse = await axios.get("http://localhost:3001/academicSettings/current");
        setAcademicSettings(settingsResponse.data);

        // If user is a section adviser, check if student belongs to their section
        if (privileges?.sectionId) {
          const studentInSection = academicResponse.data.some(
            info => info.section_id === privileges.sectionId
          );
          if (!studentInSection) {
            setHasAccess(false);
            setSuccessMessage("You don't have access to this student's information.");
            setTimeout(() => {
              navigate('/section-students');
            }, 2000);
            return;
          }
        }

        // Fetch other data
        const [strandsRes, sectionsRes, departmentsRes] = await Promise.all([
          axios.get("http://localhost:3001/strands"),
          axios.get("http://localhost:3001/sections"),
          axios.get("http://localhost:3001/departments")
        ]);

        setStrands(strandsRes.data);
        setSections(sectionsRes.data);
        setDepartments(departmentsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorState("Failed to fetch data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [student_id, privileges?.sectionId, navigate]);

  // Determine initial entry and exit status
  const determineInitialStatus = (gradeLevel, semester) => {
    // Check if this is the student's first record
    const hasExistingRecords = academicInfo.length > 0;
    
    let entryStatus = "Continuing";
    let exitStatus = "Pending";

    // For new students (no existing records)
    if (!hasExistingRecords) {
      entryStatus = "New Enrollee";
    } 
    // For existing students
    else {
      const lastRecord = academicInfo[academicInfo.length - 1];
      
      // If moving from grade 11 to 12
      if (lastRecord.gradeLevel === "11" && gradeLevel === "12") {
        entryStatus = "Continuing";
      }
      // If in the same grade level
      else if (lastRecord.gradeLevel === gradeLevel) {
        if (semester === "2nd Semester") {
          entryStatus = "Continuing";
        }
      }
    }

    return { entryStatus, exitStatus };
  };

  const acadSchema = Yup.object().shape({
    gradeLevel: Yup.string().required("Required"),
    schoolYear: Yup.string().required("Required"),
    semester: Yup.string().required("Required"),
    strand_id: Yup.string().required("Required"),
    section_id: Yup.string().required("Required"),
    department_id: Yup.string().required("Required"),
  });

  const handleSubmit = (values, { resetForm }) => {
    console.log("Submitting academic info:", values);
    
    const studentIdNum = String(student_id).replace(/\D/g, '');
    const { entryStatus, exitStatus } = determineInitialStatus(values.gradeLevel, values.semester);
    
    const newInfo = {
      ...values,
      student_id: studentIdNum,
      department_id: Number(values.department_id),
      strand_id: Number(values.strand_id),
      section_id: Number(values.section_id),
      gradeLevel: String(values.gradeLevel),
      entryStatus,
      exitStatus
    };
    
    console.log("Formatted data for submission:", newInfo);

    // First create academic info
    axios.post("http://localhost:3001/academicInfo", newInfo)
      .then((postResponse) => {
        console.log("Create academic info response:", postResponse.data);
        
        // Then create academic performance record
        const academicPerformanceData = {
          acads_id: postResponse.data.acads_id,
          gpa: null,
          honors: null
        };

        return axios.post("http://localhost:3001/academicPerformance", academicPerformanceData);
      })
      .then(() => {
        setShowSuccessMessage(true);
        setSuccessMessage("Academic information added successfully!");
        setTimeout(() => {
          setShowSuccessMessage(false);
          // Navigate based on user type
          if (privileges?.sectionId) {
            navigate('/section-students');
          } else {
            navigate(`/student/${student_id}`);
          }
        }, 2000);
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.error || err.message;
        console.error("Insert error:", errorMsg);
        setErrorState(`Failed to add record: ${errorMsg}`);
      });
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!hasAccess) {
    return (
      <div className="create_main">
        <div className="error-banner">
          <p>You don't have access to this student's information.</p>
          <p>Redirecting to your section's student list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create_main">
      {showSuccessMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {errorState && (
        <div className="error-banner">
          <p>Error: {errorState}</p>
          <p>Please try again or contact support.</p>
        </div>
      )}

      <div className="createStudentPage">
        <h2>Add Academic Information</h2>
        
        {studentData && (
          <div className="student-details">
            <p><strong>Student Name:</strong> {studentData.last_name}, {studentData.first_name} {studentData.middle_name || ''}</p>
            <p><strong>LRN:</strong> {studentData.student_id}</p>
          </div>
        )}

        <Formik
          initialValues={{
            gradeLevel: academicInfo.length > 0 ? "12" : "11",
            schoolYear: academicSettings?.current_school_year || getCurrentSchoolYears()[0],
            semester: academicSettings?.current_semester || "1st Semester",
            strand_id: "",
            section_id: "",
            department_id: "",
          }}
          validationSchema={acadSchema}
          onSubmit={handleSubmit}
        >
          {(formik) => {
            const selectedDepartment = parseInt(formik.values.department_id);
            const selectedStrand = parseInt(formik.values.strand_id);
            const selectedGrade = parseInt(formik.values.gradeLevel);
            console.log("Selected department:", selectedDepartment);
            console.log("Selected strand:", selectedStrand);
            console.log("Selected grade level:", selectedGrade);
            console.log("All sections:", sections);
            
            // Filter strands by department
            const filteredStrands = strands.filter(
              (strand) => strand.department_id === selectedDepartment
            );

            // Filter sections by strand and grade level
            const filteredSections = sections.filter(section => {
              if (!selectedDepartment || !selectedStrand || !selectedGrade) return false;
              return section.strand_id === selectedStrand && 
                     parseInt(section.grade_level) === selectedGrade;
            });
            
            console.log("Filtered sections:", filteredSections);

            return (
              <Form>
                <div className="form-group">
                  <label className="label">Grade Level:</label>
                  <Field 
                    as="select" 
                    name="gradeLevel" 
                    className="form-select"
                    disabled={academicInfo.length > 0}
                    onChange={(e) => {
                      formik.setFieldValue('gradeLevel', e.target.value);
                      formik.setFieldValue('section_id', '');
                    }}
                  >
                    <option value="">Select Grade Level</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                  </Field>
                  <ErrorMessage name="gradeLevel" component="div" className="error" />
                </div>

                <div className="form-group">
                  <label className="label">School Year:</label>
                  <Field 
                    type="text"
                    name="schoolYear" 
                    className="form-select"
                    disabled={true}
                  />
                  <ErrorMessage name="schoolYear" component="div" className="error" />
                </div>

                <div className="form-group">
                  <label className="label">Semester:</label>
                  <Field 
                    type="text"
                    name="semester" 
                    className="form-select"
                    disabled={true}
                  />
                  <ErrorMessage name="semester" component="div" className="error" />
                </div>

                <div className="form-group">
                  <label className="label">Department:</label>
                  <Field 
                    as="select" 
                    name="department_id" 
                    className="form-select"
                    onChange={(e) => {
                      formik.setFieldValue('department_id', e.target.value);
                      formik.setFieldValue('strand_id', '');
                      formik.setFieldValue('section_id', '');
                    }}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.department_id} value={dept.department_id}>
                        {dept.department_name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="department_id" component="div" className="error" />
                </div>

                <div className="form-group">
                  <label className="label">Strand:</label>
                  <Field 
                    as="select" 
                    name="strand_id" 
                    className="form-select"
                    onChange={(e) => {
                      formik.setFieldValue('strand_id', e.target.value);
                      formik.setFieldValue('section_id', '');
                    }}
                  >
                    <option value="">Select Strand</option>
                    {filteredStrands.map((strand) => (
                      <option key={strand.strand_id} value={strand.strand_id}>
                        {strand.strand_name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="strand_id" component="div" className="error" />
                </div>

                <div className="form-group">
                  <label className="label">Section:</label>
                  <Field as="select" name="section_id" className="form-select">
                    <option value="">Select Section</option>
                    {filteredSections.map((section) => (
                      <option key={section.section_id} value={section.section_id}>
                        {section.section_name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="section_id" component="div" className="error" />
                </div>

                <div className="button-group">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => navigate(`/student/${student_id}`)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    Save
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

export default AcademicInfo; 