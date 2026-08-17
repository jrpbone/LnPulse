import {
  buildAcademicInfoPayload,
  filterSections,
  getNewAcademicRecordBlockMessage,
  isDuplicateAcademicInfo,
} from "../studentProfile.utils";

describe("student profile utilities", () => {
  test("blocks progression while the latest record is pending", () => {
    expect(
      getNewAcademicRecordBlockMessage([{ exitStatus: "Completed" }, { exitStatus: "Pending" }])
    ).toContain("still pending");
  });

  test("filters sections by strand and grade level", () => {
    const sections = [
      { section_id: 1, strand_id: 2, grade_level: "11" },
      { section_id: 2, strand_id: 2, grade_level: "12" },
      { section_id: 3, strand_id: 3, grade_level: "11" },
    ];
    expect(filterSections(sections, "11", "2")).toEqual([sections[0]]);
  });

  test("builds a restricted adviser update", () => {
    expect(
      buildAcademicInfoPayload({
        values: { exitStatus: "Completed", gradeLevel: "11" },
        studentId: "123",
        canEditStudents: false,
        isEditing: true,
      })
    ).toEqual({ exitStatus: "Completed" });
  });

  test("detects the same academic placement", () => {
    const values = {
      gradeLevel: "11",
      schoolYear: "2026-2027",
      semester: "1st Semester",
      department_id: "1",
      strand_id: "2",
      section_id: "3",
    };
    expect(
      isDuplicateAcademicInfo(
        [{ ...values, department_id: 1, strand_id: 2, section_id: 3 }],
        values
      )
    ).toBe(true);
  });
});
