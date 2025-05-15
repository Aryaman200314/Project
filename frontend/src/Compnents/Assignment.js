import React, { useState } from 'react';
import './Assignment.css';

const Assignment = () => {
  const [mentor, setMentor] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    const now = new Date();
    const time = now.toISOString();

    // Simulate saving file + time by triggering download
    const logData = {
      mentor,
      title,
      description,
      keywords,
      fileName: file.name,
      time,
    };

    // Save log as JSON
    const jsonBlob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const logUrl = URL.createObjectURL(jsonBlob);

    const a = document.createElement('a');
    a.href = logUrl;
    a.download = `task-log-${Date.now()}.json`;
    a.click();

    // Save uploaded file
    const fileUrl = URL.createObjectURL(file);
    const fileAnchor = document.createElement('a');
    fileAnchor.href = fileUrl;
    fileAnchor.download = file.name;
    fileAnchor.click();

    alert('Assignment uploaded successfully (simulated for frontend demo)');
  };

  return (
    <div className="upload-container">
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
  );
};

export default Assignment;
