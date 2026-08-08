import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import Select from "react-select"; // Import react-select


function Grades() {
  const [grades, setGrades] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false); // State for Add Grade Modal
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false); // Add this state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedGrades, setEditedGrades] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const { student_id, acads_id } = useParams();
  const location = useLocation();
  const exitStatus = location.state?.exitStatus || "Pending";
  const [allSubjects, setAllSubjects] = useState([]);
  const [existingSubjectIds, setExistingSubjectIds] = useState([]);
  const [student, setStudent] = useState(null);
  const [academicInfo, setAcademicInfo] = useState(null);
  const [gpa, setGpa] = useState(null);
  const [gradeStatus, setGradeStatus] = useState(""); // Add this state for grade status message
  const [academicPerformance, setAcademicPerformance] = useState(null); // Add this state


  useEffect(() => {
    const fetchStudent = async () => {
      try {
        // Fetch student info
        const studentRes = await axios.get(
          `http://localhost:3001/students/byId/${student_id}`
        );


        const student = studentRes.data;


        // Format full name
        const middleInitial = student.middle_name
          ? student.middle_name.charAt(0) + "."
          : "";


        const fullName = `${student.last_name}, ${
          student.first_name
        } ${middleInitial} ${student.suffix || ""}`.trim();


        setStudent({
          ...student,
          full_name: fullName,
        });


        // Fetch academic info
        const academicRes = await axios.get(
          `http://localhost:3001/academicInfo/byStudent/${student_id}`
        );


        // Find the current academic info based on acads_id
        const currentAcadInfo = academicRes.data.find(info => info.acads_id === parseInt(acads_id));
        setAcademicInfo(currentAcadInfo);


      } catch (err) {
        console.error("Failed to fetch student:", err);
      }
    };


    if (student_id) {
      fetchStudent();
    }
  }, [student_id, acads_id]);
  // fetch all subjects
  const fetchAllSubjects = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/subjects`);
      const filtered = res.data.filter(
        (subj) => !existingSubjectIds.includes(subj.subject_id)
      );
      setAllSubjects(
        filtered.map((subj) => ({
          value: subj.subject_id,
          label: subj.subject_name,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch all subjects:", err);
    }
  };


  const handleOpenAddGradeModal = () => {
    setShowAddSubjectModal(true);
  };


  // Add function to compute GPA and determine honors
  const computeGPA = (gradesArray) => {
    // Check if there are any subjects loaded
    if (!gradesArray || gradesArray.length === 0) {
      return {
        isComplete: false,
        message: "No Available Grades"
      };
    }

    // Check if all grades are valid (not empty, not 0, and numeric)
    const hasIncompleteGrades = gradesArray.some(grade =>
      !grade.grade ||
      grade.grade === "" ||
      isNaN(parseFloat(grade.grade)) ||
      parseFloat(grade.grade) === 0
    );

    if (hasIncompleteGrades) {
      return {
        isComplete: false,
        message: "Incomplete Grades"
      };
    }

    // Convert all grades to numbers and calculate GPA
    const numericGrades = gradesArray.map(grade => parseFloat(grade.grade));
    const average = numericGrades.reduce((acc, curr) => acc + curr, 0) / numericGrades.length;

    // Determine honors
    let honors = "";
    if (average >= 98) honors = "With Highest Honors";
    else if (average >= 95) honors = "With High Honors";
    else if (average >= 90) honors = "With Honors";
    else honors = "No Honors";

    // Count failed subjects by type
    const failedCore = gradesArray.filter(grade => 
      grade.type === 'core' && parseFloat(grade.grade) < 75
    ).length;

    const failedSpecialized = gradesArray.filter(grade => 
      grade.type === 'specialized' && parseFloat(grade.grade) < 75
    ).length;

    // Generate remarks based on failed subjects
    let remarks = "Passed";
    if (failedCore > 0 && failedSpecialized > 0) {
      remarks = `Failed ${failedCore} core subject${failedCore > 1 ? 's' : ''} and ${failedSpecialized} specialized subject${failedSpecialized > 1 ? 's' : ''}`;
    } else if (failedCore > 0) {
      remarks = `Failed ${failedCore} core subject${failedCore > 1 ? 's' : ''}`;
    } else if (failedSpecialized > 0) {
      remarks = `Failed ${failedSpecialized} specialized subject${failedSpecialized > 1 ? 's' : ''}`;
    }

    return {
      isComplete: true,
      gpa: average.toFixed(2),
      honors,
      remarks,
      message: ""
    };
  };


  // Update useEffect to handle initial load
  useEffect(() => {
    if (acads_id) {
      const initializeData = async () => {
        try {
          // First fetch existing academic performance
          const existingPerformance = await axios.get(`http://localhost:3001/academicPerformance/${acads_id}`);
          
          if (!existingPerformance.data) {
            // Only create if it doesn't exist
            const payload = {
              acads_id: parseInt(acads_id),
              gpa: null,
              honors: null,
              remarks: "Pending Grades"
            };
            
            await axios.post(`http://localhost:3001/academicPerformance`, payload);
          }
          
          // Then fetch grades
          await fetchGrades();
        } catch (error) {
          console.error("Failed to initialize data:", error);
        }
      };

      initializeData();
    }
  }, [acads_id]);


  // Update fetchGrades to not create academic performance records
  const fetchGrades = async () => {
    try {
      // Fetch grades
      const res = await axios.get(
        `http://localhost:3001/grades/byAcads/${acads_id}`
      );
      console.log('Grades data:', res.data);
      const formatted = res.data.map((item) => ({
        curriculum_id: item.curriculum_id,
        subject_name: item.CURRICULUM_T?.subject_name,
        subject_description: item.CURRICULUM_T?.subject_description,
        type: item.CURRICULUM_T?.type,
        grade: item.grade,
        remarks: item.grade_remarks,
        grade_id: item.grade_id,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        CURRICULUM_T: item.CURRICULUM_T
      }));
      setGrades(formatted);
      setExistingSubjectIds(formatted.map((g) => g.curriculum_id));

      // Fetch academic performance
      try {
        const performanceRes = await axios.get(`http://localhost:3001/academicPerformance/${acads_id}`);
        console.log('Academic performance data:', performanceRes.data);
        
        if (performanceRes.data) {
          setAcademicPerformance(performanceRes.data);
          
          // If we have a GPA, set the GPA state
          if (performanceRes.data.gpa) {
            setGpa({
              isComplete: true,
              gpa: performanceRes.data.gpa.toString(),
              honors: performanceRes.data.honors,
              remarks: performanceRes.data.remarks,
              message: ""
            });
          } else {
            setGpa({
              isComplete: false,
              message: performanceRes.data.remarks || "Pending Grades"
            });
          }
        }
      } catch (performanceError) {
        console.error("Error fetching academic performance:", performanceError);
        setGpa({
          isComplete: false,
          message: "Error fetching academic performance"
        });
      }
    } catch (err) {
      console.error("Failed to fetch grades:", err);
      setGradeStatus("Error fetching grades");
      setGpa({
        isComplete: false,
        message: "Error fetching grades"
      });
    }
  };


  // Update the useEffect for grade changes
  useEffect(() => {
    const updateAcademicPerformance = async () => {
      if (grades.length === 0) return;

      try {
        // Check if any grades are NULL, empty, or 0
        const hasIncompleteGrades = grades.some(grade => 
          !grade.grade || 
          grade.grade === "" || 
          grade.grade === "0" || 
          parseFloat(grade.grade) === 0
        );

        let payload;
        if (hasIncompleteGrades) {
          payload = {
            acads_id: parseInt(acads_id),
            gpa: null,
            honors: null,
            remarks: "Incomplete Grades"
          };
        } else {
          // Compute GPA and determine honors
          const gpaResult = computeGPA(grades);
          if (gpaResult.isComplete) {
            payload = {
              acads_id: parseInt(acads_id),
              gpa: parseFloat(gpaResult.gpa),
              honors: gpaResult.honors,
              remarks: gpaResult.remarks
            };
          } else {
            payload = {
              acads_id: parseInt(acads_id),
              gpa: null,
              honors: null,
              remarks: "Incomplete Grades"
            };
          }
        }

        try {
          // Try to update the academic performance
          const response = await axios.put(`http://localhost:3001/academicPerformance/${acads_id}`, payload);
          
          // Update states immediately
          setAcademicPerformance(response.data);
          setGpa(payload.gpa ? {
            isComplete: true,
            gpa: payload.gpa.toString(),
            honors: payload.honors,
            remarks: payload.remarks,
            message: ""
          } : {
            isComplete: false,
            message: payload.remarks
          });
        } catch (updateError) {
          console.error("Error updating academic performance:", updateError);
          // Don't update the UI state if the update failed
        }
      } catch (err) {
        console.error("Error in updateAcademicPerformance:", err);
      }
    };

    updateAcademicPerformance();
  }, [grades, acads_id]);


  const handleSaveAll = async () => {
    try {
      // First update all grades
      const updatePromises = Object.entries(editedGrades).map(
        ([grade_id, data]) => {
          return axios.put(`http://localhost:3001/grades/${grade_id}`, {
            grade: data.grade,
            grade_remarks: data.remarks,
          });
        }
      );

      // Wait for all grade updates to complete
      await Promise.all(updatePromises);
      
      // Fetch the latest grades after updates
      const updatedGradesRes = await axios.get(
        `http://localhost:3001/grades/byAcads/${acads_id}`
      );
      
      const formattedGrades = updatedGradesRes.data.map((item) => ({
        curriculum_id: item.curriculum_id,
        subject_name: item.CURRICULUM_T?.subject_name,
        subject_description: item.CURRICULUM_T?.subject_description,
        type: item.CURRICULUM_T?.type,
        grade: item.grade,
        remarks: item.grade_remarks,
        grade_id: item.grade_id,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        CURRICULUM_T: item.CURRICULUM_T
      }));
      
      setGrades(formattedGrades);
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to update grades:", error);
      alert("Failed to update some or all grades.");
    }
  };


  const handleDeleteGrade = async (grade_id) => {
    if (!window.confirm("Are you sure you want to delete this grade?")) return;
    try {
      await axios.delete(`http://localhost:3001/grades/${grade_id}`);
      
      // Fetch the latest grades after deletion
      const updatedGradesRes = await axios.get(
        `http://localhost:3001/grades/byAcads/${acads_id}`
      );
      
      const formattedGrades = updatedGradesRes.data.map((item) => ({
        curriculum_id: item.curriculum_id,
        subject_name: item.CURRICULUM_T?.subject_name,
        subject_description: item.CURRICULUM_T?.subject_description,
        type: item.CURRICULUM_T?.type,
        grade: item.grade,
        remarks: item.grade_remarks,
        grade_id: item.grade_id,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        CURRICULUM_T: item.CURRICULUM_T
      }));
      
      setGrades(formattedGrades);
    } catch (err) {
      console.error("Failed to delete grade:", err);
    }
  };


  useEffect(() => {
    if (showChecklistModal) {
      setSelectedSubjects(availableSubjects.map((s) => s.value));
    }
  }, [showChecklistModal, availableSubjects]);


  // Fetch subjects for the strand
  const fetchStrandSubjects = async () => {
    try {
      if (!academicInfo) {
        console.error('Academic info not loaded');
        return;
      }


      // Get subjects from curriculum based on student's grade level and semester
      const curriculumRes = await axios.get(
        `http://localhost:3001/curriculum/byStrand/${academicInfo.strand_id}`
      );


      // Extract subjects for current grade level and semester
      const curriculumData = curriculumRes.data;
      const gradeLevel = academicInfo.gradeLevel;
      const semester = academicInfo.semester;
     
      // Get all subjects (both core and specialized) for current grade and semester
      const curriculumSubjects = [
        ...curriculumData[gradeLevel][semester].core,
        ...curriculumData[gradeLevel][semester].specialized
      ];


      // Filter out subjects that already have grades
      const filtered = curriculumSubjects.filter(
        (subj) => !grades.some(grade => grade.curriculum_id === subj.curriculum_id)
      );


      setAvailableSubjects(
        filtered.map((subj) => ({
          value: subj.curriculum_id,
          label: subj.subject_name,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    }
  };


  // Open modal to add subjects
  const handleOpenChecklist = async () => {
    await fetchStrandSubjects();
    setSelectedSubjects([]); // reset selection
    setShowChecklistModal(true);
  };


  // Add handleAddSubjects function
  const handleAddSubjects = async () => {
    try {
      // First add all selected subjects
      const addPromises = selectedSubjects.map(curriculum_id => 
        axios.post("http://localhost:3001/grades", {
          acads_id: parseInt(acads_id),
          curriculum_id: parseInt(curriculum_id),
          grade: "",
          grade_remarks: ""
        })
      );

      // Wait for all subjects to be added
      await Promise.all(addPromises);
      
      // Close the modal
      setShowChecklistModal(false);
      
      // Fetch the latest grades
      await fetchGrades();
    } catch (error) {
      console.error("Failed to add subjects:", error);
      alert("Failed to add some or all subjects.");
    }
  };


  // Handle subject selection for checklist modal
  const handleSubjectCheck = (curriculum_id) => {
    setSelectedSubjects((prev) =>
      prev.includes(curriculum_id)
        ? prev.filter((id) => id !== curriculum_id)
        : [...prev, curriculum_id]
    );
  };


  // Update handleAddGrade to immediately update academic performance
  const handleAddGrade = async (values) => {
    try {
      await axios.post("http://localhost:3001/grades", {
        acads_id,
        curriculum_id: values.subject.value,
        grade: values.grade,
        grade_remarks: values.grade_remarks,
      });
      
      // Fetch the latest grades after adding new grade
      const updatedGradesRes = await axios.get(
        `http://localhost:3001/grades/byAcads/${acads_id}`
      );
      
      const formattedGrades = updatedGradesRes.data.map((item) => ({
        curriculum_id: item.curriculum_id,
        subject_name: item.CURRICULUM_T?.subject_name,
        subject_description: item.CURRICULUM_T?.subject_description,
        type: item.CURRICULUM_T?.type,
        grade: item.grade,
        remarks: item.grade_remarks,
        grade_id: item.grade_id,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        CURRICULUM_T: item.CURRICULUM_T
      }));
      
      setGrades(formattedGrades);
      
      // Check if any grades are NULL, empty, or 0
      const hasIncompleteGrades = formattedGrades.some(grade => 
        !grade.grade || 
        grade.grade === "" || 
        grade.grade === "0" || 
        parseFloat(grade.grade) === 0
      );

      if (hasIncompleteGrades) {
        const response = await axios.post(`http://localhost:3001/academicPerformance`, {
          acads_id: parseInt(acads_id),
          gpa: null,
          honors: null,
          remarks: "Incomplete Grades"
        });
        setAcademicPerformance(response.data);
      } else {
        const gpaResult = computeGPA(formattedGrades);
        if (gpaResult.isComplete) {
          const response = await axios.post(`http://localhost:3001/academicPerformance`, {
            acads_id: parseInt(acads_id),
            gpa: parseFloat(gpaResult.gpa),
            honors: gpaResult.honors,
            remarks: gpaResult.remarks
          });
          setAcademicPerformance(response.data);
        }
      }
      
      setShowAddGradeModal(false);
    } catch (err) {
      console.error("Failed to add grade:", err);
      alert("Failed to add grade.");
    }
  };


  // Add function to check if there are any grades
  const hasAnyGrades = () => {
    return grades.length > 0;
  };


  // Update handleNoSubjects to only be called when explicitly needed
  const handleNoSubjects = async () => {
    const payload = {
      acads_id: parseInt(acads_id),
      gpa: null,
      honors: null,
      remarks: "Pending Grades"
    };

    try {
      const response = await axios.post(`http://localhost:3001/academicPerformance`, payload);
      setAcademicPerformance(response.data);
    } catch (error) {
      console.error("Failed to update academic performance:", error);
    }
  };


  const handleGradeChange = (grade_id, value) => {
    const numValue = parseFloat(value);
    let remarks = "";
    
    // Only set remarks if the grade is a valid number greater than 0
    if (!isNaN(numValue) && numValue > 0) {
      remarks = numValue >= 75 ? "Passed" : "Failed";
    }

    setEditedGrades((prev) => ({
      ...prev,
      [grade_id]: {
        grade: value === "" ? null : value,
        remarks: remarks,
      },
    }));
  };


  // Add this function to handle adding a new subject
  const handleAddNewSubject = async (values) => {
    try {
      // First add the subject to curriculum
      const curriculumRes = await axios.post('http://localhost:3001/curriculum/assign', {
        strand_id: academicInfo.strand_id,
        subject_name: values.subject_name,
        subject_description: values.subject_description,
        grade_level: academicInfo.gradeLevel,
        semester: academicInfo.semester,
        type: values.type || 'core',
        isRegular: false
      });


      // Then add the grade entry with empty grade
      if (curriculumRes.data) {
        await axios.post("http://localhost:3001/grades", {
          acads_id,
          curriculum_id: curriculumRes.data.curriculum_id,
          grade: "",
          grade_remarks: ""
        });
      }


      fetchGrades(); // Refresh the grades table
      setShowAddSubjectModal(false);
    } catch (err) {
      console.error("Failed to add subject:", err);
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("Failed to add subject");
      }
    }
  };


  // Add this function to initialize editedGrades when entering edit mode
  const handleEnterEditMode = () => {
    const initialEditedGrades = {};
    grades.forEach(grade => {
      initialEditedGrades[grade.grade_id] = {
        grade: grade.grade || "",
        remarks: grade.remarks || ""
      };
    });
    setEditedGrades(initialEditedGrades);
    setIsEditMode(true);
  };


  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Student Grades</title>
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
            .performance-section {
              margin-top: 30px;
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 8px;
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
            <h1>Student Grades</h1>
            <p>LNHS Student Information System</p>
          </div>

          <div class="section">
            <h2>Student Information</h2>
            <p><strong>Name:</strong> ${student?.full_name}</p>
            <p><strong>Grade Level:</strong> ${academicInfo?.gradeLevel}</p>
            <p><strong>Strand:</strong> ${academicInfo?.STRAND_T?.strand_name}</p>
            <p><strong>Section:</strong> ${academicInfo?.SECTION_T?.section_name}</p>
            <p><strong>School Year:</strong> ${academicInfo?.schoolYear}</p>
            <p><strong>Semester:</strong> ${academicInfo?.semester}</p>
          </div>

          <div class="section">
            <div class="section-title">Core Subjects</div>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Description</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${grades
                  .filter(grade => grade.type === 'core')
                  .map(grade => `
                    <tr>
                      <td>${grade.subject_name}</td>
                      <td>${grade.subject_description}</td>
                      <td>${grade.grade || 'N/A'}</td>
                      <td>${grade.remarks || 'N/A'}</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Specialized Subjects</div>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Description</th>
                  <th>Grade</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${grades
                  .filter(grade => grade.type === 'specialized')
                  .map(grade => `
                    <tr>
                      <td>${grade.subject_name}</td>
                      <td>${grade.subject_description}</td>
                      <td>${grade.grade || 'N/A'}</td>
                      <td>${grade.remarks || 'N/A'}</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>

          <div class="performance-section">
            <h3>Academic Performance</h3>
            ${academicPerformance?.gpa ? `
              <p><strong>GPA:</strong> ${academicPerformance.gpa}</p>
              <p><strong>Remarks:</strong> ${academicPerformance.remarks}</p>
              <p><strong>Honors:</strong> ${academicPerformance.honors}</p>
            ` : `
              <p style="color: #dc3545; font-style: italic;">Pending Grades</p>
            `}
          </div>

          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px;">Print</button>
        </body>
      </html>
    `);

    printWindow.document.close();
  };


  return (
    <div>
      {student ? (
        <div>
          <h1>{student.full_name}</h1>
          {academicInfo && (
            <h3>
              {academicInfo.gradeLevel} - {academicInfo.STRAND_T?.strand_name} | {academicInfo.semester}
            </h3>
          )}
        </div>
      ) : (
        <p>Loading student info...</p>
      )}


      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
          <button onClick={handleOpenChecklist}>Load Subjects</button>
          <button onClick={handleOpenAddGradeModal}>Add Subject</button>
          {exitStatus === "Pending" && !isEditMode && (
            <button
              onClick={handleEnterEditMode}
              style={{ marginLeft: "10px" }}
            >
              Edit Grades
            </button>
          )}
          {isEditMode && (
            <>
              <button
                onClick={handleSaveAll}
                style={{
                  marginLeft: "10px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                }}
              >
                Save All Changes
              </button>
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setEditedGrades({});
                  fetchGrades();
                }}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
        <button onClick={handlePrint} style={{ marginLeft: "10px" }}>
          Print Grades
        </button>
      </div>


      {/* Core Subjects Section */}
      <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Core Subjects</h3>
      <table
        border="1"
        cellPadding="10"
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}
      >
        <thead>
          <tr>
            <th>Date Created</th>
            <th>Date Updated</th>
            <th>Subject</th>
            <th>Description</th>
            <th>Grade</th>
            <th>Remarks</th>
            {exitStatus === "Pending" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {grades.filter(grade => grade.type === 'core').length > 0 ? (
            grades
              .filter(grade => grade.type === 'core')
              .map((grade) => (
                <tr key={grade.grade_id}>
                  <td>
                    {new Date(grade.createdAt).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    {new Date(grade.updatedAt).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>{grade.subject_name}</td>
                  <td>{grade.subject_description}</td>
                  <td>
                    {isEditMode ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editedGrades[grade.grade_id]?.grade || grade.grade || ""}
                        onChange={(e) =>
                          handleGradeChange(grade.grade_id, e.target.value)
                        }
                        style={{ width: "80px" }}
                      />
                    ) : (
                      grade.grade
                    )}
                  </td>
                  <td>
                    {isEditMode
                      ? editedGrades[grade.grade_id]?.remarks || grade.remarks || ""
                      : grade.remarks}
                  </td>
                  {exitStatus === "Pending" && (
                    <td>
                      <button onClick={() => handleDeleteGrade(grade.grade_id)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan={exitStatus === "Pending" ? "7" : "6"} style={{ textAlign: "center" }}>
                No core subjects found.
              </td>
            </tr>
          )}
        </tbody>
      </table>


      {/* Specialized Subjects Section */}
      <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>Specialized Subjects</h3>
      <table
        border="1"
        cellPadding="10"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Date Created</th>
            <th>Date Updated</th>
            <th>Subject</th>
            <th>Description</th>
            <th>Grade</th>
            <th>Remarks</th>
            {exitStatus === "Pending" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {grades.filter(grade => grade.type === 'specialized').length > 0 ? (
            grades
              .filter(grade => grade.type === 'specialized')
              .map((grade) => (
                <tr key={grade.grade_id}>
                  <td>
                    {new Date(grade.createdAt).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>
                    {new Date(grade.updatedAt).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>{grade.subject_name}</td>
                  <td>{grade.subject_description}</td>
                  <td>
                    {isEditMode ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editedGrades[grade.grade_id]?.grade || ""}
                        onChange={(e) =>
                          handleGradeChange(grade.grade_id, e.target.value)
                        }
                        style={{ width: "80px" }}
                      />
                    ) : (
                      grade.grade
                    )}
                  </td>
                  <td>
                    {isEditMode
                      ? editedGrades[grade.grade_id]?.remarks || ""
                      : grade.remarks}
                  </td>
                  {exitStatus === "Pending" && (
                    <td>
                      <button onClick={() => handleDeleteGrade(grade.grade_id)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan={exitStatus === "Pending" ? "7" : "6"} style={{ textAlign: "center" }}>
                No specialized subjects found.
              </td>
            </tr>
          )}
        </tbody>
      </table>


      {/* Update GPA Display Section */}
      <div style={{
        marginTop: "30px",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ marginBottom: "15px", color: "#333" }}>Academic Performance</h3>
       
        {/* Show status message when no subjects or incomplete grades */}
        {(!hasAnyGrades() || !academicPerformance?.gpa) && (
          <div style={{
            fontSize: "16px",
            color: "#dc3545",
            fontStyle: "italic",
            marginBottom: "10px"
          }}>
            Pending Grades
          </div>
        )}

        {/* Display academic performance data */}
        {academicPerformance && academicPerformance.gpa && (
          <div style={{ display: "flex", gap: "40px" }}>
            <div>
              <p style={{ fontSize: "16px", marginBottom: "5px" }}>
                <strong>GPA:</strong> {academicPerformance.gpa}
              </p>
              <p style={{ fontSize: "16px", marginBottom: "5px" }}>
                <strong>Remarks:</strong> {academicPerformance.remarks}
              </p>
            </div>
            <div>
              <p style={{
                fontSize: "16px",
                marginBottom: "5px",
              }}>
                <strong>Honors:</strong> {academicPerformance.honors}
              </p>
            </div>
          </div>
        )}
      </div>


      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Add New Subject</h3>
            <Formik
              initialValues={{
                subject_name: "",
                subject_description: "",
                type: "core"
              }}
              onSubmit={handleAddNewSubject}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Subject Name:</label>
                    <Field
                      name="subject_name"
                      type="text"
                      style={{ width: "100%", padding: "5px" }}
                    />
                  </div>


                  <div style={{ marginBottom: "10px" }}>
                    <label>Subject Description:</label>
                    <Field
                      name="subject_description"
                      type="text"
                      style={{ width: "100%", padding: "5px" }}
                    />
                  </div>


                  <div style={{ marginBottom: "10px" }}>
                    <label>Type:</label>
                    <Field as="select" name="type" style={{ width: "100%", padding: "5px" }}>
                      <option value="core">Core</option>
                      <option value="specialized">Specialized</option>
                    </Field>
                  </div>


                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                      marginTop: "20px"
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowAddSubjectModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting}>
                      Add Subject
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}


      {showChecklistModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            {availableSubjects.length === 0 ? (
              <>
                <p>All subjects are already loaded.</p>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={() => setShowChecklistModal(false)}>
                    OK
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Load all these subjects?</h3>


                {/* Select All checkbox */}
                <div style={{ marginBottom: 10 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={
                        selectedSubjects.length === availableSubjects.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubjects(
                            availableSubjects.map((s) => s.value)
                          );
                        } else {
                          setSelectedSubjects([]);
                        }
                      }}
                    />
                    Select All
                  </label>
                </div>


                {/* Subject list */}
                <div
                  style={{
                    maxHeight: 300,
                    overflowY: "auto",
                    marginBottom: 10,
                  }}
                >
                  {availableSubjects.map((subject) => (
                    <div key={subject.value}>
                      <label>
                        <input
                          type="checkbox"
                          value={subject.value}
                          checked={selectedSubjects.includes(subject.value)}
                          onChange={() => handleSubjectCheck(subject.value)}
                        />
                        {subject.label}
                      </label>
                    </div>
                  ))}
                </div>


                {/* Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <button onClick={() => setShowChecklistModal(false)}>
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSubjects}
                    disabled={selectedSubjects.length === 0}
                  >
                    Add Selected
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// Modal styles
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


const modalContentStyle = {
  background: "white",
  padding: 20,
  borderRadius: 8,
  width: 400,
};


export default Grades;



