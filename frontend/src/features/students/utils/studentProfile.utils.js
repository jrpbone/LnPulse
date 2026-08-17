import * as Yup from "yup";

export const academicInfoSchema = Yup.object().shape({
  gradeLevel: Yup.string().required("Required"),
  schoolYear: Yup.string().required("Required"),
  semester: Yup.string().required("Required"),
  entryStatus: Yup.string().required("Required"),
  strand_id: Yup.string().required("Required"),
  section_id: Yup.string().required("Required"),
  department_id: Yup.string().required("Required"),
});

export function toEditableAcademicInfo(info) {
  return {
    acads_id: info.acads_id,
    gradeLevel: info.gradeLevel,
    schoolYear: info.schoolYear,
    semester: info.semester,
    entryStatus: info.entryStatus,
    exitStatus: info.exitStatus,
    strand_id: info.strand_id || info.STRAND_T?.strand_id,
    section_id: info.section_id || info.SECTION_T?.section_id,
    department_id: info.department_id || info.DEPARTMENT_T?.department_id,
    ACADEMIC_PERFORMANCE_Ts: info.ACADEMIC_PERFORMANCE_Ts,
  };
}

export function getNewAcademicRecordBlockMessage(records) {
  if (!records?.length) return null;

  const latestRecord = records[records.length - 1];
  if (latestRecord.exitStatus === "Pending") {
    return "Cannot add new academic info. The student's latest academic record is still pending.";
  }
  if (latestRecord.exitStatus === "Graduated") {
    return "Cannot add new academic info. The student has already graduated.";
  }
  return null;
}

export function filterSections(sections, gradeLevel, strandId) {
  if (!gradeLevel || !strandId) return [];

  return sections.filter(
    (section) =>
      Number(section.strand_id) === Number(strandId) &&
      Number(section.grade_level) === Number(gradeLevel)
  );
}

export function isDuplicateAcademicInfo(records, values) {
  return records.some(
    (record) =>
      record.gradeLevel === values.gradeLevel &&
      record.schoolYear === values.schoolYear &&
      record.semester === values.semester &&
      Number(record.department_id) === Number(values.department_id) &&
      Number(record.strand_id) === Number(values.strand_id) &&
      Number(record.section_id) === Number(values.section_id)
  );
}

export function buildAcademicInfoPayload({ values, studentId, canEditStudents, isEditing }) {
  if (!canEditStudents) {
    return { exitStatus: values.exitStatus };
  }

  return {
    ...values,
    student_id: studentId,
    department_id: Number(values.department_id),
    strand_id: Number(values.strand_id),
    section_id: Number(values.section_id),
    exitStatus: isEditing ? values.exitStatus : "Pending",
  };
}

export function formatAddress(address) {
  if (!address) return "N/A";
  return [
    address.houseNo,
    address.street_barangay,
    address.city_municipality,
    address.province,
  ]
    .filter(Boolean)
    .join(", ");
}

export function formatStudentName(student, includeSuffix = true) {
  return [
    student?.first_name,
    student?.middle_name,
    student?.last_name,
    includeSuffix ? student?.suffix : null,
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatRecordDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
