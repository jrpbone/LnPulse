import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Users.css";
import { FiPlus } from "react-icons/fi";
import WorkspacePageHeader from "../components/WorkspacePageHeader";
import ConfirmationModal from "../components/ConfirmationModal";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [success, setSuccess] = useState("");
  const [sectionsWithoutAdviser, setSectionsWithoutAdviser] = useState([]);
  const [departmentsWithoutHead, setDepartmentsWithoutHead] = useState([]);
  const { privileges } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchSectionsWithoutAdviser();
    fetchDepartmentsWithoutHead();
  }, []);

  const fetchDepartmentsWithoutHead = async () => {
    try {
      // Get all departments
      const departmentsResponse = await axios.get("http://localhost:3001/departments");
      const allDepartments = departmentsResponse.data;

      // Get all department users (heads)
      const usersResponse = await axios.get("http://localhost:3001/users");
      const departmentUsers = usersResponse.data.filter(user => user.type === 'department_user');

      // Get departments that have heads
      const departmentsWithHead = departmentUsers.map(user => 
        user.departmentUser?.department_id
      ).filter(Boolean);

      // Filter departments without heads
      const departmentsWithoutHead = allDepartments.filter(
        department => !departmentsWithHead.includes(department.department_id)
      );

      setDepartmentsWithoutHead(departmentsWithoutHead);
    } catch (err) {
      console.error("Error fetching departments without head:", err);
    }
  };

  const fetchSectionsWithoutAdviser = async () => {
    try {
      // Get all sections
      const sectionsResponse = await axios.get("http://localhost:3001/sections");
      const allSections = sectionsResponse.data;

      // Get all section users (advisers)
      const usersResponse = await axios.get("http://localhost:3001/users");
      const sectionUsers = usersResponse.data.filter(user => user.type === 'section_user');

      // Get sections that have advisers
      const sectionsWithAdviser = sectionUsers.map(user => 
        user.sectionUser?.section_id
      ).filter(Boolean);

      // Filter sections without advisers
      const sectionsWithoutAdviser = allSections.filter(
        section => !sectionsWithAdviser.includes(section.section_id)
      );

      // If department user, only show sections from their department
      if (privileges?.departmentId) {
        const filteredSections = sectionsWithoutAdviser.filter(
          section => section.strand?.department_id === privileges.departmentId
        );
        setSectionsWithoutAdviser(filteredSections);
      } else {
        setSectionsWithoutAdviser(sectionsWithoutAdviser);
      }
    } catch (err) {
      console.error("Error fetching sections without adviser:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3001/users");
      // If department head, filter users to only show their department's users
      if (privileges?.departmentId) {
        setUsers(response.data.filter(user => 
          (user.departmentUser && user.departmentUser.department_id === privileges.departmentId) ||
          (user.sectionUser && user.sectionUser.department_id === privileges.departmentId)
        ));
      } else {
        setUsers(response.data);
      }
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Error fetching users:", err);
    }
  };

  const handleDelete = async (id) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/users/${userToDelete}`);
      setShowDeleteModal(false);
      setSuccess("User deleted successfully");
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        fetchUsers();
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Error deleting user");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const getDepartmentName = (user) => {
    if (user.departmentUser && user.departmentUser.department) {
      return user.departmentUser.department.department_name;
    }
    if (user.sectionUser && user.sectionUser.department) {
      return user.sectionUser.department.department_name;
    }
    return 'No Department';
  };

  const getSectionInfo = (user) => {
    if (user.sectionUser && user.sectionUser.section) {
      return `${user.sectionUser.section.grade_level} - ${user.sectionUser.section.section_name}`;
    }
    return '';
  };

  const departmentUsers = users.filter(user => user.type === 'department_user');
  const sectionUsers = users.filter(user => user.type === 'section_user');

  if (error) return (
    <div className="error-alert" role="alert">
      <p className="font-bold">Error</p>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="container workspace-page users-page">
      <WorkspacePageHeader
        eyebrow="Access management"
        title="Users"
        count={users.length}
        description="Manage department heads, advisers, and their account access."
        actions={!privileges?.departmentId && privileges?.canAddDepartmentUsers ? (
          <Link to="/Users/CreateUser?type=department" className="workspace-primary-action">
            <FiPlus aria-hidden="true" />
            <span>New user</span>
          </Link>
        ) : privileges?.canAddAdvisers ? (
          <Link to="/Users/DUser" className="workspace-primary-action">
            <FiPlus aria-hidden="true" />
            <span>New adviser</span>
          </Link>
        ) : null}
      />
      {/* Warning Message for Departments without Head */}
      {!privileges?.departmentId && departmentsWithoutHead.length > 0 && (
        <div className="warning-message danger">
          <span>
            <strong>Warning:</strong> {departmentsWithoutHead.length} department{departmentsWithoutHead.length !== 1 ? 's' : ''} without an assigned department head
          </span>
          {privileges?.canAddDepartmentUsers && (
            <Link to="/Users/CreateUser?type=department" className="warning-action-button">
              Add Department Head
            </Link>
          )}
        </div>
      )}

      {/* Warning Message for Sections without Adviser */}
      {sectionsWithoutAdviser.length > 0 && (
        <div className="warning-message">
          <span>
            <strong>Warning:</strong> {sectionsWithoutAdviser.length} section{sectionsWithoutAdviser.length !== 1 ? 's' : ''} without an assigned adviser
          </span>
          {privileges?.canAddAdvisers && (
            <Link to="/Users/CreateUser?type=adviser" className="warning-action-button">
              Add Adviser
            </Link>
          )}
        </div>
      )}

      {showSuccessMessage && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* Only show Department Users table for admin users */}
      {!privileges?.departmentId && (
        <div className="table-container">
          <h2>Department Heads</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="text-center">Name</th>
                  <th className="text-center">Username</th>
                  <th className="text-center">Department</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departmentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-message">
                      No department users found
                    </td>
                  </tr>
                ) : (
                  departmentUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="text-center">
                        <div className="user-name">
                          {user.firstname} {user.middlename} {user.lastname}
                        </div>
                      </td>
                      <td className="text-center">{user.username}</td>
                      <td className="text-center">{getDepartmentName(user)}</td>
                      <td className="text-center">
                        <div className="action-buttons">
                          <Link
                            to={`/Users/EditUser/${user.id}`}
                            className="edit-button"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="delete-button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section Users Table */}
      <div className="table-container">
        <h2>Advisers</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="text-center">Name</th>
                <th className="text-center">Username</th>
                <th className="text-center">Section</th>
                <th className="text-center">Department</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sectionUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-message">
                    No section users found
                  </td>
                </tr>
              ) : (
                sectionUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="text-center">
                      <div className="user-name">
                        {user.firstname} {user.middlename} {user.lastname}
                      </div>
                    </td>
                    <td className="text-center">{user.username}</td>
                    <td className="text-center">{getSectionInfo(user)}</td>
                    <td className="text-center">{getDepartmentName(user)}</td>
                    <td className="text-center">
                      <div className="action-buttons">
                        <Link
                          to={`/Users/EditUser/${user.id}`}
                          className="edit-button"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal isOpen={showDeleteModal} title="Delete this user?" message="The user will immediately lose access to LN Pulse." confirmLabel="Delete user" variant="danger" onConfirm={confirmDelete} onCancel={cancelDelete}>
        <p className="confirmation-warning">This action cannot be undone.</p>
      </ConfirmationModal>
    </div>
  );
};

export default Users;
