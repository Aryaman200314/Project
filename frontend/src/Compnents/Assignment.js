import React, { useState } from 'react';
import './Assignment.css';
import { useNavigate } from 'react-router-dom';

const Assignment = () => {
  const [mentor, setMentor] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    const now = new Date();
    const time = now.toISOString();

    const logData = {
      mentor,
      title,
      description,
      keywords,
      fileName: file.name,
      time,
    };

    const jsonBlob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const logUrl = URL.createObjectURL(jsonBlob);

    const a = document.createElement('a');
    a.href = logUrl;
    a.download = `assignment-log-${Date.now()}.json`;
    a.click();

    const fileUrl = URL.createObjectURL(file);
    const fileAnchor = document.createElement('a');
    fileAnchor.href = fileUrl;
    fileAnchor.download = file.name;
    fileAnchor.click();

    alert('Assignment uploaded successfully (simulated for frontend demo)');
  };

  const timelineData = [
    { time: '2025-05-14 04:30 PM', assignment: 'Cloud Security Report' },
    { time: '2025-05-13 11:00 AM', assignment: 'AI Project Outline' },
    { time: '2025-05-12 03:15 PM', assignment: 'Database Design Submission' },
    { time: '2025-05-10 09:45 AM', assignment: 'Kubernetes Setup Guide' },
    { time: '2025-05-08 07:20 PM', assignment: 'System Architecture Draft' },
  ];

  return (
    <>
      <div className="top-bar">
        <h2>Assignment</h2>
      </div>

      <div className="assignment-page" style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Timeline */}
        <div style={{ width: '30%', padding: '20px', backgroundColor: '#f5f5f5', borderRight: '1px solid #ccc' }}>
          <h3 style={{ marginBottom: '20px' }}>Timeline</h3>
          <ul style={{ borderLeft: '2px solid #007bff', paddingLeft: '15px' }}>
            {timelineData.map((item, index) => (
              <li key={index} style={{ marginBottom: '20px', position: 'relative' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#007bff',
                    borderRadius: '50%',
                    position: 'absolute',
                    left: '-20px',
                    top: '5px',
                  }}
                ></div>
                <div style={{ fontSize: '0.9rem', color: '#555' }}>{item.time}</div>
                <div style={{ fontWeight: 'bold' }}>{item.assignment}</div>
              </li>
            ))}
          </ul>
          <button className="back-btn" onClick={() => navigate('/home')}>Back</button>
        </div>

        {/* Upload Form */}
        <div className="upload-container" style={{ flex: 1 }}>
          <h2>Upload Assignment</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Mentor Name"
              value={mentor}
              onChange={(e) => setMentor(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Assignment Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Assignment Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
            <input
              type="text"
              placeholder="Keywords (comma separated)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              required
            />
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
            <button type="submit">Upload</button>
          </form>
        </div>
      </div>

    </>
  );
};

export default Assignment;
