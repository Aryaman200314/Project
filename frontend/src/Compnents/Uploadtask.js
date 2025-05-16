import React, { useState } from 'react';
import './UploadTask.css';
import { useNavigate } from 'react-router-dom';

const UploadTask = () => {
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
    a.download = `task-log-${Date.now()}.json`;
    a.click();

    const fileUrl = URL.createObjectURL(file);
    const fileAnchor = document.createElement('a');
    fileAnchor.href = fileUrl;
    fileAnchor.download = file.name;
    fileAnchor.click();

    alert('Task uploaded successfully (simulated for frontend demo)');
  };

  const timelineData = [
    { time: '2025-05-14 10:00 AM', task: 'Weekly Summary' },
    { time: '2025-05-13 04:30 PM', task: 'Bug Fixes Report' },
    { time: '2025-05-12 09:15 AM', task: 'Design Update' },
    { time: '2025-05-10 02:45 PM', task: 'Sprint Goals' },
    { time: '2025-05-09 11:00 AM', task: 'Feature Demo' },
  ];

  return (
    <>
      <div className="top-bar">
        <h2>Tasks</h2>
      </div>

      <div className="upload-task-page" style={{ display: 'flex', height: '100vh' }}>
        {/* Timeline Column */}
        <div style={{ width: '30%', padding: '20px', backgroundColor: '#f5f5f5', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
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
                <div style={{ fontWeight: 'bold' }}>{item.task}</div>
              </li>
            ))}
          </ul>
          <button onClick={() => navigate('/home')}>Back</button>
        </div>

        {/* Upload Form Column */}
        <div className="upload-container" style={{ flex: 1, padding: '30px' }}>
          <h2>Upload Task</h2>
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
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Task Description"
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

export default UploadTask;
