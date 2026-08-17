import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiBookOpen } from "react-icons/fi";
import { useAuth } from "../../../core/auth";
import { useConfirmation } from "../../../shared/confirmation/ConfirmationContext";
import WorkspacePageHeader from "../../../shared/components/WorkspacePageHeader";
import AcademicInfoModal from "../components/AcademicInfoModal";
import AcademicRecordsTable from "../components/AcademicRecordsTable";
import FeedbackModal from "../components/FeedbackModal";
import StudentProfileOverview from "../components/StudentProfileOverview";
import StudentStatusModal from "../components/StudentStatusModal";
import useStudentProfile from "../hooks/useStudentProfile";
import {
  buildAcademicInfoPayload,
  getNewAcademicRecordBlockMessage,
  isDuplicateAcademicInfo,
  toEditableAcademicInfo,
} from "../utils/studentProfile.utils";
import { printStudentProfile } from "../utils/printStudentProfile";
import "./student.css";
import "./StudentExperience.css";

function Student() {
  const { student_id: studentId } = useParams();
  const navigate = useNavigate();
  const { privileges } = useAuth();
  const confirmAction = useConfirmation();
  const {
    student,
    academicInfo,
    academicSettings,
    strands,
    sections,
    departments,
    feedback,
    setFeedback,
    removeAcademicRecord,
    persistAcademicRecord,
    persistStatus,
  } = useStudentProfile(studentId);

  const [showAcademicModal, setShowAcademicModal] = useState(false);
  const [editingInfo, setEditingInfo] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const closeAcademicModal = () => {
    setShowAcademicModal(false);
    setEditingInfo(null);
  };

  const handleAddAcademicInfo = () => {
    const blockMessage = getNewAcademicRecordBlockMessage(academicInfo);
    if (blockMessage) {
      setFeedback({ title: "Academic record unavailable", message: blockMessage, variant: "error" });
      return;
    }
    setEditingInfo(null);
    setShowAcademicModal(true);
  };

  const handleEditAcademicInfo = (record) => {
    setEditingInfo(toEditableAcademicInfo(record));
    setShowAcademicModal(true);
  };

  const handleDeleteAcademicInfo = async (acadsId) => {
    const confirmed = await confirmAction({
      title: "Delete this academic record?",
      message: "The selected academic record will be permanently removed from this student.",
      confirmLabel: "Delete record",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await removeAcademicRecord(acadsId);
    } catch (error) {
      console.error("Delete failed:", error);
      setFeedback({ title: "Delete failed", message: "Failed to delete the academic record.", variant: "error" });
    }
  };

  const handleSaveAcademicInfo = async (values, resetForm) => {
    if (!editingInfo && isDuplicateAcademicInfo(academicInfo, values)) {
      setFeedback({ title: "Duplicate record", message: "This academic record already exists!", variant: "error" });
      return;
    }

    const payload = buildAcademicInfoPayload({
      values,
      studentId,
      canEditStudents: privileges?.canEditStudents,
      isEditing: Boolean(editingInfo),
    });

    try {
      await persistAcademicRecord(editingInfo?.acads_id, payload);
      setFeedback({
        title: "Success",
        message: editingInfo
          ? "Academic information updated successfully!"
          : "Academic information added successfully!",
      });
      resetForm();
      closeAcademicModal();
    } catch (error) {
      console.error("Academic record save failed:", error);
      setFeedback({
        title: "Save failed",
        message: editingInfo
          ? "Failed to update academic information."
          : "Failed to add academic information.",
        variant: "error",
      });
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await persistStatus(selectedStatus);
      setSelectedStatus("");
      setFeedback({ title: "Success", message: "Student status updated successfully!" });
    } catch (error) {
      console.error("Error updating status:", error);
      setFeedback({ title: "Status update failed", message: "Failed to update student status.", variant: "error" });
    }
  };

  return (
    <div className="container workspace-page student-details-page details_main">
      <FeedbackModal feedback={feedback} onClose={() => setFeedback(null)} />
      <StudentStatusModal
        student={student}
        selectedStatus={selectedStatus}
        onChange={setSelectedStatus}
        onClose={() => setSelectedStatus("")}
        onSave={handleStatusUpdate}
      />
      <AcademicInfoModal
        open={showAcademicModal}
        editingInfo={editingInfo}
        student={student}
        academicSettings={academicSettings}
        privileges={privileges}
        departments={departments}
        strands={strands}
        sections={sections}
        onClose={closeAcademicModal}
        onSubmit={handleSaveAcademicInfo}
      />

      <WorkspacePageHeader
        eyebrow="Student records"
        title="Student profile"
        description="Review personal information, family contacts, addresses, and academic history."
      />

      <div className="student-record-content">
        <StudentProfileOverview
          student={student}
          canEditStudents={privileges?.canEditStudents}
          onAddAcademicInfo={handleAddAcademicInfo}
          onEditStudent={() => navigate("/EditStudent", { state: { studentData: student } })}
          onOpenStatus={() => setSelectedStatus(student.status || "active")}
          onPrint={() => printStudentProfile(student, academicInfo)}
        />

        <div className="student-academic-heading">
          <div>
            <span className="student-academic-icon"><FiBookOpen /></span>
            <div><h3>Academic Information</h3><p>Enrollment history, progression status, and grade records</p></div>
          </div>
          <span className="collection-count">{academicInfo.length}</span>
        </div>
        <AcademicRecordsTable
          records={academicInfo}
          privileges={privileges}
          onEdit={handleEditAcademicInfo}
          onDelete={handleDeleteAcademicInfo}
          onViewGrades={(record) =>
            navigate(`/Student/${studentId}/grades/${record.acads_id}`, {
              state: { exitStatus: record.exitStatus },
            })
          }
        />
      </div>
    </div>
  );
}

export default Student;
