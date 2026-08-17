import { useCallback, useEffect, useState } from "react";
import {
  addCustomSubject,
  addSubjects,
  deleteGrade,
  fetchAvailableSubjects,
  fetchGradeData,
  fetchStudentGradeContext,
  saveGradeDrafts,
  updateAcademicPerformance,
} from "../services/grades.service";
import {
  buildPerformancePayload,
  createGradeDrafts,
  updateGradeDraft,
} from "../utils/grade.utils";

export default function useGrades(studentId, acadsId) {
  const [student, setStudent] = useState(null);
  const [academicInfo, setAcademicInfo] = useState(null);
  const [grades, setGrades] = useState([]);
  const [academicPerformance, setAcademicPerformance] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedGrades, setEditedGrades] = useState({});
  const [hasLoadedGrades, setHasLoadedGrades] = useState(false);

  const refreshGrades = useCallback(async () => {
    const data = await fetchGradeData(acadsId);
    setGrades(data.grades);
    setAcademicPerformance(data.performance);
    setHasLoadedGrades(true);
    return data.grades;
  }, [acadsId]);

  useEffect(() => {
    let active = true;
    fetchStudentGradeContext(studentId, acadsId)
      .then((data) => {
        if (!active) return;
        setStudent(data.student);
        setAcademicInfo(data.academicInfo);
      })
      .catch((error) => console.error("Failed to fetch student:", error));
    return () => {
      active = false;
    };
  }, [studentId, acadsId]);

  useEffect(() => {
    setHasLoadedGrades(false);
    refreshGrades().catch((error) => console.error("Failed to fetch grades:", error));
  }, [refreshGrades]);

  useEffect(() => {
    if (!hasLoadedGrades) return;
    let active = true;
    const payload = buildPerformancePayload(acadsId, grades);
    updateAcademicPerformance(acadsId, payload)
      .then((performance) => {
        if (active) setAcademicPerformance(performance);
      })
      .catch((error) => console.error("Error updating academic performance:", error));
    return () => {
      active = false;
    };
  }, [grades, acadsId, hasLoadedGrades]);

  const enterEditMode = () => {
    setEditedGrades(createGradeDrafts(grades));
    setIsEditMode(true);
  };

  const cancelEditMode = async () => {
    setIsEditMode(false);
    setEditedGrades({});
    await refreshGrades();
  };

  const changeGrade = (gradeId, value) => {
    setEditedGrades((drafts) => updateGradeDraft(drafts, gradeId, value));
  };

  const saveAll = async () => {
    await saveGradeDrafts(editedGrades);
    await refreshGrades();
    setIsEditMode(false);
  };

  const removeGrade = async (gradeId) => {
    await deleteGrade(gradeId);
    await refreshGrades();
  };

  const loadAvailableSubjects = async () => {
    if (!academicInfo) return [];
    const subjects = await fetchAvailableSubjects(academicInfo, grades);
    setAvailableSubjects(subjects);
    return subjects;
  };

  const addSelectedSubjects = async (curriculumIds) => {
    await addSubjects(acadsId, curriculumIds);
    await refreshGrades();
  };

  const createSubject = async (values) => {
    await addCustomSubject(acadsId, academicInfo, values);
    await refreshGrades();
  };

  return {
    student,
    academicInfo,
    grades,
    academicPerformance,
    availableSubjects,
    isEditMode,
    editedGrades,
    enterEditMode,
    cancelEditMode,
    changeGrade,
    saveAll,
    removeGrade,
    loadAvailableSubjects,
    addSelectedSubjects,
    createSubject,
  };
}
