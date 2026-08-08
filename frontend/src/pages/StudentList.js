import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { FaChevronLeft, FaChevronRight, FaSearch } from 'react-icons/fa';
import "./styles_sl.css";

function StudentList() {
  const [listOfStudents, setListOfStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { privileges } = useAuth();

  // Filter students based on search query, status and gender
  const filteredStudents = listOfStudents.filter(student => {
    const matchesStatus = statusFilter === 'all' || student.status.toLowerCase() === statusFilter;
    const matchesGender = genderFilter === 'all' || student.sex === genderFilter;
    
    if (!searchQuery) return matchesStatus && matchesGender;

    const query = searchQuery.toLowerCase();
    const fullName = `${student.last_name}, ${student.first_name} ${student.middle_name || ''} ${student.suffix || ''}`.toLowerCase();
    const email = (student.email || '').toLowerCase();
    const contact = String(student.contact_num || '');
    const studentId = String(student.student_id || '');

    return matchesStatus && matchesGender && (
      fullName.includes(query) ||
      email.includes(query) ||
      contact.includes(query) ||
      studentId.includes(query)
    );
  });

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, genderFilter, searchQuery]);

  // Change page
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        let response;

        // If user is a section adviser, only fetch students from their section
        if (privileges?.sectionId) {
          response = await axios.get(`http://localhost:3001/students/section/${privileges.sectionId}`);
        } 
        // If user is a department user, fetch all students but filter by department
        else if (privileges?.departmentId) {
          response = await axios.get(`http://localhost:3001/students/department/${privileges.departmentId}`);
        }
        // If user is admin, fetch all students
        else {
          response = await axios.get("http://localhost:3001/students");
        }

        setListOfStudents(response.data);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [privileges?.sectionId, privileges?.departmentId]);

  const handleEdit = async (student) => {
    try {
      console.log("Fetching student data for:", student.student_id);
      const response = await axios.get(`http://localhost:3001/students/byId/${student.student_id}`);
      const completeStudentData = response.data;
      console.log("Received student data:", completeStudentData);

      navigate('/EditStudent', {
        state: {
          studentData: completeStudentData
        }
      });
    } catch (error) {
      console.error("Error fetching student data:", error);
      alert("Failed to load student data. Please try again.");
    }
  };

  const handlePrint = async (student) => {
    try {
      // Fetch complete student data including guardian and address info
      const studentResponse = await axios.get(`http://localhost:3001/students/byId/${student.student_id}`);
      const studentData = studentResponse.data;

      // Fetch academic info
      const academicResponse = await axios.get(`http://localhost:3001/academicInfo/byStudent/${student.student_id}`);
      const academicInfo = academicResponse.data;

      // Create a new window for printing
      const printWindow = window.open('', '_blank');

      // Generate the print content with styling
      printWindow.document.write(`
        <html>
          <head>
            <title>Student Details</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 10px;
              }
              .section {
                margin-bottom: 20px;
              }
              .section-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
                background-color: #f5f5f5;
                padding: 5px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
              }
              .info-item {
                margin-bottom: 5px;
              }
              .label {
                font-weight: bold;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f5f5f5;
              }
              @media print {
                body {
                  padding: 0;
                }
                button {
                  display: none;
                }
                @page {
                  margin: 0.5cm;
                  size: auto;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Student Information</h1>
              <p>LNHS Student Information System</p>
            </div>

            <div class="section">
              <div class="section-title">Personal Information</div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">LRN:</span> ${studentData.student_id}
                </div>
                <div class="info-item">
                  <span class="label">Name:</span> ${studentData.last_name}, ${studentData.first_name} ${studentData.middle_name || ''} ${studentData.suffix || ''}
                </div>
                <div class="info-item">
                  <span class="label">Birth Date:</span> ${studentData.birth_date}
                </div>
                <div class="info-item">
                  <span class="label">Place of Birth:</span> ${studentData.place_of_birth}
                </div>
                <div class="info-item">
                  <span class="label">Age:</span> ${studentData.age}
                </div>
                <div class="info-item">
                  <span class="label">Gender:</span> ${studentData.sex}
                </div>
                <div class="info-item">
                  <span class="label">Contact:</span> ${studentData.contact_num}
                </div>
                <div class="info-item">
                  <span class="label">Email:</span> ${studentData.email}
                </div>
                <div class="info-item">
                  <span class="label">Religion:</span> ${studentData.religion}
                </div>
                <div class="info-item">
                  <span class="label">Height:</span> ${studentData.height}
                </div>
                <div class="info-item">
                  <span class="label">Weight:</span> ${studentData.weight}
                </div>
                <div class="info-item">
                  <span class="label">BMI:</span> ${studentData.bmi}
                </div>
                <div class="info-item">
                  <span class="label">Nationality:</span> ${studentData.nationality}
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Guardian Information</div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Guardian Name:</span> ${studentData.PARENT_GUARDIAN_T ?
          `${studentData.PARENT_GUARDIAN_T.pgLastName}, ${studentData.PARENT_GUARDIAN_T.pgFirstName} ${studentData.PARENT_GUARDIAN_T.pgMiddleName || ''}` : 'N/A'}
                </div>
                <div class="info-item">
                  <span class="label">Contact Number:</span> ${studentData.PARENT_GUARDIAN_T?.pgContactNum || 'N/A'}
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Address Information</div>
              <div class="info-item">
                <span class="label">Current Address:</span> ${studentData.currentAddressData ?
          [
            studentData.currentAddressData.houseNo,
            studentData.currentAddressData.street_barangay,
            studentData.currentAddressData.city_municipality,
            studentData.currentAddressData.province
          ].filter(Boolean).join(', ') : 'N/A'
        }
              </div>
              <div class="info-item">
                <span class="label">Permanent Address:</span> ${studentData.permanentAddressData ?
          [
            studentData.permanentAddressData.houseNo,
            studentData.permanentAddressData.street_barangay,
            studentData.permanentAddressData.city_municipality,
            studentData.permanentAddressData.province
          ].filter(Boolean).join(', ') : 'N/A'
        }
              </div>
            </div>

            <div class="section">
              <div class="section-title">Academic Information</div>
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Strand</th>
                    <th>Grade Level</th>
                    <th>Section</th>
                    <th>School Year</th>
                    <th>Semester</th>
                    <th>Entry Status</th>
                    <th>Exit Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${academicInfo.map(info => `
                    <tr>
                      <td>${info.DEPARTMENT_T?.department_name || ''}</td>
                      <td>${info.STRAND_T?.strand_name || ''}</td>
                      <td>${info.gradeLevel}</td>
                      <td>${info.SECTION_T?.section_name || ''}</td>
                      <td>${info.schoolYear}</td>
                      <td>${info.semester}</td>
                      <td>${info.entryStatus}</td>
                      <td>${info.exitStatus}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px;">Print</button>
          </body>
        </html>
      `);

      printWindow.document.close();
    } catch (error) {
      console.error("Error preparing print view:", error);
      alert("Failed to prepare print view. Please try again.");
    }
  };

  const handleView = (student) => {
    navigate(`/Student/${student.student_id}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="student-panel">
      <div className="panel-header">
        <h1 className="title">
          Students
          <span className="student-count">{filteredStudents.length}</span>
        </h1>
        <div className="header-controls">
          <div className="search-container">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, email, contact, or LRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="filter-group">
            <label className="status-label">Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <label className="status-label">Gender:</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="items-per-page">
            <label className="status-label">Show:</label>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="status-filter"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <Link to="/CreateStudent" className="add">
            + Add a student
          </Link>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="student-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Contact Number</th>
              <th>Email</th>
              <th>Status</th>
              <th>Date Created</th>
              <th>Date Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((student) => (
              <tr key={student.student_id}>
                <td data-full-text={student.student_id}>{student.student_id}</td>
                <td data-full-text={`${student.last_name}, ${student.first_name} ${student.middle_name ? student.middle_name.charAt(0) + "." : ""} ${student.suffix || ""}`.trim()}>
                  {`${student.last_name}, ${student.first_name} ${student.middle_name ? student.middle_name.charAt(0) + "." : ""} ${student.suffix || ""}`.trim()}
                </td>
                <td data-full-text={student.sex}>{student.sex}</td>
                <td data-full-text={student.contact_num}>{student.contact_num}</td>
                <td data-full-text={student.email}>{student.email}</td>
                <td>
                  <span className={`status-badge status-${student.status.toLowerCase()}`}>
                    {student.status}
                  </span>
                </td>
                <td data-full-text={new Date(student.createdAt).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit"
                })}>
                  {new Date(student.createdAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  })}
                </td>
                <td data-full-text={new Date(student.updatedAt).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit"
                })}>
                  {new Date(student.updatedAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  })}
                </td>
                <td>
                  <button className="view-button" onClick={() => handleView(student)}>View</button>
                  <button className="edit-student-button" onClick={() => handleEdit(student)}>Edit</button>
                  <button className="papel-button" onClick={() => handlePrint(student)}>Print</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button 
          className="page-btn"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous Page"
        >
          <FaChevronLeft />
        </button>
        <span className="current-page">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          className="page-btn"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next Page"
        >
          <FaChevronRight />
        </button>
        <div className="pagination-info">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} entries
        </div>
      </div>
    </div>
  );
}

export default StudentList;
