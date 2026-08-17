import { useCallback, useEffect, useState } from "react";
import {
  deleteAcademicInfo,
  fetchAcademicInfo,
  fetchStudentProfile,
  saveAcademicInfo,
  updateStudentStatus,
} from "../services/studentProfile.service";

export default function useStudentProfile(studentId) {
  const [student, setStudent] = useState({});
  const [academicInfo, setAcademicInfo] = useState([]);
  const [academicSettings, setAcademicSettings] = useState(null);
  const [strands, setStrands] = useState([]);
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let active = true;

    fetchStudentProfile(studentId)
      .then((data) => {
        if (!active) return;
        setStudent(data.student);
        setAcademicInfo(data.academicInfo);
        setAcademicSettings(data.academicSettings);
        setStrands(data.strands);
        setSections(data.sections);
        setDepartments(data.departments);
      })
      .catch((error) => {
        console.error("Error fetching student profile:", error);
        if (active) {
          setFeedback({
            title: "Unable to load student",
            message: "Error loading student information.",
            variant: "error",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [studentId]);

  const refreshAcademicInfo = useCallback(async () => {
    const records = await fetchAcademicInfo(studentId);
    setAcademicInfo(records);
    return records;
  }, [studentId]);

  const removeAcademicRecord = useCallback(async (acadsId) => {
    await deleteAcademicInfo(acadsId);
    setAcademicInfo((records) =>
      records.filter((record) => record.acads_id !== acadsId)
    );
  }, []);

  const persistAcademicRecord = useCallback(
    async (acadsId, data) => {
      await saveAcademicInfo({ acadsId, data });
      return refreshAcademicInfo();
    },
    [refreshAcademicInfo]
  );

  const persistStatus = useCallback(
    async (status) => {
      await updateStudentStatus(studentId, status);
      setStudent((current) => ({ ...current, status }));
    },
    [studentId]
  );

  return {
    student,
    academicInfo,
    academicSettings,
    strands,
    sections,
    departments,
    feedback,
    setFeedback,
    removeAcademicRecord,
    persistAcademicRecord,
    persistStatus,
  };
}
