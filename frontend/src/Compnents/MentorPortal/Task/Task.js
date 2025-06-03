import React, { useState, useEffect } from "react";
import axios from "axios";
const mentorId = localStorage.getItem("userId");


const Task = ({ mentorId }) => {
  const [mentees, setMentees] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    end_time: "",
    mentee_id: ""
  });

  useEffect(() => {
    axios.get('http://localhost:5000/api/mentees')
      .then(res => setMentees(res.data))
      .catch(() => setMentees([]));
  }, []);
  

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const mentorEmail = localStorage.getItem("userEmail"); // logged-in mentor's email
  
    const payload = {
      title: form.title,
      description: form.description,
      end_time: form.end_time,
      mentor_email: mentorEmail,
      mentee_email: form.mentee_email, // selected mentee email from dropdown
    };
  
    console.log("Submitting:", payload);
  
    try {
      const res = await axios.post("http://localhost:5000/api/tasks/by-email", payload);
      alert("✅ Task Assigned Successfully!");
      setForm({ title: "", description: "", end_time: "", mentee_email: "" });
    } catch (err) {
      console.error("Error assigning task:", err);
      alert("❌ Failed to assign task.");
    }
  };
  
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", marginTop: 60
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 36,
          borderRadius: 10,
          boxShadow: "0 4px 18px rgba(0,0,0,0.11)",
          minWidth: 350
        }}>
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>Assign Task</h2>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Task Title"
          style={{ width: "100%", padding: 10, marginBottom: 16 }}
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Task Description"
          rows={3}
          style={{ width: "100%", padding: 10, marginBottom: 16 }}
        />
        {/* NEW: End Time */}
        <label style={{ marginBottom: 4, fontWeight: 500 }}>End Time</label>
        <input
          type="datetime-local"
          name="end_time"
          value={form.end_time}
          onChange={handleChange}
          style={{ width: "100%", padding: 10, marginBottom: 16 }}
        />
        <select
          name="mentee_email"
          value={form.mentee_email}
          onChange={handleChange}
          style={{ width: "100%", padding: 10, marginBottom: 16 }}>
          <option value="">Assign To</option>
          {mentees.map(m => (
            <option key={m.id} value={m.email}>{m.name} ({m.email})</option>
          ))}
        </select>

        <button
          type="submit"
          style={{
            width: "100%",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            fontSize: 16,
            padding: 12,
            marginTop: 10,
            cursor: "pointer"
          }}>
          Assign Task
        </button>
      </form>
    </div>
  );
};

export default Task;
