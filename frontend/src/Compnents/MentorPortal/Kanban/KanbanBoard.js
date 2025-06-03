import React, { useEffect, useState } from "react";
import axios from "axios";

const statuses = ['backlog', 'pending', 'review', 'done'];

const KanbanBoard = ({ type = 'tasks', userId, role }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Fetch tasks or assignments based on role
    const url =
      role === 'mentor'
        ? `/api/${type}/mentor/${userId}`
        : `/api/${type}/mentee/${userId}`;
    axios.get(url)
      .then(res => setItems(res.data))
      .catch(() => setItems([]));
  }, [type, userId, role]);

  // Move item to next status
  const moveToNext = (item) => {
    const currIndex = statuses.indexOf(item.status);
    if (currIndex === statuses.length - 1) return;
    const newStatus = statuses[currIndex + 1];
    axios.put(`/api/${type}/${item.id}/status`, { status: newStatus })
      .then(() => {
        setItems(prev =>
          prev.map(it => (it.id === item.id ? { ...it, status: newStatus } : it))
        );
      });
  };

  return (
    <div style={{ display: "flex", gap: 20 }}>
      {statuses.map(status => (
        <div key={status} style={{ flex: 1 }}>
          <h3>{status.toUpperCase()}</h3>
          <div>
            {items.filter(it => it.status === status).map(it => (
              <div key={it.id} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}>
                <h4>{it.title}</h4>
                <p>{it.description}</p>
                <p><b>End Time:</b> {it.end_time}</p>
                {/* Show "Move to Next" if not done */}
                {status !== 'done' && (
                  <button onClick={() => moveToNext(it)}>
                    Move to {statuses[statuses.indexOf(status) + 1]}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
