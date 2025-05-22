const db = require('../db');

exports.getTasks = (req, res) => {
  const menteeId = req.params.id;

  db.query('SELECT * FROM tasks WHERE mentee_id = ?', [menteeId], (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(results);
  });
};

exports.markComplete = (req, res) => {
  const { taskId } = req.body;

  db.query('UPDATE tasks SET completed = 1 WHERE id = ?', [taskId], (err) => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ message: 'Task marked complete' });
  });
};
