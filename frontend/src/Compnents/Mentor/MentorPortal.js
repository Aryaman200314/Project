import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

const MentorPortal = () => {
  const navigate = useNavigate();
  const isMentor = true;

  const [records, setRecords] = useState([
    {
      id: 1,
      name: 'task1.pdf',
      path: '/files/task1.pdf',
      completed: true,
      approved: false,
    },
    {
      id: 2,
      name: 'assignment1.docx',
      path: '/files/assignment1.docx',
      completed: false,
      approved: false,
    },
  ]);

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
    return '✅ Completed';
  };

  return (
    <>
      <div className="top-bar">
        <h2>Mentor Dashboard</h2>
      </div>
      <div className="view-records-container">
        <h2>Review Tasks</h2>
        <table className="records-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Download</th>
              <th>Status</th>
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
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={file.approved}
                      disabled={!file.completed}
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
      <button className="back-btn" onClick={() => navigate('/')}>
        Back
      </button>
    </>
  );
};

export default MentorPortal;
