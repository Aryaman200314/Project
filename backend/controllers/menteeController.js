const db = require('../db');

// Get all tasks for a specific mentee
const getTasks = (req, res) => {
  const menteeId = req.params.id;

  db.query('SELECT * FROM tasks WHERE mentee_id = ?', [menteeId], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(results);
  });
};

// Mark a task as complete
const markComplete = (req, res) => {
  const { taskId } = req.body;

  db.query('UPDATE tasks SET completed = 1 WHERE id = ?', [taskId], (err) => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ message: 'Task marked complete' });
  });
};

// Get mentee by ID
const getMenteeById = (req, res) => {
  const id = req.params.id;

  db.query('SELECT * FROM mentees WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Mentee not found' });
    }

    res.status(200).json(results[0]);
  });
};

module.exports = {
  getTasks,
  markComplete,
  getMenteeById
};
