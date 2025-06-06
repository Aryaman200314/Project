import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ViewRecords.css'; // Reuse same CSS
import { useNavigate } from 'react-router-dom';

const statusColumns = ['new', 'inprogress', 'backlog', 'pending', 'review', 'done'];

const ViewRecords = () => {
  const [tasks, setTasks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const menteeEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  useEffect(() => {
    if (!menteeEmail) {
      console.warn("No mentee email found in localStorage!");
      return;
    }

    axios.get(`http://localhost:5000/api/tasks/by-mentee?email=${menteeEmail}`)
      .then(res => setTasks(res.data))
      .catch(err => console.error("Error fetching tasks", err));

    axios.get(`http://localhost:5000/api/assignments/by-mentee?email=${menteeEmail}`)
      .then(res => setAssignments(res.data))
      .catch(err => console.error("Error fetching assignments", err));
  }, [menteeEmail]);

  const renderCard = (item, type) => (
    <div
      key={`${type}-${item.id}`}
      className="kanban-card"
    >
      <h4>{item.title}</h4>
      <p>{item.description}</p>
      <p><strong>Due:</strong> {item.end_time ? new Date(item.end_time).toLocaleString() : ''}</p>
      <p>
        <strong>Mentor:</strong> {item.mentor_name || item.mentor_email || item.mentor_first || item.mentor}
      </p>
      <span className={`tag ${type}`}>{type.toUpperCase()}</span>
    </div>
  );

  return (
    <>  
    <div className='heading-div'>
      <h1>Kanban <span className='snap-mentee'>mentee</span></h1>
      <span className='snap-mentee'>You cannot chnage the state of the assigned task/assignment from here!</span>
    </div> 
    
    <div className="kanban-board">
      {statusColumns.map((status) => (
        <div
          key={status}
          className="kanban-column"
          id='column-all'
        >
          <h4 className="kanban-title">
            {status.toUpperCase()} (
              {
                tasks.filter(task => task.status === status).length +
                assignments.filter(a => a.status === status).length
              }
            )
          </h4>
          <div className="kanban-items">
            {tasks.filter(task => task.status === status).map(t => renderCard(t, 'task'))}
            {assignments.filter(a => a.status === status).map(a => renderCard(a, 'assignment'))}
          </div>
        </div>
      ))}
    </div>
  </>
  );
};

export default ViewRecords;
