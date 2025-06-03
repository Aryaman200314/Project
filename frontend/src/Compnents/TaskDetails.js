import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Timeline.css';

const TimelineDetails = () => {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log(id);
    axios.get(`http://localhost:5000/api/timeline/details/${id}`)
      .then(res => setEntry(res.data))
      .catch(err => console.error("Failed to fetch entry details:", err));
  }, [id]);

  if (!entry) return <p>Loading...</p>;

  return (
    <div className="timeline-details-container">
      <div className="timeline-details-card">
        <h2>{entry.title}</h2>
        <p><strong>Type:</strong> {entry.type}</p>
        <p><strong>Uploaded:</strong> {new Date(entry.uploaded_at).toLocaleString()}</p>
        <p><strong>Description:</strong> {entry.description}</p>
        <p><strong>File:</strong> <a href={`http://localhost:5000/uploads/${entry.filename}`} target="_blank" rel="noopener noreferrer">{entry.filename}</a></p>
        <button className="back-btn" onClick={() => navigate('/timeline')}>Back to Timeline</button>
      </div>
    </div>
  );
};

export default TimelineDetails;
