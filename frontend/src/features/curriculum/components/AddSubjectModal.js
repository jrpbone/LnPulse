import { Field, Form, Formik } from "formik";

export const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const modalContentStyle = {
  background: "white",
  padding: 20,
  borderRadius: 8,
  width: 400,
};

function AddSubjectModal({ open, onClose, onSubmit }) {
  if (!open) return null;
  return (
    <div style={modalOverlayStyle} role="dialog" aria-modal="true">
      <div style={modalContentStyle}>
        <h3>Add New Subject</h3>
        <Formik
          initialValues={{ subject_name: "", subject_description: "", type: "core" }}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div style={{ marginBottom: "10px" }}>
                <label>Subject Name:</label>
                <Field name="subject_name" type="text" style={{ width: "100%", padding: "5px" }} />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>Subject Description:</label>
                <Field name="subject_description" type="text" style={{ width: "100%", padding: "5px" }} />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label>Type:</label>
                <Field as="select" name="type" style={{ width: "100%", padding: "5px" }}>
                  <option value="core">Core</option><option value="specialized">Specialized</option>
                </Field>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button type="button" onClick={onClose}>Cancel</button>
                <button type="submit" disabled={isSubmitting}>Add Subject</button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default AddSubjectModal;
