const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const gradeRows = (grades, type) =>
  grades
    .filter((grade) => grade.type === type)
    .map(
      (grade) => `<tr>
        <td>${escapeHtml(grade.subject_name)}</td>
        <td>${escapeHtml(grade.subject_description)}</td>
        <td>${escapeHtml(grade.grade || "N/A")}</td>
        <td>${escapeHtml(grade.remarks || "N/A")}</td>
      </tr>`
    )
    .join("");

const gradeTable = (title, rows) => `
  <div class="section">
    <div class="section-title">${title}</div>
    <table>
      <thead><tr><th>Subject</th><th>Description</th><th>Grade</th><th>Remarks</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;

export function printGrades({ student, academicInfo, grades, academicPerformance }) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const performance = academicPerformance?.gpa
    ? `<p><strong>GPA:</strong> ${escapeHtml(academicPerformance.gpa)}</p>
       <p><strong>Remarks:</strong> ${escapeHtml(academicPerformance.remarks)}</p>
       <p><strong>Honors:</strong> ${escapeHtml(academicPerformance.honors)}</p>`
    : `<p class="pending">${escapeHtml(academicPerformance?.remarks || "Pending Grades")}</p>`;

  printWindow.document.write(`
    <html>
      <head>
        <title>Student Grades</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; background: #f5f5f5; padding: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          .performance { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
          .pending { color: #dc3545; font-style: italic; }
          @media print { body { padding: 0; } button { display: none; } @page { margin: .5cm; size: auto; } }
        </style>
      </head>
      <body>
        <div class="header"><h1>Student Grades</h1><p>LNHS Student Information System</p></div>
        <div class="section">
          <h2>Student Information</h2>
          <p><strong>Name:</strong> ${escapeHtml(student?.full_name)}</p>
          <p><strong>Grade Level:</strong> ${escapeHtml(academicInfo?.gradeLevel)}</p>
          <p><strong>Strand:</strong> ${escapeHtml(academicInfo?.STRAND_T?.strand_name)}</p>
          <p><strong>Section:</strong> ${escapeHtml(academicInfo?.SECTION_T?.section_name)}</p>
          <p><strong>School Year:</strong> ${escapeHtml(academicInfo?.schoolYear)}</p>
          <p><strong>Semester:</strong> ${escapeHtml(academicInfo?.semester)}</p>
        </div>
        ${gradeTable("Core Subjects", gradeRows(grades, "core"))}
        ${gradeTable("Specialized Subjects", gradeRows(grades, "specialized"))}
        <div class="performance"><h3>Academic Performance</h3>${performance}</div>
        <button onclick="window.print()">Print</button>
      </body>
    </html>
  `);
  printWindow.document.close();
}
