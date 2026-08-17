function AcademicPerformanceCard({ grades, performance }) {
  return (
    <section
      style={{
        marginTop: "30px",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ marginBottom: "15px", color: "#333" }}>Academic Performance</h3>
      {(!grades.length || !performance?.gpa) && (
        <div style={{ fontSize: "16px", color: "#dc3545", fontStyle: "italic", marginBottom: "10px" }}>
          {performance?.remarks || "Pending Grades"}
        </div>
      )}
      {performance?.gpa && (
        <div style={{ display: "flex", gap: "40px" }}>
          <div>
            <p style={{ fontSize: "16px", marginBottom: "5px" }}><strong>GPA:</strong> {performance.gpa}</p>
            <p style={{ fontSize: "16px", marginBottom: "5px" }}><strong>Remarks:</strong> {performance.remarks}</p>
          </div>
          <p style={{ fontSize: "16px", marginBottom: "5px" }}><strong>Honors:</strong> {performance.honors}</p>
        </div>
      )}
    </section>
  );
}

export default AcademicPerformanceCard;
