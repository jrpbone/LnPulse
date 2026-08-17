import apiClient from "../../../shared/api/client";
import { formatGrades, formatStudent } from "../utils/grade.utils";

export async function fetchStudentGradeContext(studentId, acadsId) {
  const [studentResponse, academicResponse] = await Promise.all([
    apiClient.get(`/students/byId/${studentId}`),
    apiClient.get(`/academicInfo/byStudent/${studentId}`),
  ]);

  return {
    student: formatStudent(studentResponse.data),
    academicInfo: academicResponse.data.find(
      (record) => Number(record.acads_id) === Number(acadsId)
    ),
  };
}

export async function fetchGradeData(acadsId) {
  const [gradesResponse, performanceResponse] = await Promise.all([
    apiClient.get(`/grades/byAcads/${acadsId}`),
    apiClient.get(`/academicPerformance/${acadsId}`),
  ]);
  return {
    grades: formatGrades(gradesResponse.data),
    performance: performanceResponse.data,
  };
}

export async function updateAcademicPerformance(acadsId, payload) {
  const response = await apiClient.put(`/academicPerformance/${acadsId}`, payload);
  return response.data;
}

export async function saveGradeDrafts(drafts) {
  await Promise.all(
    Object.entries(drafts).map(([gradeId, data]) =>
      apiClient.put(`/grades/${gradeId}`, {
        grade: data.grade,
        grade_remarks: data.remarks,
      })
    )
  );
}

export async function deleteGrade(gradeId) {
  await apiClient.delete(`/grades/${gradeId}`);
}

export async function fetchAvailableSubjects(academicInfo, existingGrades) {
  const response = await apiClient.get(`/curriculum/byStrand/${academicInfo.strand_id}`);
  const semesterSubjects = response.data?.[academicInfo.gradeLevel]?.[academicInfo.semester];
  const subjects = [...(semesterSubjects?.core || []), ...(semesterSubjects?.specialized || [])];
  return subjects
    .filter(
      (subject) =>
        !existingGrades.some((grade) => grade.curriculum_id === subject.curriculum_id)
    )
    .map((subject) => ({ value: subject.curriculum_id, label: subject.subject_name }));
}

export async function addSubjects(acadsId, curriculumIds) {
  await Promise.all(
    curriculumIds.map((curriculumId) =>
      apiClient.post("/grades", {
        acads_id: Number(acadsId),
        curriculum_id: Number(curriculumId),
        grade: "",
        grade_remarks: "",
      })
    )
  );
}

export async function addCustomSubject(acadsId, academicInfo, values) {
  const curriculumResponse = await apiClient.post("/curriculum/assign", {
    strand_id: academicInfo.strand_id,
    subject_name: values.subject_name,
    subject_description: values.subject_description,
    grade_level: academicInfo.gradeLevel,
    semester: academicInfo.semester,
    type: values.type || "core",
    isRegular: false,
  });

  if (curriculumResponse.data) {
    await apiClient.post("/grades", {
      acads_id: acadsId,
      curriculum_id: curriculumResponse.data.curriculum_id,
      grade: "",
      grade_remarks: "",
    });
  }
}
