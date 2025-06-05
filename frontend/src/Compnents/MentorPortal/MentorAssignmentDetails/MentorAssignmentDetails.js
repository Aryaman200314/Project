import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./MentorAssignmentDetails.css"; // Add CSS as below

const STATUS_COLORS = {
  new: "#d3f7c3",
  inprogress: "#fff4e3",
  backlog: "#e5f7ee",
  pending: "#f7f5e3",
  review: "#e3e8ff",
  done: "#ffe3e3",
};

const MentorAssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [detailRes, timelineRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/assignments/${id}`),
          axios.get(`http://localhost:5000/api/assignments/${id}/activity`),
        ]);
        setAssignment(detailRes.data);
        setTimeline(timelineRes.data);
      } catch {
        setAssignment(null);
        setTimeline([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="mentor-assignment-loading">Loading...</div>;
  if (!assignment)
    return (
      <div className="mentor-assignment-error">
        Assignment not found.
        <button onClick={() => navigate(-1)} style={{ marginLeft: 16 }}>Back</button>
      </div>
    );

  return (
    <div className="mentor-assignment-root">
      <div className="mentor-assignment-card">
        <div className="mentor-assignment-header">
          <button className="mentor-back-btn" onClick={() => navigate(-1)}>
            &larr; Back
          </button>
          <h2 className="mentor-assignment-title">{assignment.title}</h2>
          <span
            className="mentor-assignment-status"
            style={{ background: STATUS_COLORS[assignment.status] || "#eee" }}
          >
            {assignment.status?.charAt(0).toUpperCase() +
              assignment.status?.slice(1)}
          </span>
        </div>
        <div className="mentor-assignment-section">
          <b>Description:</b>
          <div className="mentor-assignment-desc">{assignment.description}</div>
        </div>
        <div className="mentor-assignment-details">
          <div>
            <b>Mentee:</b> {assignment.mentee_name || assignment.mentee_email}
          </div>
          <div>
            <b>Uploaded:</b>{" "}
            {new Date(assignment.uploaded_at || assignment.created_at).toLocaleString()}
          </div>
          <div>
            <b>Due:</b> {assignment.end_time && new Date(assignment.end_time).toLocaleString()}
          </div>
        </div>
        {assignment.file_url && (
          <div style={{ margin: "16px 0" }}>
            <a
              className="mentor-assignment-link"
              href={assignment.file_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Assignment PDF
            </a>
          </div>
        )}

        <div className="mentor-assignment-section" style={{ marginTop: 32 }}>
          <b style={{ fontSize: "1.08em" }}>Activity Timeline</b>
          <div className="mentor-assignment-timeline">
            {timeline.length === 0 ? (
              <div className="mentor-assignment-empty">No activity yet.</div>
            ) : (
              <ul>
                {timeline.map((log, i) => (
                  <li key={log.id || i}>
                    <span
                      className="mentor-assignment-timeline-type"
                      style={{
                        color: log.action_type === "checkin" ? "#1976ed" : "#b32634",
                        fontWeight: 600,
                        marginRight: 10,
                      }}
                    >
                      {log.action_type === "checkin" ? "Check-In" : "Ask Review"}
                    </span>
                    <span className="mentor-assignment-timeline-date">
                      {new Date(log.action_time).toLocaleString()}
                    </span>
                    <div className="mentor-assignment-timeline-desc">{log.description}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorAssignmentDetail;
