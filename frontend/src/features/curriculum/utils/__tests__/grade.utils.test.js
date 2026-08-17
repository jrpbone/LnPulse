import {
  buildPerformancePayload,
  computeGPA,
  updateGradeDraft,
} from "../grade.utils";

describe("grade utilities", () => {
  test("marks an empty grade set as pending", () => {
    expect(buildPerformancePayload(7, [])).toEqual({
      acads_id: 7,
      gpa: null,
      honors: null,
      remarks: "Pending Grades",
    });
  });

  test("marks a partially completed grade set as incomplete", () => {
    expect(
      computeGPA([
        { type: "core", grade: "95" },
        { type: "specialized", grade: "" },
      ])
    ).toEqual({ isComplete: false, message: "Incomplete Grades" });
  });

  test("calculates honors and failed-subject remarks", () => {
    expect(
      computeGPA([
        { type: "core", grade: "99" },
        { type: "specialized", grade: "70" },
        { type: "core", grade: "98" },
      ])
    ).toMatchObject({
      isComplete: true,
      gpa: "89.00",
      honors: "No Honors",
      remarks: "Failed 1 specialized subject",
    });
  });

  test("derives grade remarks while editing", () => {
    expect(updateGradeDraft({}, 12, "75")[12]).toEqual({
      grade: "75",
      remarks: "Passed",
    });
    expect(updateGradeDraft({}, 12, "74")[12].remarks).toBe("Failed");
  });
});
