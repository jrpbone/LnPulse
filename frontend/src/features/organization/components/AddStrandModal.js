import React, { useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { FiBookOpen, FiInfo, FiLayers, FiPlus, FiX } from "react-icons/fi";
import "./AddStrandModal.css";

const STRAND_NAME_LIMIT = 20;
const STRAND_DESCRIPTION_LIMIT = 100;

const addStrandSchema = Yup.object().shape({
  strand_name: Yup.string()
    .trim()
    .max(STRAND_NAME_LIMIT, `Use ${STRAND_NAME_LIMIT} characters or fewer`)
    .required("Strand name is required"),
  strand_description: Yup.string()
    .trim()
    .max(STRAND_DESCRIPTION_LIMIT, `Use ${STRAND_DESCRIPTION_LIMIT} characters or fewer`)
    .required("Strand description is required"),
});

function AddStrandModal({ isOpen, departmentName, onClose, onSubmit }) {
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;

    setSubmitError("");
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    setSubmitError("");

    try {
      await onSubmit({
        strand_name: values.strand_name.trim(),
        strand_description: values.strand_description.trim(),
      });
      resetForm();
    } catch (error) {
      setSubmitError(
        error.response?.data?.error
          || error.response?.data?.message
          || "The strand could not be created. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="strand-create-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="strand-create-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-strand-title"
        aria-describedby="create-strand-description"
      >
        <header className="strand-create-header">
          <div className="strand-create-heading-icon" aria-hidden="true">
            <FiBookOpen />
          </div>
          <div className="strand-create-heading-copy">
            <span>Curriculum structure</span>
            <h2 id="create-strand-title">Create a new strand</h2>
            <p id="create-strand-description">
              Add a learning pathway to {departmentName || "this department"}.
            </p>
          </div>
          <button
            type="button"
            className="strand-create-close"
            onClick={onClose}
            aria-label="Close create strand dialog"
          >
            <FiX />
          </button>
        </header>

        <Formik
          initialValues={{ strand_name: "", strand_description: "" }}
          validationSchema={addStrandSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form className="strand-create-form" noValidate>
              <div className="strand-create-department">
                <span className="strand-create-department-icon" aria-hidden="true"><FiLayers /></span>
                <span><small>Adding to</small><strong>{departmentName || "Department"}</strong></span>
              </div>

              <div className="strand-create-field">
                <div className="strand-create-label-row">
                  <label htmlFor="new-strand-name">Strand name <span aria-hidden="true">*</span></label>
                  <small>{values.strand_name.length}/{STRAND_NAME_LIMIT}</small>
                </div>
                <Field
                  id="new-strand-name"
                  name="strand_name"
                  type="text"
                  maxLength={STRAND_NAME_LIMIT}
                  placeholder="e.g. STEM"
                  autoComplete="off"
                  autoFocus
                  aria-invalid={Boolean(touched.strand_name && errors.strand_name)}
                  aria-describedby="new-strand-name-help new-strand-name-error"
                />
                <div className="strand-create-field-meta">
                  <span id="new-strand-name-help">Use a clear, recognizable name or abbreviation.</span>
                </div>
                <ErrorMessage id="new-strand-name-error" name="strand_name" component="div" className="strand-create-error" />
              </div>

              <div className="strand-create-field">
                <div className="strand-create-label-row">
                  <label htmlFor="new-strand-description">Description <span aria-hidden="true">*</span></label>
                  <small>{values.strand_description.length}/{STRAND_DESCRIPTION_LIMIT}</small>
                </div>
                <Field
                  id="new-strand-description"
                  name="strand_description"
                  as="textarea"
                  maxLength={STRAND_DESCRIPTION_LIMIT}
                  placeholder="Briefly describe the strand's academic focus."
                  aria-invalid={Boolean(touched.strand_description && errors.strand_description)}
                  aria-describedby="new-strand-description-help new-strand-description-error"
                />
                <div className="strand-create-field-meta">
                  <span id="new-strand-description-help">This appears on the strand card for administrators.</span>
                </div>
                <ErrorMessage id="new-strand-description-error" name="strand_description" component="div" className="strand-create-error" />
              </div>

              <div className="strand-create-preview" aria-live="polite">
                <span className="strand-create-preview-icon" aria-hidden="true"><FiBookOpen /></span>
                <span>
                  <small>Card preview</small>
                  <strong>{values.strand_name.trim() || "Your strand name"}</strong>
                  <p>{values.strand_description.trim() || "A short description will appear here."}</p>
                </span>
              </div>

              <div className="strand-create-note">
                <FiInfo aria-hidden="true" />
                <span>You can add sections and assign learners after creating the strand.</span>
              </div>

              {submitError && <div className="strand-create-submit-error" role="alert">{submitError}</div>}

              <footer className="strand-create-actions">
                <button type="button" className="strand-create-cancel" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="strand-create-submit" disabled={isSubmitting}>
                  <FiPlus aria-hidden="true" />
                  {isSubmitting ? "Creating..." : "Create strand"}
                </button>
              </footer>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default AddStrandModal;
