import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./MentorTaskDetailPage.css";

const MentorTaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
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
    fetchData();
  }, [id]);

  if (loading) return <div className="mentor-task-loading">Loading...</div>;
  if (!task) return <div className="mentor-task-error">Task not found.</div>;

  return (
    <div className="mentor-task-root">
      <div className="mentor-task-card">
        <div className="mentor-task-header">
          <button className="mentor-task-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div>
            <span className="mentor-task-title">{task.title}</span>
            <span className={`mentor-task-status mentor-task-status-${task.status}`}>{task.status}</span>
          </div>
        </div>
        <div className="mentor-task-section">
          <b>Description:</b>
          <div className="mentor-task-desc">{task.description}</div>
        </div>
        <div className="mentor-task-info">
          <div><b>Mentee:</b> {task.mentee_first} {task.mentee_last}</div>
          <div><b>Due:</b> {new Date(task.end_time).toLocaleString()}</div>
        </div>
        <div className="mentor-task-section">
          <h3>Activity Timeline</h3>
          <div className="mentor-task-timeline-list">
            {timeline.length === 0 ? (
              <div className="mentor-task-timeline-empty">No activity yet.</div>
            ) : (
              timeline.map(entry => (
                <div key={entry.id} className="mentor-task-timeline-row">
                  <span className={`mentor-task-timeline-dot mentor-task-timeline-dot-${entry.action_type}`}></span>
                  <span className="mentor-task-timeline-type">
                    {entry.action_type.replace('_', ' ')}
                  </span>
                  <span className="mentor-task-timeline-date">
                    {new Date(entry.action_time).toLocaleString()}
                  </span>
                  <span className="mentor-task-timeline-desc">{entry.description}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorTaskDetailPage;
