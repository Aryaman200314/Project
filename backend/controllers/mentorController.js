const db = require('../db');

exports.getAllTasks = (req, res) => {
  db.query('SELECT * FROM tasks', (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(results);
  });
};

exports.approveTask = (req, res) => {
  const { taskId } = req.body;

  db.query('UPDATE tasks SET approved = 1 WHERE id = ?', [taskId], (err) => {
    if (err) return res.status(500).json({ error: 'Approval failed' });
    res.json({ message: 'Task approved' });
  });
};

exports.assignTask = (req, res) => {
  const { mentee_id, title, deadline } = req.body;

  db.query(
    'INSERT INTO tasks (mentee_id, title, deadline, completed, approved) VALUES (?, ?, ?, 0, 0)',
    [mentee_id, title, deadline],
    (err) => {
      if (err) return res.status(500).json({ error: 'Assignment failed' });
      res.json({ message: 'Task assigned' });
    }
  );
};
