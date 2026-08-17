import { ErrorMessage, Field, Form, Formik } from "formik";
import { FiBookOpen, FiCalendar, FiLayers, FiSave, FiX } from "react-icons/fi";
import {
  academicInfoSchema,
  filterSections,
} from "../utils/studentProfile.utils";

function ExitStatusOptions({ editingInfo }) {
  const remarks = editingInfo?.ACADEMIC_PERFORMANCE_Ts?.[0]?.remarks;
  if (remarks === "Pending Grades") {
    return (
      <>
        <option value="Pending">Pending</option>
        <option value="Dropped">Dropped</option>
        <option value="Transferred Out">Transferred Out</option>
        <option value="Shifted">Shifted</option>
      </>
    );
  }

  return (
    <>
      <option value="Pending">Pending</option>
      {remarks === "Passed" && <option value="Completed">Completed</option>}
      <option value="Promoted with Deficiencies">Promoted with Deficiencies</option>
      <option value="Failed">Failed</option>
      <option value="Dropped">Dropped</option>
      <option value="Transferred Out">Transferred Out</option>
      <option value="Shifted">Shifted</option>
      {editingInfo?.gradeLevel === "12" &&
        editingInfo?.semester === "2nd Semester" &&
        remarks === "Passed" && <option value="Graduated">Graduated</option>}
    </>
  );
}

