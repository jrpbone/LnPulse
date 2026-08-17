import { formatGradeDate } from "../utils/grade.utils";

const tableStyle = { width: "100%", borderCollapse: "collapse", marginBottom: "30px" };

function GradeTable({
  title,
  type,
  grades,
  exitStatus,
  isEditMode,
  editedGrades,
  onGradeChange,
  onDelete,
}) {
  const matchingGrades = grades.filter((grade) => grade.type === type);
  return (
    <section>
      <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>{title}</h3>
      <table border="1" cellPadding="10" style={tableStyle}>
        <thead>
          <tr>
            <th>Date Created</th><th>Date Updated</th><th>Subject</th><th>Description</th><th>Grade</th><th>Remarks</th>
            {exitStatus === "Pending" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {matchingGrades.length ? (
            matchingGrades.map((grade) => {
              const draft = editedGrades[grade.grade_id];
              return (
                <tr key={grade.grade_id}>
                  <td>{formatGradeDate(grade.createdAt)}</td>
                  <td>{formatGradeDate(grade.updatedAt)}</td>
                  <td>{grade.subject_name}</td>
                  <td>{grade.subject_description}</td>
                  <td>
                    {isEditMode ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={draft?.grade ?? grade.grade ?? ""}
                        onChange={(event) => onGradeChange(grade.grade_id, event.target.value)}
                        style={{ width: "80px" }}
                      />
                    ) : (
                      grade.grade
                    )}
                  </td>
                  <td>{isEditMode ? draft?.remarks ?? grade.remarks ?? "" : grade.remarks}</td>
                  {exitStatus === "Pending" && (
                    <td><button onClick={() => onDelete(grade.grade_id)}>Delete</button></td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={exitStatus === "Pending" ? 7 : 6} style={{ textAlign: "center" }}>
                No {type} subjects found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default GradeTable;
