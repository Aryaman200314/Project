import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MentorKanban.css';
import { useNavigate } from 'react-router-dom';

const statusColumns = ['new', 'inprogress', 'backlog', 'pending', 'review', 'done'];

const MentorKanban = () => {
  const [tasks, setTasks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const mentorEmail = localStorage.getItem("userEmail");

  const navigate = useNavigate();

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
  }, [mentorEmail]);

  const handleDrop = (e, newStatus) => {
    const data = JSON.parse(e.dataTransfer.getData("text"));
    const { id, type } = data;
  
    let prevStatus = '';
    if (type === 'task') {
      const current = tasks.find(item => item.id === id);
      prevStatus = current.status;
      setTasks(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      axios.put(`http://localhost:5000/api/tasks/${id}/status`, { status: newStatus });
    } else {
      const current = assignments.find(item => item.id === id);
      prevStatus = current.status;
      setAssignments(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      axios.put(`http://localhost:5000/api/assignments/${id}/status`, { status: newStatus });
    }
  
    // Only update counts if status actually changes
    if (prevStatus !== newStatus) {
      // Decrement previous status
      axios.patch(`http://localhost:5000/api/kanban-counts/increment`, {
        type,
        status: prevStatus,
        delta: -1
      });
      // Increment new status
      axios.patch(`http://localhost:5000/api/kanban-counts/increment`, {
        type,
        status: newStatus,
        delta: 1
      });
    }
  };
  

  const renderCard = (item, type) => (
    <div
      key={`${type}-${item.id}`}
      className="kanban-card"
      draggable
      onDragStart={(e) =>
        e.dataTransfer.setData("text", JSON.stringify({ id: item.id, type }))
      }
    >
      <h4>{item.title}</h4>
      <p>{item.description}</p>
      <p><strong>Due:</strong> {new Date(item.end_time).toLocaleString()}</p>
      <p>
        <strong>Mentee:</strong> {item.mentee_name || item.mentee_email || item.mentee_first || item.mentee}
      </p>
      <span className={`tag ${type}`}>{type.toUpperCase()}</span>
      <button
        className="view-btn"
        onClick={() => navigate(`/mentor/tasks/${item.id}`)}
      >
        View Details
      </button>
    </div>
  );

  return (
    <>
      <div className="kanban-board">
        {statusColumns.map((status) => (
          <div
            key={status}
            className="kanban-column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
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

      {selectedItem && (
        <div className="popup-overlay" onClick={() => setSelectedItem(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
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
