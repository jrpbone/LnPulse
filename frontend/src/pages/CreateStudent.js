import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function CreateStudent() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const initialValues = {
    studentID: "",
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    birthDate: "",
    placeOfBirth: "",
    age: "",
    sex: "",
    contactNumber: "",
    email: "",
    religion: "",
    nationality: "Filipino",
    height: "",
    weight: "",
    bmi: "",
    currentAddress: {
      houseNumber: "",
      streetBarangay: "",
      cityMunicipality: "Ligao City",
      province: "Albay",
    },
    permanentAddress: {
      houseNumber: "",
      streetBarangay: "",
      cityMunicipality: "Ligao City",
      province: "Albay",
    },
    pgFirstName: "",
    pgMiddleName: "",
    pgLastName: "",
    pgContactNum: "",
  };

  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    studentID: Yup.string()
      .required("Learner's reference number is required")
      .test(
        "is-numeric-only",
        "Learner's reference number must contain only numbers",
        (value) => !!value && /^(\+?\d*)$/.test(value)
      )
      .test(
        "valid-length-and-format",
        "Learner's reference number must be 12 digits",
        (value) => !!value && /^\d{12}$/.test(value)
      ),

    firstName: Yup.string()
      .required("Required")
      .test(
        "contains-letters",
        "First name must contain letters",
        (value) => !!value && /[a-zA-Z]/.test(value)
      ),

    middleName: Yup.string()
      .nullable()
      .test("contains-letters", "Middle name must contain letters", (value) => {
        if (!value) return true;
        return /^[a-zA-Z\s]+$/.test(value);
      }),

    lastName: Yup.string()
      .required("Required")
      .test(
        "contains-letters",
        "Last name must only contain letters",
        (value) => !!value && /[a-zA-Z]/.test(value)
      ),

    birthDate: Yup.date()
      .required("Required")
      .typeError("Date of Birth must be a valid date"),

    placeOfBirth: Yup.string()
      .required("Required")
      .matches(
        /^[a-zA-Z0-9\s,-]+$/,
        "Place of birth can only contain letters, numbers, spaces, commas, and hyphens"
      ),

    sex: Yup.string().required("Required"),

    contactNumber: Yup.string()
      .required("Contact number is required")
      .test(
        "is-numeric-only",
        "Contact number must contain only numbers",
        (value) => !!value && /^(\+?\d*)$/.test(value)
      )
      .test(
        "valid-length-and-format",
        "Contact number must be 11 digits",
        (value) => {
          if (!value) return false;
          return /^(?:\+63|0)\d{10}$/.test(value);
        }
      ),

    email: Yup.string()
      .email("Invalid email")
      .required("Required")
      .test(
        "is-valid-email-format",
        "Invalid email structure",
        (value) =>
          typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ),

    religion: Yup.string()
      .required("Required")
      .test("is-not-number", "Religion cannot be a number", (value) =>
        isNaN(value)
      ),

    nationality: Yup.string()
      .required("Required")
      .test("is-not-number", "Nationality cannot be a number", (value) =>
        isNaN(value)
      ),

    height: Yup.number()
      .typeError("Height must only be a number")
      .required("Height is required")
      .min(134, "Too short")
      .max(221, "Too tall"),

    weight: Yup.number()
      .typeError("Weight must only be a number")
      .required("Weight is required")
      .min(45, "Too light")
      .max(100, "Too heavy"),

    currentAddress: Yup.object().shape({
      streetBarangay: Yup.string().required("Required"),
      cityMunicipality: Yup.string().required("Required"),
      province: Yup.string()
        .required("Required")
        .test("is-not-number", "Province must not contain a number", (value) =>
          isNaN(value)
        ),
    }),
    permanentAddress: Yup.object().shape({
      streetBarangay: Yup.string().required("Required"),
      cityMunicipality: Yup.string().required("Required"),
      province: Yup.string().required("Required"),
    }),
    pgFirstName: Yup.string()
      .required("Required")
      .test(
        "contains-letters",
        "First name must contain letters",
        (value) => !!value && /[a-zA-Z]/.test(value)
      ),
    pgMiddleName: Yup.string().test(
      "contains-letters",
      "Middle name must contain letters",
      (value) => !!value && /[a-zA-Z]/.test(value)
    ),
    pgLastName: Yup.string()
      .required("Required")
      .test(
        "contains-letters",
        "Last name must contain letters",
        (value) => !!value && /[a-zA-Z]/.test(value)
      ),
    pgContactNum: Yup.string()
      .required("Contact number is required")
      .test(
        "is-numeric-only",
        "Contact number must contain only numbers",
        (value) => !!value && /^(\+?\d*)$/.test(value)
      )
      .test(
        "valid-length-and-format",
        "Contact number must be 11 digits",
        (value) => {
          if (!value) return false;
          return /^(?:\+63|0)\d{10}$/.test(value);
        }
      ),
  });

  const onSubmit = (data) => {
    axios.post("http://localhost:3001/students", data)
      .then((response) => {
        console.log("Student creation response:", response.data);
        const student_id =
          response.data.student_id ||
          response.data.id ||
          response.data?.student?.student_id;
        if (student_id) {
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
            navigate(`/academic-info/${student_id}`);
          }, 2000);
        } else {
          setErrorMessage("Something went wrong. Please try again.");
          setShowErrorModal(true);
        }
      })
      .catch((error) => {
        console.error("Error creating student:", error);
        console.error("Error response:", error.response?.data);
        setErrorMessage(error.response?.data?.message || "Failed to create student. Please try again.");
        setShowErrorModal(true);
      });
  };

  // Function to calculate age
  const calculateAge = (birthDate) => {
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    const month = today.getMonth() - birthDateObj.getMonth();
    if (
      month < 0 ||
      (month === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      return age - 1;
    }
    return age;
  };

  // Function to calculate BMI
  const calculateBMI = (height, weight) => {
    if (height && weight) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(2);
    }
    return "";
  };

  // This child component uses useEffect properly
  function AutoCalculateFields() {
    const { values, setFieldValue } = useFormikContext();

    useEffect(() => {
      if (values.birthDate) {
        const age = calculateAge(values.birthDate);
        setFieldValue("age", age);
      }
      if (values.height && values.weight) {
        const bmi = calculateBMI(values.height, values.weight);
        setFieldValue("bmi", bmi);
      }
    }, [values.birthDate, values.height, values.weight, setFieldValue]);

    return null;
  }

  //RED MESSAGES
  const StyledErrorMessage = ({ name }) => {
    const { errors, touched } = useFormikContext();
    
    // Handle nested field paths
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((acc, part) => {
        return acc && acc[part];
      }, obj);
    };

    const touchedValue = getNestedValue(touched, name);
    const errorValue = getNestedValue(errors, name);
    const message = touchedValue && errorValue ? errorValue : "";
  
    const parts = message?.split(/(".*?")/) ?? [];
  
    return (
      <div className="fixed-error">
        {parts.length > 0 && message ? (
          parts.map((part, index) =>
            part.startsWith('"') && part.endsWith('"') ? (
              <span key={index} style={{ color: "red" }}>{part}</span>
            ) : (
              <span key={index}>{part}</span>
            )
          )
        ) : (
          <span style={{ visibility: "hidden" }}>placeholder</span>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="create_main">
        {showSuccessMessage && (
          <div className="success-message">Student successfully added!</div>
        )}
        <div className="createStudentPage">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            <Form>
              {/* Auto-updates age and BMI */}
              <AutoCalculateFields />

              <h2 className="title">New Student</h2>

              <div className="form-section">
                <div className="lrn_div">
                  <label className="label">Learner's Reference Number:</label>
                  <Field
                    name="studentID"
                    placeholder="XXX - XXX - XXX - XXX"
                    className="lrn_input"
                  />
                  <StyledErrorMessage name="studentID" />
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Personal Information</h3>
                <div className="name_div">
                  <div className="field-group">
                    <label className="l-label">Last Name:</label>
                    <Field
                      name="lastName"
                      placeholder="LAST NAME"
                      className="l-input"
                    />
                    <StyledErrorMessage name="lastName" />
                  </div>

                  <div className="field-group">
                    <label className="label">First Name:</label>
                    <Field
                      name="firstName"
                      placeholder="FIRST NAME"
                      className="f-input"
                    />
                    <StyledErrorMessage name="firstName" />
                  </div>

                  <div className="field-group">
                    <label className="m-label">Middle Name:</label>
                    <Field
                      name="middleName"
                      placeholder="MIDDLE NAME"
                      className="m-input"
                    />
                    <StyledErrorMessage name="middleName" />
                  </div>

                  <div className="field-group">
                    <label className="s-label">Suffix:</label>
                    <Field name="suffix" as="select" className="s-input">
                      <option value="" disabled>
                        -Suffix-
                      </option>
                      <option value="None">None</option>
                      <option value="Jr.">Jr.</option>
                      <option value="Sr.">Sr.</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                    </Field>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Birth Information</h3>
                <div className="birth_div">
                  <div className="field-group">
                    <label className="label">Date of Birth:</label>
                    <Field
                      type="date"
                      id="inputCreateStudent"
                      name="birthDate"
                      max={
                        new Date(
                          new Date().setFullYear(new Date().getFullYear() - 15)
                        )
                          .toISOString()
                          .split("T")[0]
                      }
                      autoComplete="off"
                      className="b-input"
                    />
                    <StyledErrorMessage name="birthDate" />
                  </div>

                  <div className="field-group">
                    <label className="plabel">Place of Birth:</label>
                    <Field
                      name="placeOfBirth"
                      placeholder="PLACE OF BIRTH"
                      className="p-input"
                    />
                    <StyledErrorMessage name="placeOfBirth" />
                  </div>

                  <div className="field-group">
                    <label className="alabel">Age:</label>
                    <Field
                      name="age"
                      placeholder="AGE"
                      className="a-input"
                      readOnly
                    />
                  </div>

                  <div className="field-group">
                    <label className="xlabel">Sex:</label>
                    <Field as="select" name="sex" className="x-input">
                      <option value="">Select Sex</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Field>
                    <StyledErrorMessage name="sex" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Contact Information</h3>
                <div className="contact_div">
                  <div className="field-group">
                    <label className="label">Contact Number:</label>
                    <Field
                      name="contactNumber"
                      placeholder="XXXX - XXX - XXXX"
                      className="con_input"
                    />
                    <StyledErrorMessage name="contactNumber" />
                  </div>

                  <div className="field-group">
                    <label className="elabel">Email:</label>
                    <Field
                      name="email"
                      placeholder="you@example.com"
                      className="em_input"
                    />
                    <StyledErrorMessage name="email" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Personal Details</h3>
                <div className="place_div">
                  <div className="field-group">
                    <label className="label">Religion:</label>
                    <Field
                      name="religion"
                      placeholder="Religion"
                      className="rel_input"
                    />
                    <StyledErrorMessage name="religion" />
                  </div>

                  <div className="field-group">
                    <label className="natlabel">Nationality:</label>
                    <Field
                      name="nationality"
                      placeholder="Nationality"
                      className="nat_input"
                    />
                    <StyledErrorMessage name="nationality" />
                  </div>
                </div>

                <div className="hw_div">
                  <div className="field-group">
                    <label className="label">Height (cm):</label>
                    <Field
                      name="height"
                      placeholder="CM"
                      className="he_input"
                    />
                    <StyledErrorMessage name="height" />
                  </div>

                  <div className="field-group">
                    <label className="wlabel">Weight (kg):</label>
                    <Field
                      name="weight"
                      placeholder="KG"
                      className="we_input"
                    />
                    <StyledErrorMessage name="weight" />
                  </div>

                  <div className="field-group">
                    <label className="label">BMI:</label>
                    <Field
                      name="bmi"
                      placeholder="BMI"
                      className="we_input"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Current Address</h3>
                <div className="current_div">
                  <div className="field-group">
                    <label className="clabel">House Number:</label>
                    <Field
                      name="currentAddress.houseNumber"
                      placeholder="HOUSE NUMBER"
                      className="hnum_input"
                    />
                  </div>

                  <div className="field-group">
                    <label className="clabel">Street/Barangay:</label>
                    <Field
                      name="currentAddress.streetBarangay"
                      placeholder="STREET AND BARANGAY"
                      className="bar_input"
                    />
                    <StyledErrorMessage name="currentAddress.streetBarangay" />
                  </div>

                  <div className="field-group">
                    <label className="clabel">City/Municipality:</label>
                    <Field
                      name="currentAddress.cityMunicipality"
                      placeholder="MUNICIPALITY / CITY"
                      className="ct_input"
                    />
                    <StyledErrorMessage name="currentAddress.cityMunicipality" />
                  </div>

                  <div className="field-group">
                    <label className="clabel">Province:</label>
                    <Field
                      name="currentAddress.province"
                      placeholder="PROVINCE"
                      className="prov_input"
                    />
                    <StyledErrorMessage name="currentAddress.province" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Permanent Address</h3>
                <div className="current_div">
                  <div className="field-group">
                    <label className="clabel">House Number:</label>
                    <Field
                      name="permanentAddress.houseNumber"
                      placeholder="HOUSE NUMBER"
                      className="hnum_input"
                    />
                  </div>

                  <div className="field-group">
                    <label className="clabel">Street/Barangay:</label>
                    <Field
                      name="permanentAddress.streetBarangay"
                      placeholder="STREET AND BARANGAY"
                      className="bar_input"
                    />
                    <StyledErrorMessage name="permanentAddress.streetBarangay" />
                  </div>

                  <div className="field-group">
                    <label className="clabel">City/Municipality:</label>
                    <Field
                      name="permanentAddress.cityMunicipality"
                      placeholder="MUNICIPALITY / CITY"
                      className="ct_input"
                    />
                    <StyledErrorMessage name="permanentAddress.cityMunicipality" />
                  </div>

                  <div className="field-group">
                    <label className="clabel">Province:</label>
                    <Field
                      name="permanentAddress.province"
                      placeholder="PROVINCE"
                      className="prov_input"
                    />
                    <StyledErrorMessage name="permanentAddress.province" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Parent/Guardian Information</h3>
                <div className="parent_div">
                  <div className="field-group">
                    <label className="clabel">Guardian First Name:</label>
                    <Field
                      name="pgFirstName"
                      placeholder="FIRST NAME"
                      className="gname_input"
                    />
                    <StyledErrorMessage name="pgFirstName" />
                  </div>

                  <div className="field-group">
                    <label className="clabel">Guardian Middle Name:</label>
                    <Field
                      name="pgMiddleName"
                      placeholder="MIDDLE NAME"
                      className="mname_input"
                    />
                    <StyledErrorMessage name="pgMiddleName" />
                  </div>

                  <div className="field-group">
                    <label className="clabel">Guardian Last Name:</label>
                    <Field
                      name="pgLastName"
                      placeholder="LAST NAME"
                      className="lname_input"
                    />
                    <StyledErrorMessage name="pgLastName" />
                  </div>

                  <div className="field-group">
                    <label className="clabel">Guardian Contact Number:</label>
                    <Field
                      name="pgContactNum"
                      placeholder="CONTACT #"
                      className="contact_input"
                    />
                    <StyledErrorMessage name="pgContactNum" />
                  </div>
                </div>
              </div>

              <button type="submit" className="submit-btn">
                Save
              </button>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default CreateStudent;
