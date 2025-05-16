// Timeline.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Timeline.css';

const sampleData = [
  {
    id: 1,
    title: 'AWS EC2 Setup',
    timestamp: '2025-05-12T10:00:00Z',
    type: 'assignment',
    description: 'Set up a virtual server using AWS EC2.',
    file: 'aws-ec2-setup.pdf'
  },
  {
    id: 2,
    title: 'S3 Bucket Configuration',
    timestamp: '2025-05-13T14:00:00Z',
    type: 'task',
    description: 'Configure static website hosting in AWS S3.',
    file: 's3-website-task.pdf'
  },
  {
    id: 3,
    title: 'IAM Role Creation',
    timestamp: '2025-05-14T09:30:00Z',
    type: 'assignment',
    description: 'Create a secure IAM role with limited privileges.',
    file: 'iam-role.pdf'
  },
  {
    id: 4,
    title: 'Lambda Function Deployment',
    timestamp: '2025-05-15T11:45:00Z',
    type: 'task',
    description: 'Deploy a Node.js Lambda function using the AWS CLI.',
    file: 'lambda-deploy.pdf'
  }
];

const Timeline = () => {
  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();

  useEffect(() => {
    setEntries(sampleData);
    setFiltered(sampleData);
  }, []);

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
        ? new Date(a.timestamp) - new Date(b.timestamp)
        : new Date(b.timestamp) - new Date(a.timestamp);
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
        {filtered.map((entry) => (
          <div
            key={entry.id}
            className={`timeline-item ${entry.type}`}
            onClick={() => navigate(`/details/${entry.id}`)}
          >
            <div className="timeline-content">
              <h3>{entry.title}</h3>
              <p>Type: {entry.type}</p>
              <p>Uploaded At: {new Date(entry.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="back-btn" onClick={() => navigate('/home')}>Back</button>
    </div>
  );
};

export default Timeline;
