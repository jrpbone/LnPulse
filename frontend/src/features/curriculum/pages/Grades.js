import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useConfirmation } from "../../../shared/confirmation/ConfirmationContext";
import AcademicPerformanceCard from "../components/AcademicPerformanceCard";
import AddSubjectModal from "../components/AddSubjectModal";
import GradeTable from "../components/GradeTable";
import SubjectChecklistModal from "../components/SubjectChecklistModal";
import useGrades from "../hooks/useGrades";
import { printGrades } from "../utils/printGrades";

function Grades() {
  const { student_id: studentId, acads_id: acadsId } = useParams();
  const location = useLocation();
  const confirmAction = useConfirmation();
  const exitStatus = location.state?.exitStatus || "Pending";
  const {
    student,
    academicInfo,
    grades,
    academicPerformance,
    availableSubjects,
    isEditMode,
    editedGrades,
    enterEditMode,
    cancelEditMode,
    changeGrade,
    saveAll,
    removeGrade,
    loadAvailableSubjects,
    addSelectedSubjects,
    createSubject,
  } = useGrades(studentId, acadsId);

  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const handleOpenChecklist = async () => {
    try {
      const subjects = await loadAvailableSubjects();
      setSelectedSubjects(subjects.map((subject) => subject.value));
      setShowChecklistModal(true);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      alert("Failed to load available subjects.");
    }
  };

  const handleAddSubjects = async () => {
    try {
      await addSelectedSubjects(selectedSubjects);
      setShowChecklistModal(false);
      setSelectedSubjects([]);
    } catch (error) {
      console.error("Failed to add subjects:", error);
      alert("Failed to add some or all subjects.");
    }
  };

  const handleAddCustomSubject = async (values, helpers) => {
    try {
      await createSubject(values);
      helpers.resetForm();
      setShowAddSubjectModal(false);
    } catch (error) {
      console.error("Failed to add subject:", error);
      alert(error.response?.data?.error || "Failed to add subject");
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const handleDeleteGrade = async (gradeId) => {
    const confirmed = await confirmAction({
      title: "Delete this grade?",
      message: "The recorded grade will be permanently removed.",
      confirmLabel: "Delete grade",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await removeGrade(gradeId);
    } catch (error) {
      console.error("Failed to delete grade:", error);
      alert("Failed to delete grade.");
    }
  };

  const handleSaveAll = async () => {
    try {
      await saveAll();
    } catch (error) {
      console.error("Failed to update grades:", error);
      alert("Failed to update some or all grades.");
    }
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

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <button onClick={handleOpenChecklist}>Load Subjects</button>
          <button onClick={() => setShowAddSubjectModal(true)}>Add Subject</button>
          {exitStatus === "Pending" && !isEditMode && (
            <button onClick={enterEditMode} style={{ marginLeft: "10px" }}>Edit Grades</button>
          )}
          {isEditMode && (
            <>
              <button onClick={handleSaveAll} style={{ marginLeft: "10px", backgroundColor: "#4CAF50", color: "white" }}>
                Save All Changes
              </button>
              <button onClick={cancelEditMode} style={{ marginLeft: "10px" }}>Cancel</button>
            </>
          )}
        </div>
        <button
          onClick={() => printGrades({ student, academicInfo, grades, academicPerformance })}
          style={{ marginLeft: "10px" }}
        >
          Print Grades
        </button>
      </div>

      <GradeTable
        title="Core Subjects"
        type="core"
        grades={grades}
        exitStatus={exitStatus}
        isEditMode={isEditMode}
        editedGrades={editedGrades}
        onGradeChange={changeGrade}
        onDelete={handleDeleteGrade}
      />
      <GradeTable
        title="Specialized Subjects"
        type="specialized"
        grades={grades}
        exitStatus={exitStatus}
        isEditMode={isEditMode}
        editedGrades={editedGrades}
        onGradeChange={changeGrade}
        onDelete={handleDeleteGrade}
      />
      <AcademicPerformanceCard grades={grades} performance={academicPerformance} />

      <AddSubjectModal
        open={showAddSubjectModal}
        onClose={() => setShowAddSubjectModal(false)}
        onSubmit={handleAddCustomSubject}
      />
      <SubjectChecklistModal
        open={showChecklistModal}
        subjects={availableSubjects}
        selectedSubjects={selectedSubjects}
        onSelectionChange={setSelectedSubjects}
        onClose={() => setShowChecklistModal(false)}
        onSubmit={handleAddSubjects}
      />
    </div>
  );
}

export default Grades;
