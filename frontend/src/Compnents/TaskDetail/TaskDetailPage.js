import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./TaskDetailPage.css";

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTask() {
      setLoading(true);
      try {
        const [taskRes, timelineRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/tasks/${id}`),
          axios.get(`http://localhost:5000/api/task-activity/${id}`)
        ]);
        setTask(taskRes.data);
        setTimeline(timelineRes.data);
      } catch {
        setTask(null);
        setTimeline([]);
      }
      setLoading(false);
    }
    fetchTask();
  }, [id]);

  if (loading) return <div className="td-loading">Loading...</div>;
  if (!task) return <div className="td-error">Task not found.</div>;

  return (
    <div className="td-root">
      <div className="td-card">
        <div className="td-header-row">
          <button className="td-back" onClick={() => navigate(-1)}>&larr; Back</button>
          <h2 className="td-title">{task.title}</h2>
          <span className={`td-status td-status-${task.status}`}>{task.status}</span>
        </div>
        <div className="td-section">
          <b>Description:</b>
          <div className="td-desc">{task.description}</div>
        </div>
        <div className="td-section td-detail-grid">
          <div>
            <b>Assigned by:</b> {task.mentor_first} {task.mentor_last}
          </div>
          <div>
            <b>Assigned at:</b> {new Date(task.created_at).toLocaleString()}
          </div>
          <div>
            <b>Due:</b> {new Date(task.end_time).toLocaleString()}
          </div>
        </div>
        <div className="td-section td-timeline">
          <h3>Activity Timeline</h3>
          {timeline.length === 0 ? (
            <div className="td-empty">No activity yet.</div>
          ) : (
            <div className="td-timeline-list">
              {timeline.map(log => (
                <div key={log.id} className="td-timeline-row">
                  <div className="td-timeline-action">
                    <span className={`td-dot td-dot-${log.action_type}`}></span>
                    <span className="td-action">{log.action_type.replace('_', ' ')}</span>
                  </div>
                  <span className="td-timeline-time">
                    {new Date(log.action_time).toLocaleString('en-GB', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', second: '2-digit'
                    })}
                  </span>
                  <span className="td-timeline-desc">{log.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