function AcademicInfoModal({
  open,
  editingInfo,
  student,
  academicSettings,
  privileges,
  departments,
  strands,
  sections,
  onClose,
  onSubmit,
}) {
  if (!open) return null;

  const initialValues = {
    gradeLevel: editingInfo?.gradeLevel?.toString() || "",
    schoolYear: editingInfo?.schoolYear || academicSettings?.current_school_year || "",
    semester: editingInfo?.semester || academicSettings?.current_semester || "",
    entryStatus: editingInfo?.entryStatus || "",
    exitStatus: editingInfo?.exitStatus || "",
    strand_id: editingInfo?.strand_id?.toString() || "",
    section_id: editingInfo?.section_id?.toString() || "",
    department_id: editingInfo?.department_id?.toString() || "",
  };

  return (
    <div className="modal-overlay academic-info-overlay" role="dialog" aria-modal="true" aria-labelledby="academic-info-modal-title">
      <div className="modal-content academic-info-modal">
        <header className="academic-info-modal-header">
          <div className="academic-info-header-icon"><FiBookOpen /></div>
          <div>
            <p>Enrollment record</p>
            <h3 id="academic-info-modal-title">{editingInfo ? "Edit academic information" : "Add academic information"}</h3>
            <span>{editingInfo ? "Update this enrollment period and progression status." : "Create a new enrollment period for this learner."}</span>
          </div>
          <button type="button" className="academic-info-close" onClick={onClose} aria-label="Close academic information dialog"><FiX /></button>
        </header>
        <div className="academic-info-modal-body">
          <div className="academic-info-student-summary">
            <span className="academic-info-avatar">{`${student.first_name?.charAt(0) || ""}${student.last_name?.charAt(0) || ""}`.toUpperCase()}</span>
            <div><strong>{`${student.first_name || ""} ${student.last_name || ""}`.trim()}</strong><span>LRN {student.student_id}</span></div>
            {editingInfo && <span className="academic-record-id">Record #{editingInfo.acads_id}</span>}
          </div>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={academicInfoSchema}
            onSubmit={(values, helpers) => onSubmit(values, helpers.resetForm)}
          >
            {({ values }) => {
              const departmentId = Number(values.department_id) || null;
              const filteredStrands = strands.filter(
                (strand) => !departmentId || Number(strand.department_id) === departmentId
              );
              const filteredSections = filterSections(sections, values.gradeLevel, values.strand_id);

              return (
                <Form className="academic-info-form">
                  <div className="academic-form-section-heading"><span><FiLayers /></span><div><h4>Academic placement</h4><p>Grade, department, strand, and section assignment</p></div></div>
                  <div className="academic-form-grid">
                    <div className="form-group">
                      <label className="label" htmlFor="academic-grade-level">Grade level</label>
                      <Field id="academic-grade-level" as="select" name="gradeLevel" className="form-control" disabled={!privileges?.canEditStudents}>
                        <option value="">Select</option><option value="11">Grade 11</option><option value="12">Grade 12</option>
                      </Field>
                      <ErrorMessage name="gradeLevel" component="div" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="academic-department">Department</label>
                      <Field id="academic-department" as="select" name="department_id" className="form-control" disabled={!privileges?.canEditStudents}>
                        <option value="">Select Department</option>
                        {departments.map((department) => <option key={department.department_id} value={department.department_id.toString()}>{department.department_name}</option>)}
                      </Field>
                      <ErrorMessage name="department_id" component="div" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="academic-strand">Strand</label>
                      <Field id="academic-strand" as="select" name="strand_id" className="form-control" disabled={!privileges?.canEditStudents}>
                        <option value="">Select Strand</option>
                        {filteredStrands.map((strand) => <option key={strand.strand_id} value={strand.strand_id.toString()}>{strand.strand_name}</option>)}
                      </Field>
                      <ErrorMessage name="strand_id" component="div" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="academic-section">Section</label>
                      <Field id="academic-section" as="select" name="section_id" className="form-control" disabled={!privileges?.canEditStudents}>
                        <option value="">Select Section</option>
                        {filteredSections.map((section) => <option key={section.section_id} value={section.section_id.toString()}>{section.section_name}</option>)}
                      </Field>
                      <ErrorMessage name="section_id" component="div" className="error-message" />
                    </div>
                  </div>

                  <div className="academic-form-section-heading secondary"><span><FiCalendar /></span><div><h4>Enrollment period and status</h4><p>School term, entry classification, and learner outcome</p></div></div>
                  <div className="academic-form-grid period">
                    <div className="form-group">
                      <label className="label" htmlFor="academic-school-year">School year</label>
                      <Field id="academic-school-year" type="text" name="schoolYear" className="form-control" disabled />
                      <ErrorMessage name="schoolYear" component="div" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="academic-semester">Semester</label>
                      <Field id="academic-semester" type="text" name="semester" className="form-control" disabled />
                      <ErrorMessage name="semester" component="div" className="error-message" />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="academic-entry-status">Entry status</label>
                      <Field id="academic-entry-status" as="select" name="entryStatus" className="form-control" disabled={!privileges?.canEditStudents}>
                        <option value="">Select</option><option value="New Enrollee">New Enrollee</option><option value="Regular">Regular</option><option value="Irregular">Irregular</option><option value="Transferee">Transferee</option><option value="Returning">Returning</option><option value="Remedial">Remedial</option>
                      </Field>
                      <ErrorMessage name="entryStatus" component="div" className="error-message" />
                    </div>
                    {editingInfo && (
                      <div className="form-group">
                        <label className="label" htmlFor="academic-exit-status">Exit status</label>
                        <Field id="academic-exit-status" as="select" name="exitStatus" className="form-control">
                          <option value="">Select</option><ExitStatusOptions editingInfo={editingInfo} />
                        </Field>
                        <ErrorMessage name="exitStatus" component="div" className="error-message" />
                      </div>
                    )}
                  </div>
                  <div className="academic-info-note"><FiBookOpen /><span>{privileges?.canEditStudents ? "Academic placement changes affect this record only and preserve earlier history." : "Your access allows updating the learner's exit status only."}</span></div>
                  <div className="academic-info-actions">
                    <button type="button" className="academic-info-cancel" onClick={onClose}>Cancel</button>
                    <button type="submit" className="academic-info-save"><FiSave /> {editingInfo ? "Save changes" : "Add record"}</button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default AcademicInfoModal;
