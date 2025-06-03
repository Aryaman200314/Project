import React, { useEffect, useState } from "react";
import axios from "axios";

// Column titles and their header colors
const statuses = [
  { key: 'backlog', label: 'Backlog', color: '#f57c8a' },     // Red/Pink
  { key: 'pending', label: 'Doing', color: '#ffe066' },       // Yellow
  { key: 'review', label: 'Review', color: '#8ae99e' },       // Green
  { key: 'done', label: 'Done', color: '#81ecec' }            // Blue
];

const KanbanBoard = ({ type = "tasks", userId, role }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const url =
      role === 'mentor'
        ? `/api/${type}/mentor/${userId}`
        : `/api/${type}/mentee/${userId}`;
    axios.get(url)
      .then(res => setItems(res.data))
      .catch(() => setItems([]));
  }, [type, userId, role]);

  const moveToNext = (item) => {
    const currIndex = statuses.findIndex(st => st.key === item.status);
    if (currIndex === statuses.length - 1) return;
    const newStatus = statuses[currIndex + 1].key;
    axios.put(`/api/${type}/${item.id}/status`, { status: newStatus })
      .then(() => {
        setItems(prev =>
          prev.map(it => (it.id === item.id ? { ...it, status: newStatus } : it))
        );
      });
  };

  return (
    <div style={{ padding: "36px 0" }}>
      <h2 style={{ textAlign: "center", marginBottom: 36, fontSize: 32, fontWeight: "bold" }}>Kanban Board</h2>
      <div style={{ display: "flex", gap: 28, justifyContent: "center" }}>
        {statuses.map((status) => (
          <div key={status.key} style={{ flex: 1, minWidth: 240, maxWidth: 280 }}>
            <div
              style={{
                textAlign: "center",
                background: status.color,
                color: "#222",
                fontWeight: "bold",
                fontSize: 22,
                borderRadius: "14px 14px 0 0",
                padding: "14px 0 10px 0",
                marginBottom: 0
              }}
            >
              {status.label}
            </div>
            <div style={{
              background: "#f7f7f7",
              minHeight: 420,
              padding: 16,
              borderRadius: "0 0 14px 14px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
            }}>
              {items.filter(it => it.status === status.key).map(it => (
                <div key={it.id}
                  style={{
                    background: "#fff",
                    marginBottom: 20,
                    borderRadius: 14,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.09)",
                    padding: 18,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8
                  }}>
                  <div style={{ fontWeight: "bold", fontSize: 16 }}>{it.title}</div>
                  {it.description && <div style={{ color: "#555", fontSize: 14 }}>{it.description}</div>}
                  {it.filename &&
                    <a
                      href={`/uploads/${it.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#007bff",
                        textDecoration: "underline",
                        fontSize: 14
                      }}>
                      Download
                    </a>
                  }
                  {/* Action button to move to next stage */}
                  {status.key !== "done" && (
                    <button
                      onClick={() => moveToNext(it)}
                      style={{
                        alignSelf: "flex-end",
                        background: status.color,
                        color: "#222",
                        border: "none",
                        borderRadius: 6,
                        fontWeight: "bold",
                        padding: "7px 16px",
                        cursor: "pointer",
                        marginTop: 6,
                        transition: "background 0.2s"
                      }}>
                      Move to {statuses[statuses.findIndex(st => st.key === status.key) + 1].label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
