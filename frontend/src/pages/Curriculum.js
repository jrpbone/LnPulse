import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

function Curriculum() {
  const { strandId } = useParams();
  const location = useLocation();
  const strandName = location.state?.strandName;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [curriculum, setCurriculum] = useState({
    11: {
      '1st Semester': { core: [], specialized: [] },
      '2nd Semester': { core: [], specialized: [] }
    },
    12: {
      '1st Semester': { core: [], specialized: [] },
      '2nd Semester': { core: [], specialized: [] }
    }
  });

  useEffect(() => {
    fetchCurriculum();
  }, [strandId]);

  const fetchCurriculum = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/curriculum/byStrand/${strandId}`);
      if (response.data) {
        setCurriculum(response.data);
      }
    } catch (error) {
      console.error('Error fetching curriculum:', error);
    }
  };

  const fetchAvailableSubjects = async (type) => {
    try {
      let subjects;
      if (type === 'core') {
        const response = await axios.get('http://localhost:3001/subjects/common');
        subjects = response.data;
      } else {
        const response = await axios.get(`http://localhost:3001/subjects/byStrand/${strandId}`);
        subjects = response.data.filter(subject => !subject.is_common);
      }
      setAvailableSubjects(subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleOpenAddModal = (gradeLevel, semester, type) => {
    setSelectedGradeLevel(gradeLevel);
    setSelectedSemester(semester);
    setSelectedType(type);
    fetchAvailableSubjects(type);
    setShowAddModal(true);
  };

  const handleSubjectCheck = (subjectId) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleAddSubjects = async () => {
    try {
      for (const subjectId of selectedSubjects) {
        await axios.post('http://localhost:3001/curriculum/assign', {
          strand_id: strandId,
          subject_id: subjectId,
          grade_level: selectedGradeLevel,
          semester: selectedSemester
        });
      }
      fetchCurriculum();
      setShowAddModal(false);
      setSelectedSubjects([]);
    } catch (error) {
      console.error('Error assigning subjects:', error);
    }
  };

  const handleRemoveSubject = async (curriculumId) => {
    if (!window.confirm('Are you sure you want to remove this subject?')) return;
    try {
      await axios.delete(`http://localhost:3001/curriculum/${curriculumId}`);
      fetchCurriculum();
    } catch (error) {
      console.error('Error removing subject:', error);
    }
  };

  return (
    <div className="curriculum-page">
      <h1>{strandName} Curriculum</h1>
      
      <table className="curriculum-table">
        <thead>
          <tr>
            <th colSpan="2">Grade 11</th>
            <th colSpan="2">Grade 12</th>
          </tr>
          <tr>
            <th>1st Semester</th>
            <th>2nd Semester</th>
            <th>1st Semester</th>
            <th>2nd Semester</th>
          </tr>
        </thead>
        <tbody>
          {/* Core Subjects Section */}
          <tr>
            <td className="section-header" colSpan="4">Core Subjects</td>
          </tr>
          <tr>
            {Object.keys(curriculum).map(grade => 
              Object.keys(curriculum[grade]).map(semester => (
                <td key={`${grade}-${semester}`}>
                  {curriculum[grade][semester].core.map(subject => (
                    <div key={subject.subject_id} className="subject-item">
                      {subject.subject_name}
                      <button 
                        onClick={() => handleRemoveSubject(subject.curriculum_id)}
                        className="remove-button"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => handleOpenAddModal(grade, semester, 'core')}
                    className="add-button"
                  >
                    + Add Core Subject
                  </button>
                </td>
              ))
            )}
          </tr>

          {/* Specialized Subjects Section */}
          <tr>
            <td className="section-header" colSpan="4">Specialized Subjects</td>
          </tr>
          <tr>
            {Object.keys(curriculum).map(grade => 
              Object.keys(curriculum[grade]).map(semester => (
                <td key={`${grade}-${semester}`}>
                  {curriculum[grade][semester].specialized.map(subject => (
                    <div key={subject.subject_id} className="subject-item">
                      {subject.subject_name}
                      <button 
                        onClick={() => handleRemoveSubject(subject.curriculum_id)}
                        className="remove-button"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => handleOpenAddModal(grade, semester, 'specialized')}
                    className="add-button"
                  >
                    + Add Specialized Subject
                  </button>
                </td>
              ))
            )}
          </tr>
        </tbody>
      </table>

      {/* Add Subjects Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add {selectedType === 'core' ? 'Core' : 'Specialized'} Subjects</h3>
            <h4>Grade {selectedGradeLevel} - {selectedSemester}</h4>
            
            {/* Select All checkbox */}
            <div className="select-all">
              <label>
                <input
                  type="checkbox"
                  checked={selectedSubjects.length === availableSubjects.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSubjects(availableSubjects.map(s => s.subject_id));
                    } else {
                      setSelectedSubjects([]);
                    }
                  }}
                />
                Select All
              </label>
            </div>

            {/* Subjects List */}
            <div className="subjects-list">
              {availableSubjects.map(subject => (
                <div key={subject.subject_id} className="subject-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.subject_id)}
                      onChange={() => handleSubjectCheck(subject.subject_id)}
                    />
                    {subject.subject_name}
                  </label>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
              <button 
                onClick={handleAddSubjects}
                disabled={selectedSubjects.length === 0}
              >
                Add Selected
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .curriculum-page {
          padding: 20px;
        }

        .curriculum-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        .curriculum-table th,
        .curriculum-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          vertical-align: top;
        }

        .section-header {
          background-color: #f5f5f5;
          font-weight: bold;
          text-align: center;
        }

        .subject-item {
          margin: 5px 0;
          padding: 5px;
          background-color: #fff;
          border: 1px solid #eee;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .add-button {
          margin-top: 10px;
          padding: 5px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
        }

        .remove-button {
          background-color: #ff4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          min-width: 400px;
          max-width: 600px;
        }

        .select-all {
          margin-bottom: 10px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }

        .subjects-list {
          max-height: 300px;
          overflow-y: auto;
          margin: 10px 0;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .subject-checkbox {
          margin: 5px 0;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .modal-actions button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .modal-actions button:first-child {
          background-color: #ddd;
        }

        .modal-actions button:last-child {
          background-color: #4CAF50;
          color: white;
        }

        .modal-actions button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default Curriculum;