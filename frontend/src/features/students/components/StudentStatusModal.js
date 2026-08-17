import { FiCheckCircle, FiRefreshCw, FiSave, FiSlash, FiX } from "react-icons/fi";
import { formatStudentName } from "../utils/studentProfile.utils";

function StudentStatusModal({ student, selectedStatus, onChange, onClose, onSave }) {
  if (!selectedStatus) return null;

  const initials = `${student.first_name?.charAt(0) || ""}${
    student.last_name?.charAt(0) || ""
  }`.toUpperCase();

  return (
    <div
      className="modal-overlay student-status-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-status-title"
    >
      <div className="modal-content student-status-modal">
        <header className="student-status-header">
          <div className="student-status-header-icon"><FiRefreshCw /></div>
          <div>
            <p>Enrollment record</p>
            <h3 id="student-status-title">Update student status</h3>
            <span>Choose whether this learner should appear as active or inactive.</span>
          </div>
          <button type="button" className="student-status-close" onClick={onClose} aria-label="Close status dialog">
            <FiX />
          </button>
        </header>
        <div className="student-status-body">
          <div className="student-status-identity">
            <span className="student-status-avatar">{initials}</span>
            <div><strong>{formatStudentName(student, false)}</strong><span>LRN {student.student_id}</span></div>
            <span className={`status-badge status-${student.status || "active"}`}>
              Currently {student.status || "active"}
            </span>
          </div>
          <fieldset className="student-status-options">
            <legend>New status</legend>
            <label className={`student-status-option active ${selectedStatus === "active" ? "selected" : ""}`}>
              <input type="radio" name="student-status" value="active" checked={selectedStatus === "active"} onChange={(event) => onChange(event.target.value)} />
              <span className="student-status-option-icon"><FiCheckCircle /></span>
              <span className="student-status-option-copy"><strong>Active</strong><small>The learner remains visible in active student records.</small></span>
              <span className="student-status-radio" aria-hidden="true" />
            </label>
            <label className={`student-status-option inactive ${selectedStatus === "inactive" ? "selected" : ""}`}>
              <input type="radio" name="student-status" value="inactive" checked={selectedStatus === "inactive"} onChange={(event) => onChange(event.target.value)} />
              <span className="student-status-option-icon"><FiSlash /></span>
              <span className="student-status-option-copy"><strong>Inactive</strong><small>The learner is retained but removed from active listings.</small></span>
              <span className="student-status-radio" aria-hidden="true" />
            </label>
          </fieldset>
          <div className="student-status-note"><FiRefreshCw /><span>This changes record visibility only; academic history will not be deleted.</span></div>
        </div>
        <footer className="student-status-actions">
          <button type="button" className="student-status-cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="student-status-save" onClick={onSave}>
            <FiSave /> Save status
          </button>
        </footer>
      </div>
    </div>
  );
}

export default StudentStatusModal;
