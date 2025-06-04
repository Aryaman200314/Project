import React, { useEffect, useState } from 'react';
import './UploadTask.css';
import axios from 'axios';

const statusOptions = ["All", "Backlog", "Pending", "Review", "Inprogress", "Done"];

const UploadTask = () => {
  const userEmail = localStorage.getItem('userEmail');
  const [tasks, setTasks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState(null);
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinText, setCheckinText] = useState('');


  useEffect(() => {
    // Fetch tasks assigned to the user
    axios.get(`http://localhost:5000/api/tasks/by-mentee?email=${userEmail}`)
      .then(res => {
        setTasks(res.data);
        setFiltered(res.data);
      })
      .catch(() => setTasks([]));
  }, [userEmail]);

  useEffect(() => {
    let res = tasks;
    if (status !== 'All') {
      res = res.filter(t => t.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      res = res.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    }
    setFiltered(res);

  }, [tasks, status, search]);
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.post(`http://localhost:5000/api/tasks/update-status`, {
        taskId,
        status: newStatus
      });
      // Optimistically update state
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      );
    } catch (e) {
      // Handle error (optional: toast/error UI)
      console.error("Failed to update status");
    }
  };
  const handleSaveCheckin = async () => {
    if (!selected) return;
    await axios.post('http://localhost:5000/api/task-activity', {
      task_id: selected.id,            // <-- must exist!
      mentee_email: userEmail,         // <-- must exist!
      action_type: "checkin",          // or whatever the action is
      old_value: null,
      new_value: checkinText,          // or whatever the new checkin is
      description: "Daily check-in"    // (optional)
    });    
    setShowCheckin(false);
    setCheckinText('');
    // Optionally, refresh check-in timeline/records
  };
  const handleAskReview = async () => {
    if (!selected) return;
    // 1. Update status to 'review'
    await axios.post('http://localhost:5000/api/tasks/update-status', {
      taskId: selected.id,
      status: 'review'
    });
  
    // 2. Log the activity
    await axios.post('http://localhost:5000/api/task-activity', {
      task_id: selected.id,
      mentee_email: userEmail,
      action_type: "ask_review",
      old_value: selected.status,
      new_value: "review",
      description: checkinText || "Asked mentor for review"
    });
  
    // 3. Update local state for instant UI feedback
    setTasks(prev =>
      prev.map(t => t.id === selected.id ? { ...t, status: "review" } : t)
    );
    setShowCheckin(false);
    setCheckinText('');
  };

  return (
    <div className="taskpage-root">
      <div className="taskpage-sidebar">
        <h2>Tasks <span className='extra'>Assigned to you</span></h2>
        <div className="taskpage-filters">
          {statusOptions.map(opt => (
            <button
              key={opt}
              className={status === opt ? "active" : ""}
              onClick={() => setStatus(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="taskpage-search"
        />
        <div className="taskpage-list">
          {filtered.map(task => (
            <div
              className={`taskpage-item ${selected && task.id === selected.id ? "selected" : ""}`}
              key={task.id}
              onClick={() => {
                setSelected(task);
                if (task.status === "backlog") {
                  updateTaskStatus(task.id, "new");
                }
              }}
            >
              <span className="task-title">{task.title}</span>
              <span className={`task-status status-${task.status}`}>{task.status}</span>
            </div>

          ))}
          {filtered.length === 0 && (
            <div className="taskpage-empty">No tasks found.</div>
          )}
        </div>
      </div>
      <div className="taskpage-arrow-area">
        {selected && <div className="taskpage-arrow"></div>}
      </div>
      <div className="taskpage-details">
        {selected ? (
          <div className="details-card">
            <h2>{selected.title}</h2>
            <div className="details-row">
              <b>Status:</b>
              <span className={`status-dot status-${selected.status}`}></span>
              <span>{selected.status}</span>
            </div>
            <div className="details-row">
              <b>Description:</b>
              <div className="details-desc">{selected.description}</div>
            </div>
            <div className="details-row">
              <b>Assigned by:</b>
              <span>{selected.mentor_first} {selected.mentor_last}</span>
            </div>
            <div className="details-row">
              <b>Assigned at:</b>
              <span>{new Date(selected.created_at).toLocaleString()}</span>
            </div>

            <div className="details-row">
              <b>Due:</b>
              <span>{new Date(selected.end_time).toLocaleString()}</span>
            </div>
            <div className="details-row">
              <b>Daily Check-In:</b>
              <button
                className="btn-checkin"
                onClick={() => setShowCheckin(true)}
              >
                Check-In
              </button>
            </div>
            {showCheckin && (
  <div className="checkin-box">
    <textarea
      className='test-area'
      rows={4}
      placeholder="Describe your progress for today..."
      value={checkinText}
      onChange={e => setCheckinText(e.target.value)}
      style={{ width: '100%', padding: 8, borderRadius: 6, marginTop: 10 }}
    />
    <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
      <button className="btn-primary" onClick={handleSaveCheckin}>Save</button>
      <button className="btn-review" onClick={handleAskReview}>Ask for Review</button>
      <button onClick={() => setShowCheckin(false)} className="btn-cancel">Cancel</button>
    </div>
  </div>
)}

          </div>
        ) : (
          <div className="no-details">Select a task to see details</div>
        )}
      </div>
    </div>
  );
};

export default UploadTask;
