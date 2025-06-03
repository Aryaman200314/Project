// src/pages/Task.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Task = () => {
  const [mentees, setMentees] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    menteeId: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/api/mentees')
      .then(res => setMentees(res.data))
      .catch(err => console.error("Failed to fetch mentees", err));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/tasks', formData)
      .then(() => navigate('/mentor/home'))
      .catch(err => alert("Failed to assign task."));
  };

  return (
    <div className="form-container">
      <h2>Assign Task</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Task Title" onChange={handleChange} required />
        <textarea name="description" placeholder="Task Description" onChange={handleChange} required />
        <select name="menteeId" onChange={handleChange} required>
          <option value="">Assign To</option>
          {mentees.map(m => (
            <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
          ))}
        </select>
        <button type="submit">Assign Task</button>
      </form>
    </div>
  );
};

export default Task;
