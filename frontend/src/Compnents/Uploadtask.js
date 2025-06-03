import React, { useEffect, useState } from 'react';
import './UploadTask.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UploadTask = () => {
  const userEmail = localStorage.getItem('userEmail');
  const [mentor, setMentor] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [file, setFile] = useState(null);
  const [mentorOptions, setMentorOptions] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/mentors/list')
      .then(res => setMentorOptions(res.data))
      .catch(err => console.error('Failed to fetch mentors', err));
  }, []);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/tasks/latest/${userEmail}`)
      .then(res => setTimelineData(res.data))
      .catch(err => console.error("Failed to fetch timeline:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('mentor', mentor);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('keywords', keywords);
    formData.append('email', userEmail);
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/upload/task', formData);
      alert(res.data.message || 'Task uploaded successfully');
      window.location.reload();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Try again.');
    }
  };

  return (
    <>
      <div className="top-bar">
        <h2>Tasks</h2>
      </div>

      <div className="upload-task-page">
        {/* Timeline Column */}
        <div className="timeline-container">
          <h3 className="timeline-title">Timeline <span className="five-days">Latest-5</span></h3>
          {timelineData.length > 0 ? (
            timelineData.map((item, index) => (
              <div key={index} className="timeline-entry">
                <div className="date">{new Date(item.uploaded_at).toLocaleString()}</div>
                <div className="title">{item.title}</div>
              </div>
            ))
          ) : (
            <p className="no-tasks">No tasks uploaded yet.</p>
          )}

          <div className="timeline-actions">
            <button className="btn-primary" onClick={() => navigate('/home')}>Back</button>
            <button className="btn-primary" onClick={() => navigate('/timeline')}>View all submissions</button>
          </div>
        </div>

        {/* Upload Form Column */}
        <div className="upload-form-container">
          <h2>Upload Task</h2>
          <form onSubmit={handleSubmit} className="upload-task-form">
            <input
              list="mentor-suggestions"
              placeholder="Start typing mentor name or email"
              value={mentor}
              onChange={(e) => setMentor(e.target.value)}
              required
            />
            <datalist id="mentor-suggestions">
              {mentorOptions.map(m => (
                <option key={m.id} value={m.email}>
                  {m.name} ({m.email})
                </option>
              ))}
            </datalist>

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
            <button type="submit" className="btn-submit">Upload</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default UploadTask;
