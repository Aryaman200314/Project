import React, { useState } from 'react';
import './ViewRecords.css';
import { useNavigate } from 'react-router-dom';

const ViewRecords = () => {
  const navigate = useNavigate();

  // Simulating mentor role (set to true for mentor view)
  const isMentor = false;

  const [records, setRecords] = useState([
    {
      id: 1,
      name: 'task1.pdf',
      path: '/files/task1.pdf',
      completed: false,
      approved: false,
    },
    {
      id: 2,
      name: 'assignment1.docx',
      path: '/files/assignment1.docx',
      completed: false,
      approved: false,
    },
    {
      id: 3,
      name: 'notes.txt',
      path: '/files/notes.txt',
      completed: true,
      approved: false,
    },
  ]);

  const toggleCompletion = (id) => {
    setRecords((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, completed: true } : file
      )
    );
  };

  const toggleApproval = (id) => {
    if (!isMentor) return;
    setRecords((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, approved: !file.approved } : file
      )
    );
  };

  const getStatus = (file) => {
    if (!file.completed) return '❌ Pending';
    if (file.completed && !file.approved) return '⏳ Pending Approval';
    if (file.completed && file.approved) return '✅ Completed';
  };

  return (
    <>
      <div className="top-bar">
        <h2>Record</h2>
      </div>
      <div className="view-records-container">
        <h2>Uploaded Tasks</h2>
        <table className="records-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Download</th>
              <th>Status</th>
              <th>Mark as Complete</th>
              <th>Mentor Approval</th>
            </tr>
          </thead>
          <tbody>
            {records.map((file) => (
              <tr key={file.id}>
                <td>{file.name}</td>
                <td>
                  <a href={file.path} download className="download-link">
                    Download
                  </a>
                </td>
                <td>{getStatus(file)}</td>
                <td>
                  <button
                    onClick={() => toggleCompletion(file.id)}
                    className="complete-btn"
                    disabled={file.completed}
                  >
                    {file.completed ? 'Completed' : 'Mark Complete'}
                  </button>
                </td>
                <td>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={file.approved}
                      disabled={!isMentor || !file.completed}
                      onChange={() => toggleApproval(file.id)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="back-btn" onClick={() => navigate('/home')}>
        Back
      </button>
    </>
  );
};

export default ViewRecords;
