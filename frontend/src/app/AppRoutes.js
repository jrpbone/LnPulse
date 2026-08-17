import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { Login, Unauthorized } from "../features/auth";
import { Dashboard } from "../features/dashboard";
import {
  AcademicInfo,
  CreateStudent,
  EditStudent,
  SectionStudents,
  Student,
  StudentList,
} from "../features/students";
import { Departments, Strands } from "../features/organization";
import { Grades, Subjects } from "../features/curriculum";
import { CreateUser, DepartmentUser, EditUser, Users } from "../features/users";
import { Reports } from "../features/reports";

const protectedPage = (element, requiredPrivileges, unauthorizedRoles) => (
  <ProtectedRoute
    requiredPrivileges={requiredPrivileges}
    unauthorizedRoles={unauthorizedRoles}
  >
    {element}
  </ProtectedRoute>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/dashboard" element={protectedPage(<Dashboard />)} />

      <Route
        path="/StudentList/new"
        element={protectedPage(
          <CreateStudent />,
          ["canManageStudents", "canViewAllStudents"],
          ["adviser"]
        )}
      />
      <Route
        path="/StudentList"
        element={protectedPage(<StudentList />, ["canViewAllStudents"])}
      />
      <Route
        path="/Student/:student_id"
        element={protectedPage(<Student />, ["canManageStudents"])}
      />
      <Route
        path="/EditStudent"
        element={protectedPage(<EditStudent />, ["canManageStudents"])}
      />
      <Route
        path="/academic-info/:student_id"
        element={protectedPage(<AcademicInfo />, ["canManageStudents"])}
      />
      <Route
        path="/section/:sectionId/students"
        element={protectedPage(<SectionStudents />, ["canManageStudents"])}
      />
      <Route
        path="/Student/:student_id/grades/:acads_id"
        element={protectedPage(<Grades />, ["canManageStudents"])}
      />

      <Route
        path="/Departments"
        element={protectedPage(<Departments />, ["canViewDepartments"])}
      />
      <Route
        path="/Departments/:departmentId"
        element={protectedPage(<Departments />, ["canViewDepartments"])}
      />
      <Route path="/strands/:department_id" element={protectedPage(<Strands />)} />
      <Route
        path="/Subjects"
        element={protectedPage(<Subjects />, ["canViewSubjects"])}
      />

      <Route
        path="/Users"
        element={protectedPage(<Users />, ["canManageUsers"])}
      />
      <Route
        path="/Users/CreateUser"
        element={protectedPage(<CreateUser />, ["canManageUsers"])}
      />
      <Route
        path="/Users/DUser"
        element={protectedPage(<DepartmentUser />, ["canAddAdvisers"])}
      />
      <Route
        path="/Users/EditUser/:id"
        element={protectedPage(<EditUser />, ["canManageUsers"])}
      />
      <Route
        path="/reports"
        element={protectedPage(<Reports />, ["canViewReports"])}
      />
    </Routes>
  );
}

export default AppRoutes;
