import apiClient from "../../../shared/api/client";

export async function fetchStudentProfile(studentId) {
  const [student, academicInfo, academicSettings, strands, sections, departments] =
    await Promise.all([
      apiClient.get(`/students/byId/${studentId}`),
      apiClient.get(`/academicInfo/byStudent/${studentId}`),
      apiClient.get("/academicSettings/current"),
      apiClient.get("/strands"),
      apiClient.get("/sections"),
      apiClient.get("/departments"),
    ]);

  return {
    student: student.data,
    academicInfo: academicInfo.data,
    academicSettings: academicSettings.data,
    strands: strands.data,
    sections: sections.data,
    departments: departments.data,
  };
}

export async function fetchAcademicInfo(studentId) {
  const response = await apiClient.get(`/academicInfo/byStudent/${studentId}`);
  return response.data;
}

export async function deleteAcademicInfo(acadsId) {
  await apiClient.delete(`/academicInfo/${acadsId}`);
}

export async function saveAcademicInfo({ acadsId, data }) {
  if (acadsId) {
    await apiClient.put(`/academicInfo/${acadsId}`, data);
    return;
  }

  await apiClient.post("/academicInfo", data);
}

export async function updateStudentStatus(studentId, status) {
  await apiClient.put(`/students/status/${studentId}`, { status });
}
