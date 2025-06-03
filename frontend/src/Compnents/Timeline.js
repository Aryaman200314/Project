// Timeline.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Timeline.css';
import axios from 'axios';

const Timeline = () => {
  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    axios.get(`http://localhost:5000/api/timeline/${userEmail}`)
      .then(res => setEntries(res.data))
      .catch(err => console.error("Failed to fetch timeline:", err));
  }, [userEmail]);

  useEffect(() => {
    let data = [...entries];

    if (filterType !== 'all') {
      data = data.filter((e) => e.type === filterType);
    }

    if (search.trim()) {
      data = data.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    data.sort((a, b) => {
      return sortOrder === 'asc'
        ? new Date(a.uploaded_at) - new Date(b.uploaded_at)
        : new Date(b.uploaded_at) - new Date(a.uploaded_at);
    });

    setFiltered(data);
  }, [search, filterType, sortOrder, entries]);

  return (
    <div className="timeline-container">
      <h2>Check Timeline</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All</option>
          <option value="task">Task</option>
          <option value="assignment">Assignment</option>
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      <div className="timeline-list">
        {filtered.map((entry, index) => (
          <div
            key={entry.id || index}
            className={`timeline-item ${entry.type}`}
            onClick={() => navigate(`/details/${entry.id || ''}`)}

          >
            <div className="timeline-content">
              <h3>{entry.title}</h3>
              <p>Type: {entry.type}</p>
              <p>Uploaded At: {new Date(entry.uploaded_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="back-btn" onClick={() => navigate('/home')}>Back</button>
    </div>
  );
};

export default Timeline;
