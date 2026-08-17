import React, { useState, useEffect } from "react";
import apiClient from "../../../shared/api/client";
import { Link } from "react-router-dom";
import { useAuth } from "../../../core/auth/AuthContext";
import "./Users.css";
import { FiEdit3, FiPlus, FiTrash2, FiUserCheck, FiUsers } from "react-icons/fi";
import WorkspacePageHeader from "../../../shared/components/WorkspacePageHeader";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";

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
      const departmentsResponse = await apiClient.get("/departments");
      const allDepartments = departmentsResponse.data;

      // Get all department users (heads)
      const usersResponse = await apiClient.get("/users");
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
      const sectionsResponse = await apiClient.get("/sections");
      const allSections = sectionsResponse.data;

      // Get all section users (advisers)
      const usersResponse = await apiClient.get("/users");
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
      const response = await apiClient.get("/users");
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
      await apiClient.delete(`/users/${userToDelete}`);
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

  const getFullName = (user) =>
    [user.firstname, user.middlename, user.lastname].filter(Boolean).join(' ');

  const getUserInitials = (user) =>
    `${user.firstname?.charAt(0) || ''}${user.lastname?.charAt(0) || ''}`.toUpperCase();

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
          <div className="collection-section-heading">
            <div className="collection-section-title"><span className="collection-section-icon"><FiUsers /></span><div><h2>Department Heads</h2><p>Manage department-level access and assignments</p></div></div>
            <span className="collection-count">{departmentUsers.length}</span>
          </div>
          <div className="table-wrapper">
            <table className="table users-data-table department-heads-table">
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
                        <div className="table-empty-state"><FiUsers /><strong>No department heads yet</strong><span>New department heads will appear here.</span></div>
                    </td>
                  </tr>
                ) : (
                  departmentUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-identity">
                          <span className="user-avatar">{getUserInitials(user)}</span>
                          <span><strong>{getFullName(user)}</strong><small>Department head</small></span>
                        </div>
                      </td>
                      <td><span className="username-pill">@{user.username}</span></td>
                      <td><span className="assignment-chip department">{getDepartmentName(user)}</span></td>
                      <td className="text-center">
                        <div className="instance-actions">
                          <Link
                            to={`/Users/EditUser/${user.id}`}
                            className="instance-action edit"
                            title="Edit user"
                            aria-label={`Edit ${getFullName(user)}`}
                          >
                            <FiEdit3 />
                          </Link>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="instance-action delete"
                            title="Delete user"
                            aria-label={`Delete ${getFullName(user)}`}
                          >
                            <FiTrash2 />
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
        <div className="collection-section-heading">
          <div className="collection-section-title"><span className="collection-section-icon adviser"><FiUserCheck /></span><div><h2>Advisers</h2><p>Review section advisers and their assigned classes</p></div></div>
          <span className="collection-count">{sectionUsers.length}</span>
        </div>
        <div className="table-wrapper">
          <table className="table users-data-table advisers-table">
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
                    <div className="table-empty-state"><FiUserCheck /><strong>No advisers yet</strong><span>Assigned section advisers will appear here.</span></div>
                  </td>
                </tr>
              ) : (
                sectionUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-identity">
                        <span className="user-avatar adviser">{getUserInitials(user)}</span>
                        <span><strong>{getFullName(user)}</strong><small>Section adviser</small></span>
                      </div>
                    </td>
                    <td><span className="username-pill">@{user.username}</span></td>
                    <td><span className="assignment-chip section">{getSectionInfo(user) || 'Unassigned'}</span></td>
                    <td><span className="assignment-chip department">{getDepartmentName(user)}</span></td>
                    <td className="text-center">
                      <div className="instance-actions">
                        <Link
                          to={`/Users/EditUser/${user.id}`}
                          className="instance-action edit"
                          title="Edit user"
                          aria-label={`Edit ${getFullName(user)}`}
                        >
                          <FiEdit3 />
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="instance-action delete"
                          title="Delete user"
                          aria-label={`Delete ${getFullName(user)}`}
                        >
                          <FiTrash2 />
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
