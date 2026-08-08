import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./stylestrand.css";
import { useAuth } from '../context/AuthContext';

function Departments() {
  const [listOfDepartments, setListOfDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const navigate = useNavigate();
  const { departmentId } = useParams();
  const { privileges } = useAuth();

  useEffect(() => {
    fetchDepartments();
  }, [departmentId]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:3001/departments");
      // If user is a department head or if departmentId is in URL, filter to show only that department
      const targetDepartmentId = departmentId || privileges?.departmentId;
      if (targetDepartmentId) {
        const filteredDepartments = response.data.filter(
          dept => dept.department_id === parseInt(targetDepartmentId)
        );
        setListOfDepartments(filteredDepartments);
      } else {
        setListOfDepartments(response.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleOpenAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);

  const handleOpenEditModal = (department) => {
    setSelectedDepartment(department);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedDepartment(null);
  };

  const handleOpenDeleteModal = (department) => {
    setSelectedDepartment(department);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedDepartment(null);
  };

  const handleDepartmentClick = (department) => {
    navigate(`/strands/${department.department_id}`, {
      state: { departmentName: department.department_name }
    });
  };

  const validationSchema = Yup.object().shape({
    department_name: Yup.string()
      .required("Department name is required")
      .test('unique-name', 'This department name already exists', function(value) {
        if (!value) return true;
        const normalizedValue = value.toLowerCase().replace(/department/g, '').trim();
        
        const isDuplicate = listOfDepartments.some(dept => {
          if (selectedDepartment && dept.department_id === selectedDepartment.department_id) {
            return false;
          }
          
          const normalizedDeptName = dept.department_name.toLowerCase().replace(/department/g, '').trim();
          return normalizedDeptName === normalizedValue;
        });
        
        return !isDuplicate;
      }),
    department_description: Yup.string().required("Department description is required"),
  });

  const handleEditSubmit = (values) => {
    axios
      .put(`http://localhost:3001/departments/${selectedDepartment.department_id}`, values)
      .then(() => {
        fetchDepartments();
        handleCloseEditModal();
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      })
      .catch((error) => {
        console.error("Error updating department:", error);
        alert("Failed to update department. Please try again.");
      });
  };

  const handleDelete = () => {
    axios
      .delete(`http://localhost:3001/departments/${selectedDepartment.department_id}`)
      .then(() => {
        fetchDepartments();
        handleCloseDeleteModal();
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      })
      .catch((error) => {
        console.error("Error deleting department:", error);
        alert("Failed to delete department. Please try again.");
      });
  };

  return (
    <div className="strand_panel">
      {showSuccessMessage && (
        <div className="success-message">
          Operation completed successfully!
        </div>
      )}
      
      <div className="header_div">
        <h2 className="title">
          Departments <span className="strand_count">{listOfDepartments.length}</span>
        </h2>
        {!privileges?.departmentId && (
          <button onClick={handleOpenAddModal} className="add_button">
            + Add a Department
          </button>
        )}
      </div>

      <div className="listOfStrands">
        {listOfDepartments.length === 0 ? (
          <p>No departments found.</p>
        ) : (
          listOfDepartments.map((department, index) => (
            <div key={index} className="strand" onClick={() => handleDepartmentClick(department)}>
              <div className="strand-header">
                <h3 className="strandName">
                  {department.department_name}
                  <span className="student-count">
                    {department.currentStudentCount}
                  </span>
                </h3>
                {!privileges?.departmentId && (
                  <div className="department-actions">
                    <button 
                      className="edit-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(department);
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDeleteModal(department);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="strandDescription">{department.department_description}</p>
            </div>
          ))
        )}
      </div>

      <style>{`
        .student-count {
          font-size: 0.8em;
          color: #666;
          margin-left: 10px;
          font-weight: normal;
          align-text: left
        }
      `}</style>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Department</h3>
            <Formik
              initialValues={{
                department_name: "",
                department_description: "",
              }}
              validationSchema={validationSchema}
              onSubmit={(values, { resetForm }) => {
                axios
                  .post("http://localhost:3001/departments", values)
                  .then(() => {
                    fetchDepartments();
                    setShowAddModal(false);
                    resetForm();
                    setShowSuccessMessage(true);
                    setTimeout(() => {
                      setShowSuccessMessage(false);
                    }, 3000);
                  })
                  .catch((error) => {
                    console.error("Error adding department:", error);
                    alert("Failed to add department. Please try again.");
                  });
              }}
            >
              <Form>
                <div className="form-group">
                  <label>Department Name:</label>
                  <Field name="department_name" type="text" className="form-input" />
                  <ErrorMessage
                    name="department_name"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="form-group">
                  <label>Department Description:</label>
                  <Field name="department_description" type="text" className="form-input" />
                  <ErrorMessage
                    name="department_description"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="button-group">
                  <button type="submit" className="save-button">Save</button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCloseAddModal}
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            </Formik>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && selectedDepartment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Department</h3>
            <Formik
              initialValues={{
                department_name: selectedDepartment.department_name,
                department_description: selectedDepartment.department_description,
              }}
              validationSchema={validationSchema}
              onSubmit={handleEditSubmit}
            >
              <Form>
                <div className="form-group">
                  <label>Department Name:</label>
                  <Field name="department_name" type="text" className="form-input" />
                  <ErrorMessage
                    name="department_name"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="form-group">
                  <label>Department Description:</label>
                  <Field name="department_description" type="text" className="form-input" />
                  <ErrorMessage
                    name="department_description"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="button-group">
                  <button type="submit" className="save-button">Update</button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCloseEditModal}
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            </Formik>
          </div>
        </div>
      )}

      {showDeleteModal && selectedDepartment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Department</h3>
            <p>Are you sure you want to delete "{selectedDepartment.department_name}"?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="button-group">
              <button
                className="delete-button"
                onClick={handleDelete}
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                Delete
              </button>
              <button
                className="cancel-button"
                onClick={handleCloseDeleteModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Departments;
