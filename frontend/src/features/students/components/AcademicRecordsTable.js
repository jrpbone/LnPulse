import { FiBookOpen, FiEdit3, FiEye, FiTrash2 } from "react-icons/fi";
import { formatRecordDate } from "../utils/studentProfile.utils";

function AcademicRecordsTable({
  records,
  privileges,
  onEdit,
  onDelete,
  onViewGrades,
}) {
  return (
    <div className="student-academic-table-wrap">
      <table className="student-academic-table">
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
          {records.length === 0 ? (
            <tr>
              <td colSpan="12">
                <div className="collection-empty">
                  <FiBookOpen />
                  <strong>No academic records yet</strong>
                  <span>Add an academic record to begin tracking enrollment history.</span>
                </div>
              </td>
            </tr>
          ) : (
            records.map((record) => {
              const performance = record.ACADEMIC_PERFORMANCE_Ts?.[0];
              return (
                <tr key={record.acads_id}>
                  <td>{formatRecordDate(record.createdAt)}</td>
                  <td>{formatRecordDate(record.updatedAt)}</td>
                  <td>{record.DEPARTMENT_T?.department_name}</td>
                  <td>{record.STRAND_T?.strand_name}</td>
                  <td>{record.gradeLevel}</td>
                  <td>{record.SECTION_T?.section_name}</td>
                  <td>{record.schoolYear}</td>
                  <td>{record.semester}</td>
                  <td>{record.entryStatus}</td>
                  <td>{record.exitStatus}</td>
                  <td style={{ color: performance ? "#333" : "#dc3545" }}>
                    {performance?.remarks || "Pending Grades"}
                  </td>
                  <td>
                    <div className="instance-actions">
                      {privileges?.canManageStudents && (
                        <button
                          onClick={() => onEdit(record)}
                          className="instance-action edit"
                          title={privileges?.canEditStudents ? "Edit academic record" : "Update exit status"}
                          aria-label={privileges?.canEditStudents ? "Edit academic record" : "Update exit status"}
                        >
                          <FiEdit3 />
                        </button>
                      )}
                      {privileges?.canEditStudents && (
                        <button
                          onClick={() => onDelete(record.acads_id)}
                          className="instance-action delete"
                          title="Delete academic record"
                          aria-label="Delete academic record"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                      <button
                        onClick={() => onViewGrades(record)}
                        className="instance-action view"
                        title="View grades"
                        aria-label="View grades"
                      >
                        <FiEye />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AcademicRecordsTable;
