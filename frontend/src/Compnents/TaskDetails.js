// TaskDetails.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TaskDetails.css';

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

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const entry = sampleData.find((item) => item.id === parseInt(id));

  if (!entry) {
    return (
      <div className="details-container">
        <h2>Task not found</h2>
        <button onClick={() => navigate('/timeline')}>Back</button>
      </div>
    );
  }

  return (
    <div className="details-container">
      <h2>{entry.title}</h2>
      <p><strong>Type:</strong> {entry.type}</p>
      <p><strong>Uploaded:</strong> {new Date(entry.timestamp).toLocaleString()}</p>
      <p><strong>Description:</strong> {entry.description}</p>
      <p><strong>File:</strong> <a href={`/${entry.file}`} download>{entry.file}</a></p>

      <button onClick={() => navigate('/timeline')}>Back to Timeline</button>
    </div>
  );
};

export default TaskDetails;
