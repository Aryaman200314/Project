import React, { useEffect, useState } from 'react';
import './UploadTask.css';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

// Inside your component

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
  const [timeline, setTimeline] = useState([]);
  const [showDone, setShowDone] = useState(false);

  const navigate = useNavigate();
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

  useEffect(() => {
    if (selected) {
      axios.get(`http://localhost:5000/api/task-activity/${selected.id}`)
        .then(res => setTimeline(res.data))
        .catch(() => setTimeline([]));
    } else {
      setTimeline([]);
    }
  }, [selected]);

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
    if (!selected || !checkinText.trim()) {
      alert('Test box is empty!')
      return
    };  // <-- block if empty!
    await axios.post('http://localhost:5000/api/task-activity', {
      task_id: selected.id,
      mentee_email: userEmail,
      action_type: "checkin",
      old_value: null,
      new_value: checkinText,
      description: "Daily check-in"
    });
    setShowCheckin(false);
    setCheckinText('');
  };
  const handleAskReview = async () => {
    if (!selected || !checkinText.trim()) {
      alert('Text box is empty!')
      return
    }; // Block if nothing to submit

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
  {filtered
    .filter(task => task.status !== 'done')
    .map(task => (
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
  {filtered.filter(task => task.status !== 'done').length === 0 && (
    <div className="taskpage-empty">No tasks found.</div>
  )}
</div>

        <div>
          {selected && timeline.length > 0 && (
            <div className="sidebar-timeline">
              <h4 className="mini-timeline-title">Recent Activity</h4>
              <ul className="mini-timeline-list">
                {timeline.slice(0, 5).map(log => ( // show only last 4
                  <li key={log.id} className="mini-timeline-entry">
                    <span className="mini-timeline-action">{log.action_type}</span>
                    <span className="mini-timeline-time">
                      {log.action_time} {/* or .toLocaleString() */}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
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
          <>
            <div className="no-details">Select a task to see details
              <p>If you open a task it will move to NEW  state which means now the task has started</p>
            </div>

          </>
        )}
      </div>
      <div>
        {tasks.some(t => t.status === 'done') && (
          <div className="done-tasks-dropbar">
            <button className="done-task-btn" onClick={() => setShowDone(!showDone)}>
              Done Tasks ({tasks.filter(t => t.status === 'done').length})
            </button>
            {showDone && (
              <div className="done-tasks-list">
                {tasks.filter(t => t.status === 'done').map(task => (
                  <div key={task.id} className="done-task-item">
                    <div id='done-task-btn-div' onClick={() => navigate(`/task/${task.id}`)}>{task.title} </div>
                    {/* Optionally: add a way to view details or restore */}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default UploadTask;
