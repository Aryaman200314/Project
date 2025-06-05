import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Assignment.css";

const STATUS_COLORS = {
  new: "#f0f5ff",
  inprogress: "#fff4e3",
  backlog: "#e5f7ee",
  pending: "#f7f5e3",
  review: "#e3e8ff",
  done: "#ffe3e3",
};

const Assignment = () => {
  const userEmail = localStorage.getItem("userEmail");
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState("All");
  const [checkinText, setCheckinText] = useState("");
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // For showing timeline (optional)
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/assignments/by-mentee?email=${userEmail}`)
      .then((res) => setAssignments(res.data))
      .catch(() => setAssignments([]));
  }, [userEmail]);

  // Fetch timeline for selected assignment
  useEffect(() => {
    if (selected) {
      axios
        .get(`http://localhost:5000/api/assignments/${selected.id}/activity`)
        .then((res) => setTimeline(res.data))
        .catch(() => setTimeline([]));
    } else {
      setTimeline([]);
    }
  }, [selected]);

  // Filter assignments
  const filtered = assignments.filter(
    (a) =>
      (filters === "All" || a.status === filters.toLowerCase()) &&
      (a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Unique statuses for buttons
  const statusList = [
    "All",
    ...new Set(
      assignments.map(
        (a) => a.status.charAt(0).toUpperCase() + a.status.slice(1)
      )
    ),
  ];

  // Handles check-in or review request
  const handleSubmit = async (action) => {
    if (!selected) return;
    setIsLoading(true);
    try {
      const api =
        action === "checkin"
          ? `http://localhost:5000/api/assignments/${selected.id}/checkin`
          : `http://localhost:5000/api/assignments/${selected.id}/ask-review`;
      await axios.post(api, {
        mentee_email: userEmail,
        description: checkinText,
      });
      alert(
        action === "checkin"
          ? "Check-in saved!"
          : "Review request sent to mentor."
      );
      setIsCheckinOpen(false);
      setCheckinText("");
      // Update status locally for inprogress or review
      if (action === "checkin") {
        setAssignments(prev =>
          prev.map(item =>
            item.id === selected.id ? { ...item, status: "inprogress" } : item
          )
        );
        setSelected(prev => prev ? { ...prev, status: "inprogress" } : prev);
      } else if (action === "review") {
        setAssignments(prev =>
          prev.map(item =>
            item.id === selected.id ? { ...item, status: "review" } : item
          )
        );
        setSelected(prev => prev ? { ...prev, status: "review" } : prev);
      }
      // Optionally refresh activity log here...
    } catch (err) {
      alert(
        action === "checkin"
          ? "Failed to save check-in."
          : "Failed to send review request."
      );
    } finally {
      setIsLoading(false);
    }
  };  
  
  return (
    <div className="assign-root">
      <div className="assign-sidebar">
        <h2 className="assign-title">
          Assignments <span className="assign-sub">Assigned to you</span>
        </h2>
        <div className="assign-status-list">
          {statusList.map((status) => (
            <button
              key={status}
              className={`assign-status-btn${filters === status ? " active" : ""}`}
              onClick={() => setFilters(status)}
            >
              {status}
              {status !== "All" && (
                <span className="assign-count">
                  {assignments.filter(
                    (a) => a.status === status.toLowerCase()
                  ).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <input
          className="assign-search"
          placeholder="Search assignments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="assign-list">
          {filtered.length ? (
            filtered.map((a) => (
              <div
                key={a.id}
                className={`assign-card${selected && selected.id === a.id ? " selected" : ""}`}
                onClick={async () => {
                  if (a.status !== "new") {
                    try {
                      await axios.put(
                        `http://localhost:5000/api/assignments/${a.id}/status`,
                        { status: "new" }
                      );
                      setAssignments((prev) =>
                        prev.map((item) =>
                          item.id === a.id ? { ...item, status: "new" } : item
                        )
                      );
                      setSelected({ ...a, status: "new" });
                    } catch (err) {
                      alert("Failed to update status.");
                      setSelected(a);
                    }
                  } else {
                    setSelected(a);
                  }
                }}
              >
                <div className="assign-card-title">{a.title}</div>
                <div className="assign-card-meta">
                  <span
                    className={`assign-tag`}
                    style={{ background: STATUS_COLORS[a.status] || "#eee" }}
                  >
                    {a.status}
                  </span>
                  <span className="assign-card-date">
                    {new Date(a.uploaded_at || a.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="assign-empty-list">No assignments found.</div>
          )}
        </div>
        <button className="assign-done-btn">
          Done Assignments ({assignments.filter((a) => a.status === "done").length})
        </button>
      </div>
      <div className="assign-main">
        {selected ? (
          <div className="assign-detail-card full-width">
            {/* Arrow from sidebar */}
            <div className="assign-arrow">
              <svg viewBox="0 0 48 48" fill="none">
                <path
                  d="M6 24h36M30 12l12 12-12 12"
                  stroke="#5562eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="title-assignment">{selected.title}</h3>
            <div>
              <b>Description:</b>{" "}
              <div className="description-assignment">{selected.description}</div>
            </div>
            <div>
              <b>Status:</b>{" "}
              <span
                className="assign-detail-status"
                style={{
                  background: STATUS_COLORS[selected.status] || "#eee",
                }}
              >
                {selected.status}
              </span>
            </div>
            <div>
              <b>Assigned by: </b> {selected.mentor_first}
            </div>
            <div>
              <b>Assigned at: </b>{" "}
              {new Date(selected.uploaded_at || selected.created_at).toLocaleString()}
            </div>
            <div>
              <b>End date: </b> {new Date(selected.end_time).toLocaleString()}
            </div>
            <div style={{ marginTop: "30px" }}>
              <b style={{ fontSize: "1.14em" }}>Daily Check-In:</b>
              <button
                style={{
                  background: "#b32634",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 20px",
                  marginLeft: 16,
                  fontWeight: 600,
                  fontSize: "1em",
                  cursor: "pointer",
                }}
                onClick={() => setIsCheckinOpen(true)}
                disabled={isCheckinOpen}
              >
                Check-In
              </button>
            </div>

            {isCheckinOpen && (
              <form
                style={{
                  background: "#fff",
                  marginTop: 24,
                  borderRadius: 12,
                  boxShadow: "0 2px 10px rgba(60, 80, 130, 0.07)",
                  padding: 24,
                  maxWidth: 1100,
                }}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit("checkin");
                }}
              >
                <textarea
                  placeholder="Describe your progress for today..."
                  style={{
                    width: "100%",
                    minHeight: "90px",
                    fontSize: "1.05em",
                    padding: "14px",
                    marginBottom: 20,
                    borderRadius: 6,
                    border: "1px solid #d5d9ee",
                    resize: "vertical",
                  }}
                  value={checkinText}
                  onChange={(e) => setCheckinText(e.target.value)}
                  required
                />
                <div style={{ display: "flex", gap: 16 }}>
                  <button
                    type="submit"
                    style={{
                      background: "#1976ed",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 24px",
                      fontWeight: 600,
                      fontSize: "1em",
                      cursor: "pointer",
                    }}
                    disabled={isLoading}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    style={{
                      background: "#1976ed",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 24px",
                      fontWeight: 600,
                      fontSize: "1em",
                      cursor: "pointer",
                    }}
                    disabled={isLoading}
                    onClick={() => handleSubmit("review")}
                  >
                    Ask for Review
                  </button>
                  <button
                    type="button"
                    style={{
                      background: "#d32f2f",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 24px",
                      fontWeight: 600,
                      fontSize: "1em",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setIsCheckinOpen(false);
                      setCheckinText("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {selected.file_url && (
              <div>
                <a
                  className="assign-detail-link"
                  href={selected.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Assignment PDF
                </a>
              </div>
            )}

            {/* Activity Timeline (Optional) */}
            <div style={{ marginTop: 48 }}>
  <b style={{ fontSize: "1.08em" }}>Activity Timeline</b>
  <div
    style={{
      marginTop: 16,
      maxHeight: 300,      // set your preferred height here
      overflowY: "auto",
      paddingRight: 8,     // for scrollbar space
      borderRadius: 8,
      background: "#f7f9fe",
      boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      border: "1px solid #eaeef9",
    }}
  >
    {timeline.length === 0 ? (
      <div style={{ color: "#888", fontStyle: "italic", marginTop: 10 }}>
        No activity yet.
      </div>
    ) : (
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        {timeline.map((log, i) => (
          <li key={log.id || i} style={{ marginBottom: 14 }}>
            <span
              style={{
                fontWeight: 600,
                marginRight: 14,
                color: log.action_type === "checkin" ? "#1976ed" : "#b32634",
              }}
            >
              {log.action_type === "checkin" ? "Check-In" : "Ask Review"}
            </span>
            <span style={{ color: "#555" }}>
              {new Date(log.action_time).toLocaleString()}
            </span>
            <div style={{ marginTop: 2 }}>{log.description}</div>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>

          </div>
        ) : (
          <div className="assign-placeholder">
            <div>
              Select an assignment to see details
              <br />
              <span>
                If you open an assignment it will move to NEW state if it was not started
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignment;
