import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useEffect, useState } from "react";
import './edit.css'

function EditStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showModal, setShowModal] = useState(false);

  console.log("Location state:", location.state); // Debug log

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        if (location.state?.studentData) {
          console.log("Setting student data:", location.state.studentData); // Debug log
          setStudentData(location.state.studentData);
        } else {
          console.log("No student data found, redirecting..."); // Debug log
      navigate("/StudentList");
    }
      } catch (err) {
        console.error("Error loading student data:", err);
        setError("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [location.state, navigate]);

  console.log("Current state:", { loading, error, studentData }); // Debug log

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!studentData) {
    return <div>No student data found</div>;
  }

  const initialValues = {
    student_id: studentData.student_id || "",
    first_name: studentData.first_name || "",
    middle_name: studentData.middle_name || "",
    last_name: studentData.last_name || "",
    suffix: studentData.suffix || "",
    birth_date: studentData.birth_date || "",
    place_of_birth: studentData.place_of_birth || "",
    age: studentData.age || "",
    sex: studentData.sex || "",
    contact_num: studentData.contact_num || "",
    email: studentData.email || "",
    religion: studentData.religion || "",
    nationality: studentData.nationality || "",
    height: studentData.height || "",
    weight: studentData.weight || "",
    bmi: studentData.bmi || "",
    currentAddressData: {
      houseNo: studentData.currentAddressData?.houseNo || "",
      street_barangay: studentData.currentAddressData?.street_barangay || "",
      city_municipality: studentData.currentAddressData?.city_municipality || "",
      province: studentData.currentAddressData?.province || "",
    },
    permanentAddressData: {
      houseNo: studentData.permanentAddressData?.houseNo || "",
      street_barangay: studentData.permanentAddressData?.street_barangay || "",
      city_municipality: studentData.permanentAddressData?.city_municipality || "",
      province: studentData.permanentAddressData?.province || "",
    },
    PARENT_GUARDIAN_T: {
      pgFirstName: studentData.PARENT_GUARDIAN_T?.pgFirstName || "",
      pgMiddleName: studentData.PARENT_GUARDIAN_T?.pgMiddleName || "",
      pgLastName: studentData.PARENT_GUARDIAN_T?.pgLastName || "",
      pgContactNum: studentData.PARENT_GUARDIAN_T?.pgContactNum || "",
    },
  };

  const validationSchema = Yup.object().shape({
    student_id: Yup.string()
      .required("Learner's reference number is required")
      .test(
        "is-numeric-only",
        "Learner's reference number must contain only numbers",
        (value) => !!value && /^(\+?\d*)$/.test(value)
      ),
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    middle_name: Yup.string()
      .nullable()
      .test("contains-letters", "Middle name must contain letters", (value) => {
        if (!value) return true;
        return /^[a-zA-Z\s]+$/.test(value);
      }),
    birth_date: Yup.date()
      .required("Required")
      .typeError("Date of Birth must be a valid date"),
    place_of_birth: Yup.string()
      .required("Required")
      .matches(
        /^[a-zA-Z0-9\s,-]+$/,
        "Place of birth can only contain letters, numbers, spaces, commas, and hyphens"
      ),
    sex: Yup.string().required("Required"),
    contact_num: Yup.string()
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
    currentAddressData: Yup.object().shape({
      street_barangay: Yup.string().required("Required"),
      city_municipality: Yup.string().required("Required"),
      province: Yup.string().required("Required"),
    }),
    permanentAddressData: Yup.object().shape({
      street_barangay: Yup.string().required("Required"),
      city_municipality: Yup.string().required("Required"),
      province: Yup.string().required("Required"),
    }),
    PARENT_GUARDIAN_T: Yup.object().shape({
      pgFirstName: Yup.string().required("Required"),
      pgLastName: Yup.string().required("Required"),
      pgContactNum: Yup.string().required("Required"),
    }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formattedData = {
        studentID: values.student_id,
        firstName: values.first_name,
        middleName: values.middle_name,
        lastName: values.last_name,
        suffix: values.suffix,
        birthDate: values.birth_date,
        placeOfBirth: values.place_of_birth,
        age: values.age,
        sex: values.sex,
        contactNumber: values.contact_num,
        email: values.email,
        religion: values.religion,
        nationality: values.nationality,
        height: values.height,
        weight: values.weight,
        bmi: values.bmi,
        currentAddress: {
          houseNumber: values.currentAddressData.houseNo,
          streetBarangay: values.currentAddressData.street_barangay,
          cityMunicipality: values.currentAddressData.city_municipality,
          province: values.currentAddressData.province,
        },
        permanentAddress: {
          houseNumber: values.permanentAddressData.houseNo,
          streetBarangay: values.permanentAddressData.street_barangay,
          cityMunicipality: values.permanentAddressData.city_municipality,
          province: values.permanentAddressData.province,
        },
        pgFirstName: values.PARENT_GUARDIAN_T.pgFirstName,
        pgMiddleName: values.PARENT_GUARDIAN_T.pgMiddleName,
        pgLastName: values.PARENT_GUARDIAN_T.pgLastName,
        pgContactNum: values.PARENT_GUARDIAN_T.pgContactNum,
      };

      console.log("Sending data to server:", formattedData);

      const response = await axios.put(
        `http://localhost:3001/students/${studentData.student_id}`,
        formattedData
      );
      console.log("Update response:", response.data);

      setShowSuccessMessage(true);
      setShowModal(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setShowModal(false);
        navigate(`/Student/${studentData.student_id}`);
      }, 1800);
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert(
        `Error updating student information: ${
          error.response?.data?.message || error.message
        }`
      );
    }
    setSubmitting(false);
  };

  return (
    <div className="edit-main">
      {showSuccessMessage && (
        <div className="success-message">
          Student information updated successfully!
        </div>
      )}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="welcome-animation">
              <h2>Update Successful!</h2>
              <div className="loading-spinner"></div>
              <p>Redirecting to student details...</p>
            </div>
          </div>
        </div>
      )}
      <div className="form-container">
        <h2 className="title">Edit Student Information</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
          <Form>
            <div className="lrn_div">
              <label htmlFor="student_id" className="label">Learner's Reference Number:</label> <br></br>
              <Field type="text" id="student_id" name="student_id" className="lrn_input" disabled={true} readOnly/>
              <ErrorMessage name="student_id" component="div" className="error" />
            </div>

            <br></br>

            <div className = "name_div">
              <div className="field-group">
              <label htmlFor="first_name" className="label">First Name:</label> 
              <Field type="text" id="first_name" name="first_name" className = "f-input"/>
              <ErrorMessage name="first_name" component="div" className="error" />
              </div>

              <div className="field-group">
              <label htmlFor="middle_name" className="m-label">Middle Name:</label>
              <Field type="text" id="middle_name" name="middle_name" className = "m-input"/>
              </div>

              <div className="field-group">
              <label htmlFor="last_name" className="l-label">Last Name:</label>
              <Field type="text" id="last_name" name="last_name" className= "l-input"/>
              <ErrorMessage name="last_name" component="div" className="error"/>
              </div>

              <div className="field-group">
              <label htmlFor="suffix" className="s-label">Suffix:</label>
              <Field type="text" id="suffix" name="suffix" className = "s-input"/>
            </div>
            </div>

            <br></br>

            <div className="birth_div">
            <div className="field-group">
              <label htmlFor="birth_date" className="label">Birth Date:</label>
              <Field type="date" id="birth_date" name="birth_date" className = "b-input"/>
              <ErrorMessage name="birth_date" component="div" className="error" />
            </div>

            <div className="field-group">
              <label htmlFor="place_of_birth" className="plabel">Place of Birth:</label>
              <Field type="text" id="place_of_birth" name="place_of_birth" className = "p-input"/>
                <ErrorMessage name="place_of_birth" component="div" className="error" />
            </div>

            <div className="field-group">
              <label htmlFor="age" className="alabel">Age:</label>
              <Field type="number" id="age" name="age" className = "a-input"/>
              <ErrorMessage name="age" component="div" className="error" />
            </div>
            

            <div className="field-group">
              <label htmlFor="sex" className="xlabel">Sex:</label>
              <Field as="select" id="sex" name="sex" className = "x-input">
                  <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Field>
              <ErrorMessage name="sex" component="div" className="error" />
            </div>
            </div>

            <br></br>

            <div className="contact_div">
            <div className="field-group">
              <label htmlFor="contact_num" className="label">Contact Number:</label>
              <Field type="text" id="contact_num" name="contact_num" className = "con_input"/>
                <ErrorMessage name="contact_num" component="div" className="error" />
            </div>

            <div className="field-group">
              <label htmlFor="email" className="elabel">Email:</label>
              <Field type="email" id="email" name="email"  className = "em_input"/>
              <ErrorMessage name="email" component="div" className="error" />
            </div>
            </div>

          <br></br>

            <div className="place_div">
            <div className="field-group">
              <label htmlFor="religion" className="label">Religion:</label>
              <Field type="text" id="religion" name="religion"  className = "rel_input"/>
              <ErrorMessage name="religion" component="div" className="error" />
            </div>

            <div className="field-group">
              <label htmlFor="nationality" className="natlabel">Nationality:</label>
              <Field type="text" id="nationality" name="nationality" className = "nat_input"/>
                <ErrorMessage name="nationality" component="div" className="error" />
            </div>
            </div>

            <br></br>

            <div className="hw_div">
            <div className="field-group">
              <label htmlFor="height" className="label">Height (cm):</label>
              <Field type="number" id="height" name="height" className = "he_input"/>
              <ErrorMessage name="height" component="div" className="error" />
            </div>

            <div className="field-group">
              <label htmlFor="weight" className="wlabel">Weight (kg):</label>
              <Field type="number" id="weight" name="weight"  className ="we_input"/>
              <ErrorMessage name="weight" component="div" className="error" />
            </div>
            </div>

            <br></br>

            <h3 className="label">Current Address</h3>
            <div className="current_div">
            <div className="field-group">
              <label htmlFor="currentAddressData.houseNo" className="clabel">House Number:</label>
                <Field type="text" id="currentAddressData.houseNo" name="currentAddressData.houseNo" className = "hnum_input"/>
            </div>

            <div className="field-group">
                <label htmlFor="currentAddressData.street_barangay" className="clabel">Street/Barangay:</label>
                <Field type="text" id="currentAddressData.street_barangay" name="currentAddressData.street_barangay" className = "bar_input"/>
                <ErrorMessage name="currentAddressData.street_barangay" component="div" className="error" />
            </div>

            <div className="field-group">
                <label htmlFor="currentAddressData.city_municipality" className="clabel">City/Municipality:</label>
                <Field type="text" id="currentAddressData.city_municipality" name="currentAddressData.city_municipality" className = "ct_input"/>
                <ErrorMessage name="currentAddressData.city_municipality" component="div" className="error" />
            </div>

            <div className="field-group">
              <label htmlFor="currentAddressData.province" className="clabel">Province:</label>
                <Field type="text" id="currentAddressData.province" name="currentAddressData.province" className = "prov_input"/>
                <ErrorMessage name="currentAddressData.province" component="div" className="error" />
            </div>
            </div>

            <br></br>

            <h3 className="label">Permanent Address</h3>
            <div className="current_div">
            <div className="field-group">
              <label htmlFor="permanentAddressData.houseNo" className="clabel">House Number:</label>
                <Field type="text" id="permanentAddressData.houseNo" name="permanentAddressData.houseNo" className = "hnum_input"/>
            </div>

            <div className="field-group">
                <label htmlFor="permanentAddressData.street_barangay" className="dlabel">Street/Barangay:</label>
                <Field type="text" id="permanentAddressData.street_barangay" name="permanentAddressData.street_barangay" className= "bar_input"/>
                <ErrorMessage name="permanentAddressData.street_barangay" component="div" className="error" />
            </div>

            <div className="field-group">
                <label htmlFor="permanentAddressData.city_municipality" className="clabel">City/Municipality:</label>
                <Field type="text" id="permanentAddressData.city_municipality" name="permanentAddressData.city_municipality" className = "ct_input"/>
                <ErrorMessage name="permanentAddressData.city_municipality" component="div" className="error" />
            </div>

            <div className="field-group">
              <label htmlFor="permanentAddressData.province" className="clabel">Province:</label>
                <Field type="text" id="permanentAddressData.province" name="permanentAddressData.province" className = "prov_input"/>
                <ErrorMessage name="permanentAddressData.province" component="div" className="error" />
            </div>
            </div>

            <br></br>

            <h3 className="label">Parent/Guardian Information</h3>
            <div className="parent_div">
            <div className="field-group">
              <label htmlFor="PARENT_GUARDIAN_T.pgFirstName" className="clabel">First Name:</label>
                <Field type="text" id="PARENT_GUARDIAN_T.pgFirstName" name="PARENT_GUARDIAN_T.pgFirstName" className = "gname_input"/>
                <ErrorMessage name="PARENT_GUARDIAN_T.pgFirstName" component="div" className="error" />
            </div>

            <div className="field-group">
              <label htmlFor="PARENT_GUARDIAN_T.pgMiddleName" className="clabel">Middle Name:</label>
                <Field type="text" id="PARENT_GUARDIAN_T.pgMiddleName" name="PARENT_GUARDIAN_T.pgMiddleName" className ="mname_input"/>
            </div>

            <div className="field-group">
              <label htmlFor="PARENT_GUARDIAN_T.pgLastName" className="clabel">Last Name:</label>
                <Field type="text" id="PARENT_GUARDIAN_T.pgLastName" name="PARENT_GUARDIAN_T.pgLastName" className = "lname_input"/>
                <ErrorMessage name="PARENT_GUARDIAN_T.pgLastName" component="div" className="error" />
            </div>

            <div className="field-group">
                <label htmlFor="PARENT_GUARDIAN_T.pgContactNum" className="clabel">Contact Number:</label>
                <Field type="text" id="PARENT_GUARDIAN_T.pgContactNum" name="PARENT_GUARDIAN_T.pgContactNum" className = "contact_input"/>
                <ErrorMessage name="PARENT_GUARDIAN_T.pgContactNum" component="div" className="error" />
            </div>
            </div>

            <br></br>
            <br></br>

            <div className="button-group">
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Student"}
              </button>
              <button 
                type="button" 
                className="submit-btn-cancel"
                onClick={() => navigate(`/student/${studentData.student_id}`)}
              >
                Cancel
              </button>
            </div>

          </Form>
          )}
        </Formik>
      </div>
      </div>
    );
  }

  export default EditStudent;

