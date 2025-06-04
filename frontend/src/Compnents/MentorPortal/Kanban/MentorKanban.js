import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MentorKanban.css';

const statusColumns = ['backlog', 'pending', 'review', 'done'];

const MentorKanban = () => {
  const [tasks, setTasks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // for popup
  const mentorEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!mentorEmail) {
      console.warn("No mentor email found in localStorage!");
      return;
    }

    axios.get(`http://localhost:5000/api/tasks/by-mentor?email=${mentorEmail}`)
      .then(res => setTasks(res.data))
      .catch(err => console.error("Error fetching tasks", err));

    axios.get(`http://localhost:5000/api/assignments/by-mentor?email=${mentorEmail}`)
      .then(res => setAssignments(res.data))
      .catch(err => console.error("Error fetching assignments", err));
  }, []);

  const renderCard = (item, type) => (
    <div key={`${type}-${item.id}`} className="kanban-card">
      <h4>{item.title}</h4>
      <p>{item.description}</p>
      <p><strong>Due:</strong> {new Date(item.end_time).toLocaleString()}</p>
      <p><strong>Mentee:</strong> {item.mentee_name || item.mentee_email}</p>
      <span className={`tag ${type}`}>{type.toUpperCase()}</span>
      <button className="view-btn" onClick={() => setSelectedItem({ ...item, type })}>View Details</button>
    </div>
  );

  return (
    <>
      <div className="kanban-board">
        {statusColumns.map((status) => (
          <div key={status} className="kanban-column">
            <h3 className="kanban-title">{status.toUpperCase()}</h3>
            <div className="kanban-items">
              {tasks.filter(task => task.status === status).map(t => renderCard(t, 'task'))}
              {assignments.filter(a => a.status === status).map(a => renderCard(a, 'assignment'))}
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="popup-overlay" onClick={() => setSelectedItem(null)}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <h3>{selectedItem.title}</h3>
            <p><strong>Type:</strong> {selectedItem.type}</p>
            <p><strong>Description:</strong> {selectedItem.description}</p>
            <p><strong>Status:</strong> {selectedItem.status}</p>
            <p><strong>Created:</strong> {new Date(selectedItem.created_at).toLocaleString()}</p>
            <p><strong>End Time:</strong> {new Date(selectedItem.end_time).toLocaleString()}</p>
            <p><strong>Mentee:</strong> {selectedItem.mentee_name || selectedItem.mentee_email}</p>

            <button onClick={() => setSelectedItem(null)} className="close-popup-btn">Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default MentorKanban;
