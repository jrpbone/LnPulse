import {
  FiEdit3,
  FiMapPin,
  FiPlus,
  FiPrinter,
  FiRefreshCw,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import {
  formatAddress,
  formatStudentName,
} from "../utils/studentProfile.utils";

function StudentProfileOverview({
  student,
  canEditStudents,
  onAddAcademicInfo,
  onEditStudent,
  onOpenStatus,
  onPrint,
}) {
  const initials = `${student.first_name?.charAt(0) || ""}${
    student.last_name?.charAt(0) || ""
  }`.toUpperCase();

  return (
    <div className="details-section">
      <div className="student-profile-hero">
        <div className="student-profile-identity">
          <span className="student-profile-avatar">{initials}</span>
          <div>
            <span className="student-profile-kicker">Learner profile</span>
            <h2>{formatStudentName(student)}</h2>
            <div className="student-profile-meta">
              <span>LRN {student.student_id}</span>
              <span className={`status-badge status-${student.status || "active"}`}>
                {student.status || "active"}
              </span>
            </div>
          </div>
        </div>
        <div className="student-profile-actions">
          {canEditStudents && (
            <button onClick={onAddAcademicInfo} className="student-action primary">
              <FiPlus /> Add academics
            </button>
          )}
          {canEditStudents && (
            <button onClick={onEditStudent} className="student-action">
              <FiEdit3 /> Edit details
            </button>
          )}
          {canEditStudents && (
            <button onClick={onOpenStatus} className="student-action">
              <FiRefreshCw /> Update status
            </button>
          )}
          <button onClick={onPrint} className="student-action">
            <FiPrinter /> Print
          </button>
        </div>
      </div>

      <div className="section">
        <div className="section-title"><FiUser /> Personal Information</div>
        <div className="details-info-grid">
          <p><strong>Date of Birth:</strong> {student.birth_date}</p>
          <p><strong>Place of Birth:</strong> {student.place_of_birth}</p>
          <p><strong>Age:</strong> {student.age}</p>
          <p><strong>Gender:</strong> {student.sex}</p>
          <p><strong>Contact Number:</strong> {student.contact_num}</p>
          <p><strong>Email:</strong> {student.email}</p>
          <p><strong>Religion:</strong> {student.religion}</p>
          <p><strong>Height:</strong> {student.height}</p>
          <p><strong>Weight:</strong> {student.weight}</p>
          <p><strong>BMI:</strong> {student.bmi}</p>
          <p><strong>Nationality:</strong> {student.nationality}</p>
        </div>
      </div>

      <div className="section">
        <div className="section-title"><FiMapPin /> Address Information</div>
        <div className="details-info-grid">
          <p><strong>Current Address:</strong> {formatAddress(student.currentAddressData)}</p>
          <p><strong>Permanent Address:</strong> {formatAddress(student.permanentAddressData)}</p>
        </div>
      </div>

      <div className="section">
        <div className="section-title"><FiUsers /> Guardian Information</div>
        <div className="details-info-grid">
          <p>
            <strong>Guardian: </strong>
            {student.PARENT_GUARDIAN_T
              ? [
                  student.PARENT_GUARDIAN_T.pgLastName,
                  student.PARENT_GUARDIAN_T.pgFirstName,
                  student.PARENT_GUARDIAN_T.pgMiddleName,
                ]
                  .filter(Boolean)
                  .join(" ")
              : "N/A"}
          </p>
          <p><strong>Contact Number: </strong>{student.PARENT_GUARDIAN_T?.pgContactNum || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}

export default StudentProfileOverview;
