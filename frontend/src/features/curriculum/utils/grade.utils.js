export function formatGrades(items) {
  return items.map((item) => ({
    curriculum_id: item.curriculum_id,
    subject_name: item.CURRICULUM_T?.subject_name,
    subject_description: item.CURRICULUM_T?.subject_description,
    type: item.CURRICULUM_T?.type,
    grade: item.grade,
    remarks: item.grade_remarks,
    grade_id: item.grade_id,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    CURRICULUM_T: item.CURRICULUM_T,
  }));
}

export function formatStudent(student) {
  const middleInitial = student.middle_name ? `${student.middle_name.charAt(0)}.` : "";
  return {
    ...student,
    full_name: `${student.last_name}, ${student.first_name} ${middleInitial} ${
      student.suffix || ""
    }`
      .replace(/\s+/g, " ")
      .trim(),
  };
}

export function computeGPA(grades) {
  if (!grades?.length) {
    return { isComplete: false, message: "No Available Grades" };
  }

  const hasIncompleteGrades = grades.some((grade) => {
    const value = Number.parseFloat(grade.grade);
    return grade.grade === null || grade.grade === "" || Number.isNaN(value) || value === 0;
  });
  if (hasIncompleteGrades) {
    return { isComplete: false, message: "Incomplete Grades" };
  }

  const average =
    grades.reduce((total, grade) => total + Number.parseFloat(grade.grade), 0) /
    grades.length;
  let honors = "No Honors";
  if (average >= 98) honors = "With Highest Honors";
  else if (average >= 95) honors = "With High Honors";
  else if (average >= 90) honors = "With Honors";

  const failedCore = grades.filter(
    (grade) => grade.type === "core" && Number.parseFloat(grade.grade) < 75
  ).length;
  const failedSpecialized = grades.filter(
    (grade) => grade.type === "specialized" && Number.parseFloat(grade.grade) < 75
  ).length;

  let remarks = "Passed";
  if (failedCore && failedSpecialized) {
    remarks = `Failed ${failedCore} core subject${failedCore > 1 ? "s" : ""} and ${failedSpecialized} specialized subject${failedSpecialized > 1 ? "s" : ""}`;
  } else if (failedCore) {
    remarks = `Failed ${failedCore} core subject${failedCore > 1 ? "s" : ""}`;
  } else if (failedSpecialized) {
    remarks = `Failed ${failedSpecialized} specialized subject${failedSpecialized > 1 ? "s" : ""}`;
  }

  return { isComplete: true, gpa: average.toFixed(2), honors, remarks, message: "" };
}

export function buildPerformancePayload(acadsId, grades) {
  const result = computeGPA(grades);
  return result.isComplete
    ? {
        acads_id: Number(acadsId),
        gpa: Number.parseFloat(result.gpa),
        honors: result.honors,
        remarks: result.remarks,
      }
    : {
        acads_id: Number(acadsId),
        gpa: null,
        honors: null,
        remarks: result.message === "No Available Grades" ? "Pending Grades" : result.message,
      };
}

export function createGradeDrafts(grades) {
  return Object.fromEntries(
    grades.map((grade) => [
      grade.grade_id,
      { grade: grade.grade || "", remarks: grade.remarks || "" },
    ])
  );
}

export function updateGradeDraft(drafts, gradeId, value) {
  const numericValue = Number.parseFloat(value);
  const remarks =
    !Number.isNaN(numericValue) && numericValue > 0
      ? numericValue >= 75
        ? "Passed"
        : "Failed"
      : "";

  return {
    ...drafts,
    [gradeId]: { grade: value === "" ? null : value, remarks },
  };
}

export function formatGradeDate(value) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
