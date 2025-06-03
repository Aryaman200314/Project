// MentorKanban.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MentorKanban.css';

const statuses = ['Backlog', 'Doing', 'Review', 'Done'];

const MentorKanban = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', type: 'Task' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/mentor/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title) return;
    try {
      const res = await axios.post('http://localhost:5000/api/mentor/tasks', {
        ...newTask,
        status: 'Backlog'
      });
      setTasks([...tasks, res.data]);
      setNewTask({ title: '', type: 'Task' });
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/mentor/tasks/${taskId}`, {
        status: newStatus
      });
      fetchTasks();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <input
          type="text"
          placeholder="Enter title"
          value={newTask.title}
          onChange={e => setNewTask({ ...newTask, title: e.target.value })}
        />
        <select
          value={newTask.type}
          onChange={e => setNewTask({ ...newTask, type: e.target.value })}
        >
          <option value="Task">Task</option>
          <option value="Assignment">Assignment</option>
        </select>
        <button onClick={handleAddTask}>Give</button>
      </div>

      <div className="kanban-board">
        {statuses.map(status => (
          <div className="kanban-column" key={status}>
            <h3>{status}</h3>
            {tasks.filter(task => task.status === status).map(task => (
              <div className="kanban-card" key={task.id}>
                <h4>{task.title}</h4>
                <p>{task.type}</p>
                <select
                  value={task.status}
                  onChange={e => handleStatusChange(task.id, e.target.value)}
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorKanban;
