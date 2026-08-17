import { formatAddress, formatStudentName } from "./studentProfile.utils";

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const infoItem = (label, value) =>
  `<div class="info-item"><span class="label">${label}:</span> ${escapeHtml(value || "N/A")}</div>`;

export function printStudentProfile(student, academicInfo) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const guardian = student.PARENT_GUARDIAN_T;
  const academicRows = academicInfo
    .map(
      (record) => `<tr>
        <td>${escapeHtml(record.DEPARTMENT_T?.department_name)}</td>
        <td>${escapeHtml(record.STRAND_T?.strand_name)}</td>
        <td>${escapeHtml(record.gradeLevel)}</td>
        <td>${escapeHtml(record.SECTION_T?.section_name)}</td>
        <td>${escapeHtml(record.schoolYear)}</td>
        <td>${escapeHtml(record.semester)}</td>
        <td>${escapeHtml(record.entryStatus)}</td>
        <td>${escapeHtml(record.exitStatus)}</td>
      </tr>`
    )
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Student Details</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; background: #f5f5f5; padding: 5px; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .info-item { margin-bottom: 5px; }
          .label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
          @media print { body { padding: 0; } button { display: none; } @page { margin: .5cm; size: auto; } }
        </style>
      </head>
      <body>
        <div class="header"><h1>Student Information</h1><p>LNHS Student Information System</p></div>
        <div class="section">
          <div class="section-title">Personal Information</div>
          <div class="info-grid">
            ${infoItem("LRN", student.student_id)}
            ${infoItem("Name", formatStudentName(student))}
            ${infoItem("Birth Date", student.birth_date)}
            ${infoItem("Place of Birth", student.place_of_birth)}
            ${infoItem("Age", student.age)}
            ${infoItem("Gender", student.sex)}
            ${infoItem("Contact", student.contact_num)}
            ${infoItem("Email", student.email)}
            ${infoItem("Religion", student.religion)}
            ${infoItem("Height", student.height)}
            ${infoItem("Weight", student.weight)}
            ${infoItem("BMI", student.bmi)}
            ${infoItem("Nationality", student.nationality)}
          </div>
        </div>
        <div class="section">
          <div class="section-title">Guardian Information</div>
          <div class="info-grid">
            ${infoItem("Guardian Name", guardian ? [guardian.pgLastName, guardian.pgFirstName, guardian.pgMiddleName].filter(Boolean).join(" ") : "N/A")}
            ${infoItem("Contact Number", guardian?.pgContactNum)}
          </div>
        </div>
        <div class="section">
          <div class="section-title">Address Information</div>
          ${infoItem("Current Address", formatAddress(student.currentAddressData))}
          ${infoItem("Permanent Address", formatAddress(student.permanentAddressData))}
        </div>
        <div class="section">
          <div class="section-title">Academic Information</div>
          <table>
            <thead><tr><th>Department</th><th>Strand</th><th>Grade Level</th><th>Section</th><th>School Year</th><th>Semester</th><th>Entry Status</th><th>Exit Status</th></tr></thead>
            <tbody>${academicRows}</tbody>
          </table>
        </div>
        <button onclick="window.print()">Print</button>
      </body>
    </html>
  `);
  printWindow.document.close();
}
