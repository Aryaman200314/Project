import React, { useState, useEffect } from 'react';
import './Assignment.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Assignment = () => {
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
    axios.get(`http://localhost:5000/api/assignments/latest/${userEmail}`)
      .then(res => setTimelineData(res.data))
      .catch(err => console.error("Failed to fetch timeline:", err));
  }, [userEmail]);

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
      const res = await axios.post('http://localhost:5000/api/upload/assignment', formData);
      alert(res.data.message || 'Assignment uploaded successfully');
      window.location.reload();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Try again.');
    }
  };

  return (
    <>
      <div className="top-bar">
        <h2>Assignments</h2>
      </div>

      <div className="assignment-page" style={{ display: 'flex', minHeight: '100vh', flexWrap: 'wrap' }}>
        {/* Timeline */}
        <div style={{ flex: '1 1 100%', maxWidth: '30%', padding: '20px', backgroundColor: '#f5f5f5', borderRight: '1px solid #ccc' }}>
          <h3 style={{ marginBottom: '20px' }}>Timeline <span className='five-days'>Latest-5</span></h3>
          <ul style={{ borderLeft: '2px solid #007bff', paddingLeft: '15px' }}>
            {timelineData.length > 0 ? (
              timelineData.map((item, index) => (
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
                  <div style={{ fontSize: '0.9rem', color: '#555' }}>
                    {new Date(item.uploaded_at).toLocaleString()}
                  </div>
                  <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                </li>
              ))
            ) : (
              <li style={{ color: '#888', fontStyle: 'italic', marginTop: '10px' }}>
                No assignments uploaded yet.
              </li>
            )}
          </ul>
        </div>

        {/* Upload Form */}
        <div className="upload-container" style={{ flex: '1 1 70%' }}>
          <h2>Upload Assignment</h2>
          <form onSubmit={handleSubmit}>
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
            <button className='upload-btn' type="submit">Upload</button>
            <button id="back-btn" onClick={() => navigate('/home')}>Back</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Assignment;
